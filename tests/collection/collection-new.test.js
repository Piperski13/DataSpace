const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../../app");
const User = require("../../model/user.repository");
const Workspace = require("../../model/workspace.repository");

const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/:workspaceId/collections/new", () => {
  const ownerEmail = "collection-new-owner@example.com";
  const otherUserEmail = "collection-new-other@example.com";

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
        first_name: "Collection",
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
        first_name: "Collection",
        last_name: "Other",
      });

      otherUser = await User.findByEmail(otherUserEmail);
    }

    const workspace = await Workspace.create({
      name: `Collection Test ${Date.now()}`,
      description: "Workspace for collection route tests",
      visibility: "private",
      user: owner,
    });

    workspaceId = workspace.id;
  });

  afterAll(async () => {
    await cleanupTestData({ workspaceId, owner, otherUser });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).get(
      `/workspaces/${workspaceId}/collections/new`,
    );

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("renders the collection form for the workspace owner", async () => {
    const agent = await login(ownerEmail, "owner-password");

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/new`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Add Collection");
  });

  it("denies another user access to the collection form", async () => {
    const agent = await login(otherUserEmail, "other-password");

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/new`,
    );

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });
});
