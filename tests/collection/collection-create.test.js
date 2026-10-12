const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../../app");
const pool = require("../../db/pool");
const User = require("../../model/user.repository");
const Workspace = require("../../model/workspace.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/:workspaceId/collections/create", () => {
  let owner;
  let otherUser;
  let workspaceId;

  const ownerEmail = "collection-owner@example.com";
  const otherUserEmail = "collection-other@example.com";
  const password = "password123!";

  const login = async (email, password) => {
    const agent = request.agent(app);
    const response = await agent.post("/auth/login").send({ email, password });

    expect(response.statusCode).toBe(302);
    return agent;
  };

  beforeAll(async () => {
    owner = await createTestUser({
      email: ownerEmail,
      password: password,
      first_name: "Collection",
      last_name: "Owner",
    });

    otherUser = await createTestUser({
      email: otherUserEmail,
      password,
      first_name: "Other",
      last_name: "User",
    });

    const workspace = await Workspace.create({
      name: "Collection Test Workspace",
      description: "Workspace for collection creation tests",
      visibility: "private",
      user: owner,
    });

    workspaceId = workspace.id;
  });

  afterAll(async () => {
    await cleanupTestData({ workspaceId, owner, otherUser });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaceId}/collections/create`)
      .send({
        name: "Test Collection",
        description: "Test description",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("returns 400 when the collection name is empty", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(`/workspaces/${workspaceId}/collections/create`)
      .send({
        name: "",
        description: "Test description",
      });

    expect(response.statusCode).toBe(400);
  });

  it("returns 404 when a different user tries to create a collection", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent
      .post(`/workspaces/${workspaceId}/collections/create`)
      .send({
        name: "Unauthorized",
        description: "Should not be created",
      });

    expect(response.statusCode).toBe(404);
  });

  it("creates a collection when the workspace owner submits valid data", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(`/workspaces/${workspaceId}/collections/create`)
      .send({
        name: "Test Collection",
        description: "Test description",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(`/workspaces/${workspaceId}`);

    const result = await pool.query(
      `SELECT name, description, workspace_id
       FROM collections
       WHERE workspace_id = $1 AND name = $2`,
      [workspaceId, "Test Collection"],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      name: "Test Collection",
      description: "Test description",
      workspace_id: workspaceId,
    });
  });
});
