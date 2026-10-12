const request = require("supertest");

const app = require("../../app");
const pool = require("../../db/pool");
const User = require("../../model/user.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/create", () => {
  let createdWorkspaceId;
  let testUser;

  beforeAll(async () => {
    testUser = await createTestUser({
      email: "wscreate@example.com",
      password: "correct-password",
    });
  });

  const login = async () => {
    const agent = request.agent(app);

    const response = await agent.post("/auth/login").send({
      email: "wscreate@example.com",
      password: "correct-password",
    });

    expect(response.statusCode).toBe(302);

    return agent;
  };

  afterAll(async () => {
    await cleanupTestData({ workspaceId: createdWorkspaceId, owner: testUser });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).post("/workspaces/create").send({
      name: "Test Workspace",
      description: "Test description",
      visibility: "private",
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("rejects an invalid workspace name", async () => {
    const agent = await login();

    const response = await agent.post("/workspaces/create").send({
      name: "",
      description: "Test description",
      visibility: "private",
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("Name is required");
  });

  it("rejects an invalid visibility", async () => {
    const agent = await login();

    const response = await agent.post("/workspaces/create").send({
      name: "Test Workspace",
      description: "Test description",
      visibility: "invalid",
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("Visibility must be private or public.");
  });

  it("creates a workspace for the authenticated user", async () => {
    const agent = await login();

    const workspaceName = `Test ${Date.now()}`;

    const response = await agent.post("/workspaces/create").send({
      name: workspaceName,
      description: "Created by integration test",
      visibility: "private",
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/workspaces");

    const testUser = await User.findByEmail("wscreate@example.com");

    const result = await pool.query(
      `
        SELECT id, name, description, visibility, owner_id
        FROM workspaces
        WHERE name = $1
      `,
      [workspaceName],
    );

    expect(result.rows).toHaveLength(1);

    const workspace = result.rows[0];

    createdWorkspaceId = workspace.id;

    expect(workspace.name).toBe(workspaceName);
    expect(workspace.description).toBe("Created by integration test");
    expect(workspace.visibility).toBe("private");
    expect(workspace.owner_id).toBe(testUser.id);
  });
});
