const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../../app");
const User = require("../../model/user.repository");
const Workspace = require("../../model/workspace.repository");

describe("GET /workspaces/:workspaceId", () => {
  const ownerEmail = "workspace-owner@example.com";
  const otherUserEmail = "workspace-other@example.com";

  let owner;
  let otherUser;
  let publicWorkspaceId;
  let privateWorkspaceId;

  beforeAll(async () => {
    owner = await User.findByEmail(ownerEmail);

    if (!owner) {
      const password = await bcrypt.hash("owner-password", 10);

      await User.create({
        email: ownerEmail,
        password,
        first_name: "Workspace",
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
        first_name: "Other",
        last_name: "User",
      });

      otherUser = await User.findByEmail(otherUserEmail);
    }

    const publicWorkspace = await Workspace.create({
      name: `Public Test ${Date.now()}`,
      description: "Public workspace for integration tests",
      visibility: "public",
      user: owner,
    });

    publicWorkspaceId = publicWorkspace.id;

    const privateWorkspace = await Workspace.create({
      name: `Private Test ${Date.now()}`,
      description: "Private workspace for integration tests",
      visibility: "private",
      user: owner,
    });

    privateWorkspaceId = privateWorkspace.id;
  });

  afterAll(async () => {
    if (publicWorkspaceId) {
      await Workspace.remove({ workspaceId: publicWorkspaceId });
    }

    if (privateWorkspaceId) {
      await Workspace.remove({ workspaceId: privateWorkspaceId });
    }

    await User.deleteById(owner.id);
    await User.deleteById(otherUser.id);
  });

  it("rejects an invalid workspace ID", async () => {
    const response = await request(app).get("/workspaces/not-a-number");

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });

  it("allows unauthenticated users to view a public workspace", async () => {
    const response = await request(app).get(`/workspaces/${publicWorkspaceId}`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Public Test");
  });

  it("allows the owner to view their private workspace", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: ownerEmail,
      password: "owner-password",
    });

    expect(loginResponse.statusCode).toBe(302);

    const response = await agent.get(`/workspaces/${privateWorkspaceId}`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Private Test");
  });

  it("rejects unauthenticated users from viewing a private workspace", async () => {
    const response = await request(app).get(
      `/workspaces/${privateWorkspaceId}`,
    );

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });

  it("rejects another user from viewing a private workspace", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: otherUserEmail,
      password: "other-password",
    });

    expect(loginResponse.statusCode).toBe(302);

    const response = await agent.get(`/workspaces/${privateWorkspaceId}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });
});
