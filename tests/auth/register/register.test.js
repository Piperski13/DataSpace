const request = require("supertest");

const app = require("../../../app");
const User = require("../../../model/user.repository");

jest.mock("../../../utils/sendEmail.js", () => {
  return jest.fn().mockResolvedValue({ id: "test-email-id" });
});

describe("GET /auth/register", () => {
  it("renders the registration page", async () => {
    const response = await request(app).get("/auth/register");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("register");
  });
});

describe("POST /auth/register/otp", () => {
  beforeAll(async () => {
    const existingUser = await User.findByEmail("registered@example.com");

    if (!existingUser) {
      await User.create({
        email: "registered@example.com",
        password: "test-password",
        first_name: "Registered",
        last_name: "User",
      });
    }
  });

  it("rejects invalid registration data", async () => {
    const response = await request(app).post("/auth/register/otp").send({
      first_name: "",
      last_name: "Test",
      email: "test@example.com",
      password: "password",
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("Firstname is required");
  });

  it("rejects invalid email and short password", async () => {
    const response = await request(app).post("/auth/register/otp").send({
      first_name: "John",
      last_name: "Test",
      email: "invalid-email",
      password: "a",
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("Invalid email address");
    expect(response.text).toContain("Password too short");
  });

  it("rejects an already registered email", async () => {
    const response = await request(app).post("/auth/register/otp").send({
      first_name: "John",
      last_name: "Test",
      email: "registered@example.com",
      password: "password",
    });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Email is already registered");
  });

  it("renders the OTP page after successful registration request", async () => {
    const response = await request(app).post("/auth/register/otp").send({
      first_name: "John",
      last_name: "Test",
      email: "new-user@example.com",
      password: "password",
    });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("otp");
  });
});
