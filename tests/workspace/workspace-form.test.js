const request = require("supertest");

const app = require("../../app");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/new", () => {
  let testUser;

  beforeAll(async () => {
    testUser = await createTestUser({
      email: "correct@example.com",
      password: "correct-password",
    });
  });

  afterAll(async () => {
    await cleanupTestData({ otherUser: testUser });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).get("/workspaces/new");

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("renders the workspace creation form for an authenticated user", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: "correct@example.com",
      password: "correct-password",
    });

    expect(loginResponse.statusCode).toBe(302);

    const response = await agent.get("/workspaces/new");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("workspace");
  });
});
