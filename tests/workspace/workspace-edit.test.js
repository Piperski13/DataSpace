const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../../app");
const User = require("../../model/user.repository");
const Workspace = require("../../model/workspace.repository");

const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/:workspaceId/edit", () => {
  const ownerEmail = "workspace-edit-owner@example.com";
  const otherUserEmail = "workspace-edit-other@example.com";

  let owner;
  let otherUser;
  let workspaceId;

  beforeAll(async () => {
    owner = await User.findByEmail(ownerEmail);

    if (!owner) {
      const password = await bcrypt.hash("owner-password", 10);

      await User.create({
        email: ownerEmail,
        password,
        first_name: "Edit",
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
        first_name: "Edit",
        last_name: "Other",
      });

      otherUser = await User.findByEmail(otherUserEmail);
    }

    const workspace = await Workspace.create({
      name: `Edit Test ${Date.now()}`,
      description: "Workspace for edit route tests",
      visibility: "private",
      user: owner,
    });

    workspaceId = workspace.id;
  });

  afterAll(async () => {
    await cleanupTestData({ workspaceId, owner, otherUser });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).get(`/workspaces/${workspaceId}/edit`);

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("renders the edit form for the workspace owner", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: ownerEmail,
      password: "owner-password",
    });

    expect(loginResponse.statusCode).toBe(302);

    const response = await agent.get(`/workspaces/${workspaceId}/edit`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Edit Test");
    expect(response.text).toContain("Workspace for edit route tests");
  });

  it("denies another user access to the edit form", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: otherUserEmail,
      password: "other-password",
    });

    expect(loginResponse.statusCode).toBe(302);

    const response = await agent.get(`/workspaces/${workspaceId}/edit`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });
});
