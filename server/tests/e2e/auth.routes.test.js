import { expect } from "chai";
import sinon from "sinon";
import request from "supertest";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import app from "../../src/app.js";
import { UserModel } from "../../src/models/user.model.js";
import { TermsConfigModel } from "../../src/models/terms-config.model.js";
import { generateRefreshToken } from "../../src/lib/jwt.js";

function stubChainLean(model, method, resolvedValue) {
	return sinon.stub(model, method).returns({
		lean: () => Promise.resolve(resolvedValue),
	});
}

function stubChainSelectLean(model, method, resolvedValue) {
	return sinon.stub(model, method).returns({
		select: () => ({ lean: () => Promise.resolve(resolvedValue) }),
	});
}

function findRefreshCookie(cookies) {
	if (!cookies) return null;
	return cookies.find((c) => c.startsWith("refreshToken="));
}

describe("E2E: /api/auth routes", () => {
	describe("POST /api/auth/register", () => {
		it("201, returns accessToken and sets refreshToken cookie on success", async () => {
			stubChainLean(UserModel, "findOne", null); // user does not exist
			stubChainLean(TermsConfigModel, "findOne", {
				_id: new mongoose.Types.ObjectId(),
				currentVersion: "v1",
			});
			const oid = new mongoose.Types.ObjectId();
			sinon.stub(UserModel, "create").callsFake(async (doc) => ({ _id: oid, ...doc }));
			stubChainLean(UserModel, "findByIdAndUpdate", { _id: oid, refreshToken: "rt" });

			const res = await request(app).post("/api/auth/register").send({
				email: "new@x.com",
				password: "pw",
				name: "New",
				termsAccepted: true,
			});

			expect(res.status).to.equal(201);
			expect(res.body).to.have.property("accessToken").that.is.a("string");
			expect(res.body.user).to.include({ email: "new@x.com", name: "New", role: "USER" });
			expect(findRefreshCookie(res.headers["set-cookie"])).to.match(/refreshToken=.+/);
			expect(findRefreshCookie(res.headers["set-cookie"])).to.match(/HttpOnly/i);
		});

		it("400 when termsAccepted is false", async () => {
			const res = await request(app).post("/api/auth/register").send({
				email: "x@y.com",
				password: "pw",
				name: "X",
				termsAccepted: false,
			});

			expect(res.status).to.equal(400);
			expect(res.body.message).to.match(/Terms/i);
		});

		it("400 when user with email already exists", async () => {
			stubChainLean(UserModel, "findOne", {
				_id: new mongoose.Types.ObjectId(),
				email: "dup@x.com",
			});

			const res = await request(app).post("/api/auth/register").send({
				email: "dup@x.com",
				password: "pw",
				name: "Dup",
				termsAccepted: true,
			});

			expect(res.status).to.equal(400);
			expect(res.body.message).to.equal("User already exists");
		});
	});

	describe("POST /api/auth/login", () => {
		it("200 + accessToken + cookie on valid credentials", async () => {
			const oid = new mongoose.Types.ObjectId();
			stubChainLean(UserModel, "findOne", {
				_id: oid,
				email: "a@b.com",
				password: "hashed",
				name: "A",
				role: "USER",
			});
			sinon.stub(bcrypt, "compare").resolves(true);
			stubChainLean(UserModel, "findByIdAndUpdate", { _id: oid, refreshToken: "rt" });

			const res = await request(app).post("/api/auth/login").send({
				email: "a@b.com",
				password: "pw",
			});

			expect(res.status).to.equal(200);
			expect(res.body.accessToken).to.be.a("string");
			expect(res.body.user).to.not.have.property("password");
			expect(res.body.user).to.not.have.property("refreshToken");
			expect(findRefreshCookie(res.headers["set-cookie"])).to.match(/refreshToken=.+/);
		});

		it("400 on unknown email", async () => {
			stubChainLean(UserModel, "findOne", null);

			const res = await request(app).post("/api/auth/login").send({
				email: "ghost@x.com",
				password: "pw",
			});

			expect(res.status).to.equal(400);
			expect(res.body.message).to.equal("Invalid email or password");
		});

		it("400 on wrong password", async () => {
			stubChainLean(UserModel, "findOne", {
				_id: new mongoose.Types.ObjectId(),
				email: "a@b.com",
				password: "hashed",
				role: "USER",
			});
			sinon.stub(bcrypt, "compare").resolves(false);

			const res = await request(app).post("/api/auth/login").send({
				email: "a@b.com",
				password: "wrong",
			});

			expect(res.status).to.equal(400);
			expect(res.body.message).to.equal("Invalid email or password");
		});
	});

	describe("POST /api/auth/refresh", () => {
		it("200 + new accessToken when valid refresh cookie + stored token matches", async () => {
			const oid = new mongoose.Types.ObjectId();
			const refreshToken = generateRefreshToken({
				userId: oid.toString(),
				email: "a@b.com",
				role: "USER",
			});

			// validateRefreshToken: findById(...).select(...).lean()
			stubChainSelectLean(UserModel, "findById", { refreshToken });
			// findUserByEmail: findOne(...).lean()
			stubChainLean(UserModel, "findOne", {
				_id: oid,
				email: "a@b.com",
				role: "USER",
			});
			// updateRefreshToken: findByIdAndUpdate(...).lean()
			stubChainLean(UserModel, "findByIdAndUpdate", { _id: oid, refreshToken: "new" });

			const res = await request(app)
				.post("/api/auth/refresh")
				.set("Cookie", [`refreshToken=${refreshToken}`]);

			expect(res.status).to.equal(200);
			expect(res.body.accessToken).to.be.a("string");
		});

		it("401 when refresh cookie is missing", async () => {
			const res = await request(app).post("/api/auth/refresh");
			expect(res.status).to.equal(401);
			expect(res.body.message).to.equal("Refresh token missing");
		});

		it("403 when refresh JWT is invalid", async () => {
			const res = await request(app)
				.post("/api/auth/refresh")
				.set("Cookie", ["refreshToken=garbage.jwt.value"]);
			expect(res.status).to.equal(403);
			expect(res.body.message).to.equal("Session Expired");
		});

		it("403 when token verifies but stored token does not match", async () => {
			const oid = new mongoose.Types.ObjectId();
			const refreshToken = generateRefreshToken({
				userId: oid.toString(),
				email: "a@b.com",
				role: "USER",
			});
			// stored token differs from the one in the cookie
			stubChainSelectLean(UserModel, "findById", { refreshToken: "different" });

			const res = await request(app)
				.post("/api/auth/refresh")
				.set("Cookie", [`refreshToken=${refreshToken}`]);

			expect(res.status).to.equal(403);
			expect(res.body.message).to.equal("Invalid refresh token");
		});
	});

	describe("POST /api/auth/logout", () => {
		it("200 and clears cookie when valid refresh cookie present", async () => {
			const oid = new mongoose.Types.ObjectId();
			const refreshToken = generateRefreshToken({
				userId: oid.toString(),
				email: "a@b.com",
				role: "USER",
			});
			stubChainLean(UserModel, "findByIdAndUpdate", { _id: oid, refreshToken: null });

			const res = await request(app)
				.post("/api/auth/logout")
				.set("Cookie", [`refreshToken=${refreshToken}`]);

			expect(res.status).to.equal(200);
			expect(res.body.message).to.equal("Logged out successfully");
			const cookie = findRefreshCookie(res.headers["set-cookie"]);
			expect(cookie).to.match(/refreshToken=;/);
		});

		it("200 even when no refresh cookie is present (idempotent)", async () => {
			const res = await request(app).post("/api/auth/logout");
			expect(res.status).to.equal(200);
			expect(res.body.message).to.equal("Logged out successfully");
		});

		it("200 even when refresh token is invalid (errors swallowed)", async () => {
			const debugStub = sinon.stub(console, "debug");
			const res = await request(app)
				.post("/api/auth/logout")
				.set("Cookie", ["refreshToken=not.a.valid.jwt"]);

			expect(res.status).to.equal(200);
			expect(res.body.message).to.equal("Logged out successfully");
			debugStub.restore();
		});
	});
});
