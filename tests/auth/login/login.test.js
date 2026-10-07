const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../../../app");
const User = require("../../../model/user.repository");

describe("GET /auth/login", () => {
  it("should render the login page", async () => {
    const response = await request(app).get("/auth/login");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("login");
  });
});

describe("POST /auth/login", () => {
  beforeAll(async () => {
    const existingUser = await User.findByEmail("correct@example.com");

    if (!existingUser) {
      const password = await bcrypt.hash("correct-password", 10);

      await User.create({
        email: "correct@example.com",
        password,
        first_name: "Test",
        last_name: "User",
      });
    }
  });

  it("rejects a non-existent user", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "wrong@example.com",
      password: "wrong-password",
    });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("User not found");
  });

  it("rejects an incorrect password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "correct@example.com",
      password: "wrong-password",
    });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Incorrect password");
  });

  it("redirects to dashboard after successful login", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "correct@example.com",
      password: "correct-password",
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/workspaces/dashboard");
  });
});

describe("GET /auth/logout", () => {
  it("redirects to the login after logout", async () => {
    const response = await request(app).get("/auth/logout");

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });
});

describe("GET /auth/status", () => {
  it("returns false when user is not authenticated", async () => {
    const response = await request(app).get("/auth/status");

    expect(response.statusCode).toBe(200);
    expect(response.body.authenticated).toBe(false);
  });
});
