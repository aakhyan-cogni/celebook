import { expect } from "chai";
import sinon from "sinon";
import { authenticate, authorize } from "../../src/middleware/auth.middleware.js";
import { generateAccessToken } from "../../src/lib/jwt.js";

function mockRes() {
	return {
		statusCode: 0,
		body: null,
		status(code) {
			this.statusCode = code;
			return this;
		},
		json(payload) {
			this.body = payload;
			return this;
		},
	};
}

describe("middleware/auth.middleware", () => {
	describe("authenticate", () => {
		it("calls next() and attaches req.user when a valid Bearer token is provided", async () => {
			const token = generateAccessToken({ userId: "u1", email: "a@b.com", role: "USER" });
			const req = { headers: { authorization: `Bearer ${token}` } };
			const res = mockRes();
			const next = sinon.spy();

			await authenticate(req, res, next);

			expect(next.calledOnce).to.equal(true);
			expect(req.user).to.include({ userId: "u1", email: "a@b.com", role: "USER" });
			expect(res.statusCode).to.equal(0);
		});

		it("responds 401 when Authorization header is missing", async () => {
			const req = { headers: {} };
			const res = mockRes();
			const next = sinon.spy();

			await authenticate(req, res, next);

			expect(next.called).to.equal(false);
			expect(res.statusCode).to.equal(401);
			expect(res.body).to.deep.equal({ message: "Unauthorized" });
		});

		it("responds 401 when Authorization header does not start with 'Bearer '", async () => {
			const req = { headers: { authorization: "Basic abc123" } };
			const res = mockRes();
			const next = sinon.spy();

			await authenticate(req, res, next);

			expect(next.called).to.equal(false);
			expect(res.statusCode).to.equal(401);
		});

		it("responds 401 when token is invalid or expired", async () => {
			const req = { headers: { authorization: "Bearer not.a.valid.jwt" } };
			const res = mockRes();
			const next = sinon.spy();
			const stub = sinon.stub(console, "error");

			await authenticate(req, res, next);

			expect(next.called).to.equal(false);
			expect(res.statusCode).to.equal(401);
			expect(res.body).to.deep.equal({ message: "Invalid or expired token" });
			stub.restore();
		});
	});

	describe("authorize", () => {
		it("calls next() when req.user.role is in the allowed list", () => {
			const req = { user: { role: "ADMIN" } };
			const res = mockRes();
			const next = sinon.spy();

			authorize(["ADMIN"])(req, res, next);

			expect(next.calledOnce).to.equal(true);
			expect(res.statusCode).to.equal(0);
		});

		it("responds 403 when req.user.role is not allowed", () => {
			const req = { user: { role: "USER" } };
			const res = mockRes();
			const next = sinon.spy();

			authorize(["ADMIN"])(req, res, next);

			expect(next.called).to.equal(false);
			expect(res.statusCode).to.equal(403);
			expect(res.body).to.deep.equal({ message: "Forbidden: You do not have permission" });
		});

		it("responds 403 when req.user is missing", () => {
			const req = {};
			const res = mockRes();
			const next = sinon.spy();

			authorize(["ADMIN", "USER"])(req, res, next);

			expect(next.called).to.equal(false);
			expect(res.statusCode).to.equal(403);
		});
	});
});
