const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../../../app");
const User = require("../../../model/user.repository");

jest.mock("../../../utils/resetPasswordEmail.js", () => {
  return jest.fn().mockResolvedValue({ id: "test-email-id" });
});

describe("GET /auth/forgot-password", () => {
  it("renders the forgot password page", async () => {
    const response = await request(app).get("/auth/forgot-password");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("forgot");
  });
});

describe("POST /auth/forgot-password", () => {
  beforeAll(async () => {
    const existingUser = await User.findByEmail("reset@example.com");

    if (!existingUser) {
      const password = await bcrypt.hash("test-password", 10);

      await User.create({
        email: "reset@example.com",
        password,
        first_name: "Reset",
        last_name: "User",
      });
    }
  });

  it("rejects a non-existent email", async () => {
    const response = await request(app).post("/auth/forgot-password").send({
      email: "non-existent@example.com",
    });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Email non-existent");
  });

  it("renders the success page for an existing email", async () => {
    const response = await request(app).post("/auth/forgot-password").send({
      email: "reset@example.com",
    });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Sent Email");
  });
});
