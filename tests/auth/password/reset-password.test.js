const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../../../app");
const User = require("../../../model/user.repository");
const ForgotPassword = require("../../../model/forgotPassword.repository");

const createTestUser = require("../../helpers/createTestUser");
const cleanupTestData = require("../../helpers/cleanupTestData");

describe("GET /auth/reset-password/:selector/:token", () => {
  it("rejects an invalid password reset link", async () => {
    const response = await request(app).get(
      "/auth/reset-password/invalid-selector/invalid-token",
    );

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Invalid reset password link");
  });
});

describe("POST /auth/reset-password/:selector/:token", () => {
  let testUser;
  const email = "reset-test@example.com";
  const newPassword = "new-password";
  const oldPassword = "old-password";

  const createResetToken = async ({
    selector,
    token,
    expiresAt = new Date(Date.now() + 15 * 60 * 1000),
  }) => {
    await ForgotPassword.removeBySelector(selector);

    const hashedToken = await bcrypt.hash(token, 10);

    await ForgotPassword.create(email, selector, hashedToken, expiresAt);
  };

  beforeAll(async () => {
    testUser = await createTestUser({
      email,
      password: oldPassword,
      first_name: "Reset",
      last_name: "Test",
    });
  });

  afterAll(async () => {
    await cleanupTestData({ otherUser: testUser });
  });

  it("rejects a password that is too short", async () => {
    const response = await request(app)
      .post("/auth/reset-password/test-selector/test-token")
      .send({
        password: "a",
      });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("Password too short");
  });

  it("resets the password and redirects to login", async () => {
    const selector = "valid-selector";
    const token = "valid-token";

    await createResetToken({
      selector,
      token,
    });

    const response = await request(app)
      .post(`/auth/reset-password/${selector}/${token}`)
      .send({
        password: newPassword,
      });

    console.log("Reset status:", response.statusCode);
    console.log("Reset response:", response.text);

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");

    const updatedUser = await User.findByEmail(email);

    const passwordMatches = await bcrypt.compare(
      newPassword,
      updatedUser.password,
    );

    expect(passwordMatches).toBe(true);
  });

  it("rejects an expired reset link", async () => {
    const selector = "expired-selector";
    const token = "expired-token";

    await createResetToken({
      selector,
      token,
      expiresAt: new Date(Date.now() - 60 * 1000),
    });

    const response = await request(app)
      .post(`/auth/reset-password/${selector}/${token}`)
      .send({
        password: "new-password",
      });

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Reset password link expired");
  });

  it("invalidates the reset link after successful password reset", async () => {
    const selector = "single-use-selector";
    const token = "single-use-token";

    await createResetToken({
      selector,
      token,
    });

    const firstResponse = await request(app)
      .post(`/auth/reset-password/${selector}/${token}`)
      .send({
        password: "first-password",
      });

    expect(firstResponse.statusCode).toBe(302);

    const secondResponse = await request(app)
      .post(`/auth/reset-password/${selector}/${token}`)
      .send({
        password: "second-password",
      });

    expect(secondResponse.statusCode).toBe(404);
    expect(secondResponse.text).toContain("Invalid reset password link");
  });
});
