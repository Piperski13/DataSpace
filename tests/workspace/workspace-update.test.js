const request = require("supertest");
const app = require("../../app");
const Workspace = require("../../model/workspace.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/:workspaceId/update", () => {
  const ownerEmail = "workspace-update-owner@example.com";
  const otherUserEmail = "workspace-update-other@example.com";
  const password = "secert123";

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
      first_name: "Update",
      last_name: "Owner",
    });

    otherUser = await createTestUser({
      email: otherUserEmail,
      password,
      first_name: "Update",
      last_name: "Other",
    });

    const workspace = await Workspace.create({
      name: `Original WS`,
      description: "Original description",
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
      .post(`/workspaces/${workspaceId}/update`)
      .send({
        name: "Updated Workspace",
        description: "Updated description",
        visibility: "public",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("rejects an invalid workspace ID", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.post("/workspaces/not-a-number/update").send({
      name: "Updated Workspace",
      description: "Updated description",
      visibility: "public",
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("Workspace ID must be a number");
  });

  it("rejects invalid workspace data", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(`/workspaces/${workspaceId}/update`)
      .send({
        name: "",
        description: "Updated description",
        visibility: "public",
      });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("Name is required");

    // Invalid input must not change the database record.
    const workspace = await Workspace.get({ workspaceId });

    expect(workspace.name).toMatch(/^Original /);
    expect(workspace.visibility).toBe("private");
  });

  it("denies another user permission to update the workspace", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent
      .post(`/workspaces/${workspaceId}/update`)
      .send({
        name: "UnauthorizedUpdate",
        description: "Should not be saved",
        visibility: "public",
      });

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");

    const workspace = await Workspace.get({ workspaceId });

    expect(workspace.name).toMatch(/^Original /);
    expect(workspace.visibility).toBe("private");
  });

  it("updates the workspace for its owner", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(`/workspaces/${workspaceId}/update`)
      .send({
        name: "Updated Workspace",
        description: "Updated description",
        visibility: "public",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/workspaces");

    const workspace = await Workspace.get({ workspaceId });

    expect(workspace.name).toBe("Updated Workspace");
    expect(workspace.description).toBe("Updated description");
    expect(workspace.visibility).toBe("public");
    expect(workspace.owner_id).toBe(owner.id);
  });
});
