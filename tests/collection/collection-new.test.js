const request = require("supertest");
const app = require("../../app");
const Workspace = require("../../model/workspace.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/:workspaceId/collections/new", () => {
  const ownerEmail = "collection-new-owner@example.com";
  const otherUserEmail = "collection-new-other@example.com";
  const password = "secret123!";

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
      first_name: "Collection",
      last_name: "Owner",
    });

    otherUser = await createTestUser({
      email: otherUserEmail,
      password,
      first_name: "Collection",
      last_name: "Other",
    });

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
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/new`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Add Collection");
  });

  it("denies another user access to the collection form", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/new`,
    );

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });
});
