// Set env vars BEFORE any source module imports jwt.js (which reads them at module load).
process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.ACCESS_TOKEN_EXPIRY = "900";
process.env.REFRESH_TOKEN_EXPIRY = "604800";
process.env.PORT = "0";

import sinon from "sinon";

export const mochaHooks = {
	afterEach() {
		sinon.restore();
	},
};

export function makeUser(overrides = {}) {
	return {
		id: "507f1f77bcf86cd799439011",
		email: "alice@example.com",
		name: "Alice",
		role: "USER",
		password: "$2a$10$hashedpasswordvalue",
		refreshToken: null,
		consentAccepted: true,
		consentVersion: "v1",
		...overrides,
	};
}
