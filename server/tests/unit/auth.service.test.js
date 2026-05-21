import { expect } from "chai";
import sinon from "sinon";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserModel } from "../../src/models/user.model.js";
import { TermsConfigModel } from "../../src/models/terms-config.model.js";
import {
	hashPassword,
	comparePassword,
	findUserByEmail,
	createUser,
	updateRefreshToken,
	validateRefreshToken,
} from "../../src/services/auth.service.js";

// Helper: stub a Mongoose chain ending in .lean()
function stubChainLean(model, method, resolvedValue) {
	return sinon.stub(model, method).returns({
		lean: () => Promise.resolve(resolvedValue),
	});
}

// Helper for findById(...).select(...).lean()
function stubChainSelectLean(model, method, resolvedValue) {
	return sinon.stub(model, method).returns({
		select: () => ({ lean: () => Promise.resolve(resolvedValue) }),
	});
}

// Helper: stub TermsConfigModel.findOne (no chain — code awaits the query directly
// and then calls .toObject() / .save() on the returned doc).
// `content` is pre-set so the backfill branch in consent.service won't call .save().
function stubTermsConfigFindOne(currentVersion = "v1") {
	const doc = {
		_id: new mongoose.Types.ObjectId(),
		currentVersion,
		content: "<p>seed</p>",
		updatedAt: new Date(),
		toObject() {
			return {
				_id: this._id,
				currentVersion: this.currentVersion,
				content: this.content,
				updatedAt: this.updatedAt,
			};
		},
		save: sinon.stub().resolvesThis(),
	};
	return sinon.stub(TermsConfigModel, "findOne").resolves(doc);
}

describe("services/auth.service", () => {
	describe("hashPassword / comparePassword", () => {
		it("hashPassword returns a bcrypt hash that comparePassword matches", async () => {
			const hash = await hashPassword("s3cret!");
			expect(hash).to.be.a("string").and.not.equal("s3cret!");
			expect(await comparePassword("s3cret!", hash)).to.equal(true);
		});

		it("comparePassword returns false on wrong password", async () => {
			const hash = await bcrypt.hash("right", 4);
			expect(await comparePassword("wrong", hash)).to.equal(false);
		});
	});

	describe("findUserByEmail", () => {
		it("returns mapped user with id (from _id) when found", async () => {
			const oid = new mongoose.Types.ObjectId();
			stubChainLean(UserModel, "findOne", { _id: oid, email: "a@b.com", name: "A" });
			const user = await findUserByEmail("a@b.com");
			expect(user).to.deep.equal({ id: oid.toString(), email: "a@b.com", name: "A" });
		});

		it("returns null when no user is found", async () => {
			stubChainLean(UserModel, "findOne", null);
			const user = await findUserByEmail("missing@x.com");
			expect(user).to.equal(null);
		});
	});

	describe("createUser", () => {
		it("creates a user with consent fields when termsAccepted=true", async () => {
			const oid = new mongoose.Types.ObjectId();
			stubTermsConfigFindOne("v1");
			sinon.stub(UserModel, "create").callsFake(async (doc) => ({
				_id: oid,
				...doc,
			}));

			const result = await createUser({
				email: "new@x.com",
				password: "hashed",
				name: "New",
				termsAccepted: true,
			});

			expect(result).to.deep.include({
				id: oid.toString(),
				email: "new@x.com",
				name: "New",
				role: "USER",
				consentAccepted: true,
				consentVersion: "v1",
			});
			expect(UserModel.create.firstCall.args[0]).to.include({
				email: "new@x.com",
				password: "hashed",
				consentAccepted: true,
				consentVersion: "v1",
			});
		});

		it("does not fetch terms version when termsAccepted=false", async () => {
			const oid = new mongoose.Types.ObjectId();
			const termsStub = stubTermsConfigFindOne("v1");
			sinon.stub(UserModel, "create").callsFake(async (doc) => ({ _id: oid, ...doc }));

			const result = await createUser({
				email: "x@y.com",
				password: "hashed",
				name: "X",
				termsAccepted: false,
			});

			expect(termsStub.called).to.equal(false);
			expect(result.consentAccepted).to.equal(false);
			expect(result.consentVersion).to.equal(null);
		});
	});

	describe("updateRefreshToken", () => {
		it("issues $set update with the new refresh token", async () => {
			const oid = new mongoose.Types.ObjectId();
			const stub = stubChainLean(UserModel, "findByIdAndUpdate", { _id: oid, refreshToken: "rt" });

			const result = await updateRefreshToken(oid.toString(), "rt");

			expect(stub.firstCall.args[0]).to.equal(oid.toString());
			expect(stub.firstCall.args[1]).to.deep.equal({ $set: { refreshToken: "rt" } });
			expect(stub.firstCall.args[2]).to.deep.equal({ new: true });
			expect(result.id).to.equal(oid.toString());
		});
	});

	describe("validateRefreshToken", () => {
		it("returns true when stored refresh token matches", async () => {
			stubChainSelectLean(UserModel, "findById", { refreshToken: "abc" });
			expect(await validateRefreshToken("u1", "abc")).to.equal(true);
		});

		it("returns false when stored token differs", async () => {
			stubChainSelectLean(UserModel, "findById", { refreshToken: "xyz" });
			expect(await validateRefreshToken("u1", "abc")).to.equal(false);
		});

		it("returns false when user not found", async () => {
			stubChainSelectLean(UserModel, "findById", null);
			expect(await validateRefreshToken("u1", "abc")).to.equal(false);
		});
	});
});
