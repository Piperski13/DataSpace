const request = require("supertest");
const app = require("../../app");
const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/:workspaceId/collections/:collectionId", () => {
  let owner;
  let otherUser;
  let workspaceId;
  let collectionId;

  const ownerEmail = "collection-details-owner@example.com";
  const otherUserEmail = "collection-details-other@example.com";
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
      password,
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
      name: "Workspace col det",
      description: "Workspace for collection details tests",
      visibility: "private",
      user: owner,
    });

    workspaceId = workspace.id;

    const collection = await Collection.create({
      name: "Collection test",
      description: "Collection for details tests",
      workspaceId,
    });

    collectionId = collection.id;
  });

  afterAll(async () => {
    await cleanupTestData({ workspaceId, owner, otherUser });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).get(
      `/workspaces/${workspaceId}/collections/${collectionId}`,
    );

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });

  it("renders the collection details for the workspace owner", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/${collectionId}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Workspace col det");
    expect(response.text).toContain("Collection test");
  });

  it("returns 404 when another user tries to view a private workspace collection", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/${collectionId}`,
    );

    expect(response.statusCode).toBe(404);
  });

  it("returns 400 when the collection ID is not a number", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/invalid`,
    );

    expect(response.statusCode).toBe(500);
  });

  it("returns 404 when the collection does not exist", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/999999999`,
    );

    expect(response.statusCode).toBe(404);
  });

  it("accepts a title filter", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${workspaceId}/collections/${collectionId}?title=test`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Collection test");
  });
});
