const request = require("supertest");

const app = require("../../../app");

const createTestUser = require("../../helpers/createTestUser");
const cleanupTestData = require("../../helpers/cleanupTestData");

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
  let testUser;

  beforeAll(async () => {
    testUser = await createTestUser({
      email: "reset@example.com",
      password: "correct-password",
      first_name: "Reset",
      last_name: "User",
    });
  });

  afterAll(async () => {
    await cleanupTestData({ otherUser: testUser });
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
