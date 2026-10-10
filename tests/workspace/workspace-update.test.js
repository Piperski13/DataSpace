const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../../app");
const User = require("../../model/user.repository");
const Workspace = require("../../model/workspace.repository");

const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/:workspaceId/update", () => {
  const ownerEmail = "workspace-update-owner@example.com";
  const otherUserEmail = "workspace-update-other@example.com";

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
    owner = await User.findByEmail(ownerEmail);

    if (!owner) {
      const password = await bcrypt.hash("owner-password", 10);

      await User.create({
        email: ownerEmail,
        password,
        first_name: "Update",
        last_name: "Owner",
      });

      owner = await User.findByEmail(ownerEmail);
    }

    otherUser = await User.findByEmail(otherUserEmail);

    if (!otherUser) {
      const password = await bcrypt.hash("other-password", 10);

      await User.create({
        email: otherUserEmail,
        password,
        first_name: "Update",
        last_name: "Other",
      });

      otherUser = await User.findByEmail(otherUserEmail);
    }

    const workspace = await Workspace.create({
      name: `Original ${Date.now()}`,
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
    const agent = await login(ownerEmail, "owner-password");

    const response = await agent.post("/workspaces/not-a-number/update").send({
      name: "Updated Workspace",
      description: "Updated description",
      visibility: "public",
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("Workspace ID must be a number");
  });

  it("rejects invalid workspace data", async () => {
    const agent = await login(ownerEmail, "owner-password");

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
    const agent = await login(otherUserEmail, "other-password");

    const response = await agent
      .post(`/workspaces/${workspaceId}/update`)
      .send({
        name: "Unauthorized Update",
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
    const agent = await login(ownerEmail, "owner-password");

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
