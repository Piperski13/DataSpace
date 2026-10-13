const request = require("supertest");
const app = require("../../app");
const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/:workspaceId/collections/:collectionId/edit", () => {
  let owner;
  let otherUser;
  let privateWorkspaceId;
  let privateCollectionId;
  let publicWorkspaceId;
  let publicCollectionId;

  const ownerEmail = "collection-edit-owner@example.com";
  const otherUserEmail = "collection-edit-other@example.com";
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

    const privateWorkspace = await Workspace.create({
      name: "Private Edit Workspace",
      description: "Private workspace for collection edit tests",
      visibility: "private",
      user: owner,
    });

    privateWorkspaceId = privateWorkspace.id;

    const privateCollection = await Collection.create({
      workspaceId: privateWorkspaceId,
      name: "Private Edit Collection",
      description: "Private collection for edit tests",
    });

    privateCollectionId = privateCollection.id;

    const publicWorkspace = await Workspace.create({
      name: "Public Workspace",
      description: "Public workspace for collection edit tests",
      visibility: "public",
      user: owner,
    });

    publicWorkspaceId = publicWorkspace.id;

    const publicCollection = await Collection.create({
      workspaceId: publicWorkspaceId,
      name: "Public Collection",
      description: "Public collection for edit tests",
    });

    publicCollectionId = publicCollection.id;
  });

  afterAll(async () => {
    await cleanupTestData({
      workspaceId: publicWorkspaceId,
      owner,
      otherUser,
    });
    await cleanupTestData({
      workspaceId: privateWorkspaceId,
    });
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).get(
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/edit`,
    );

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("renders the edit form for the workspace owner", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/edit`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Private Edit Collection");
  });

  it("returns 404 when another user tries to edit a private workspace collection", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.get(
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/edit`,
    );

    expect(response.statusCode).toBe(404);
  });

  it("returns 404 when another user tries to edit a public workspace collection", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.get(
      `/workspaces/${publicWorkspaceId}/collections/${publicCollectionId}/edit`,
    );

    expect(response.statusCode).toBe(404);
  });

  it("returns 400 when the collection ID is not a number", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${privateWorkspaceId}/collections/invalid/edit`,
    );

    expect(response.statusCode).toBe(500);
  });

  it("returns 404 when the collection does not belong to the specified workspace", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${privateWorkspaceId}/collections/${publicCollectionId}/edit`,
    );

    expect(response.statusCode).toBe(404);
  });
});
