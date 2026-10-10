const request = require("supertest");

const app = require("../../app");

describe("GET /workspaces/", () => {
  it("renders the workspace list", async () => {
    const response = await request(app).get("/workspaces/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("workspace");
  });

  it("renders the authenticated user's workspaces", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: "correct@example.com",
      password: "correct-password",
    });

    expect(loginResponse.statusCode).toBe(302);

    const response = await agent.get("/workspaces/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("workspace");
  });

  it("accepts a workspace name filter", async () => {
    const response = await request(app).get("/workspaces/?name=test");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("test");
  });
});
