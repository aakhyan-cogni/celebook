import { expect } from "chai";
import jwt from "jsonwebtoken";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	generateTokens,
} from "../../src/lib/jwt.js";

describe("lib/jwt", () => {
	const payload = { userId: "u1", email: "a@b.com", role: "USER" };

	describe("generateAccessToken / verifyAccessToken", () => {
		it("returns a non-empty string signed with the access secret", () => {
			const token = generateAccessToken(payload);
			expect(token).to.be.a("string").and.not.be.empty;
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
			expect(decoded).to.include(payload);
		});

		it("round-trips through verifyAccessToken", () => {
			const token = generateAccessToken(payload);
			const decoded = verifyAccessToken(token);
			expect(decoded).to.include(payload);
		});

		it("throws when verifying a refresh-signed token as an access token", () => {
			const token = generateRefreshToken(payload);
			expect(() => verifyAccessToken(token)).to.throw();
		});

		it("throws on tampered/garbage token", () => {
			expect(() => verifyAccessToken("not.a.jwt")).to.throw();
		});
	});

	describe("generateRefreshToken / verifyRefreshToken", () => {
		it("round-trips through verifyRefreshToken", () => {
			const token = generateRefreshToken(payload);
			const decoded = verifyRefreshToken(token);
			expect(decoded).to.include(payload);
		});

		it("throws when verifying an access-signed token as a refresh token", () => {
			const token = generateAccessToken(payload);
			expect(() => verifyRefreshToken(token)).to.throw();
		});
	});

	describe("generateTokens", () => {
		it("returns both access and refresh tokens", () => {
			const tokens = generateTokens({ id: "u1", email: "a@b.com", role: "ADMIN" });
			expect(tokens).to.have.all.keys(["accessToken", "refreshToken"]);
			expect(verifyAccessToken(tokens.accessToken)).to.include({
				userId: "u1",
				email: "a@b.com",
				role: "ADMIN",
			});
		});

		it("defaults role to USER when user.role is missing", () => {
			const tokens = generateTokens({ id: "u2", email: "x@y.com" });
			expect(verifyAccessToken(tokens.accessToken).role).to.equal("USER");
		});
	});
});
