const request = require("supertest");
const app = require("../../app");
const Workspace = require("../../model/workspace.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/:workspaceId/delete", () => {
  const ownerEmail = "workspace-delete-owner@example.com";
  const otherUserEmail = "workspace-delete-other@example.com";
  const password = "correct-password";

  let owner;
  let otherUser;
  let workspaceId;

  const login = async (email, password) => {
    const agent = request.agent(app);

    const response = await agent.post("/auth/login").send({
      email,
      password,
    });

    expect(response.statusCode).toBe(302);

    return agent;
  };

  beforeAll(async () => {
    owner = await createTestUser({
      email: ownerEmail,
      password,
      first_name: "Delete",
      last_name: "Owner",
    });

    otherUser = await createTestUser({
      email: otherUserEmail,
      password,
      first_name: "Delete",
      last_name: "Other",
    });

    const workspace = await Workspace.create({
      name: `Delete Test ${Date.now()}`,
      description: "Workspace for deletion tests",
      visibility: "private",
      user: owner,
    });

    workspaceId = workspace.id;
  });

  afterAll(async () => {
    await cleanupTestData({ workspaceId, owner, otherUser });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).post(
      `/workspaces/${workspaceId}/delete`,
    );

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");

    const workspace = await Workspace.get({ workspaceId });
    expect(workspace).not.toBeNull();
  });

  it("denies another user permission to delete the workspace", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.post(`/workspaces/${workspaceId}/delete`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");

    const workspace = await Workspace.get({ workspaceId });
    expect(workspace).not.toBeNull();
  });

  it("deletes the workspace for its owner", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.post(`/workspaces/${workspaceId}/delete`);

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/workspaces");

    const workspace = await Workspace.get({ workspaceId });
    expect(workspace).toBeNull();
  });
});
