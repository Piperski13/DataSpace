const request = require("supertest");

const app = require("../../app");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/dashboard", () => {
  let testUser;

  beforeAll(async () => {
    testUser = await createTestUser({
      email: "correct-dashboard@example.com",
      password: "correct-password",
    });
  });

  afterAll(async () => {
    await cleanupTestData({ owner: testUser });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).get("/workspaces/dashboard");

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("renders the dashboard for an authenticated user", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: "correct-dashboard@example.com",
      password: "correct-password",
    });

    expect(loginResponse.statusCode).toBe(302);
    expect(loginResponse.headers.location).toBe("/workspaces/dashboard");

    const response = await agent.get("/workspaces/dashboard");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("dashboard");
  });
});
