const request = require("supertest");
const app = require("../../app");
const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/:workspaceId/collections/:collectionId/records/new", () => {
  let owner;
  let otherUser;
  let privateWorkspaceId;
  let privateCollectionId;
  let publicWorkspaceId;
  let publicCollectionId;

  const ownerEmail = "record-new-owner@example.com";
  const otherUserEmail = "record-new-other@example.com";
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
      first_name: "Record",
      last_name: "Owner",
    });

    otherUser = await createTestUser({
      email: otherUserEmail,
      password,
      first_name: "Other",
      last_name: "User",
    });

    const privateWorkspace = await Workspace.create({
      name: "Private Record",
      description: "Private workspace for record tests",
      visibility: "private",
      user: owner,
    });

    privateWorkspaceId = privateWorkspace.id;

    const privateCollection = await Collection.create({
      workspaceId: privateWorkspaceId,
      name: "Private Record Collection",
      description: "Collection for record tests",
    });

    privateCollectionId = privateCollection.id;

    const publicWorkspace = await Workspace.create({
      name: "Public Record",
      description: "Public workspace for record tests",
      visibility: "public",
      user: owner,
    });

    publicWorkspaceId = publicWorkspace.id;

    const publicCollection = await Collection.create({
      workspaceId: publicWorkspaceId,
      name: "Public Record Collection",
      description: "Public collection for record tests",
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
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/new`,
    );

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("renders the new-record form for the workspace owner", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/new`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Create Record");
  });

  it("returns 404 when another user tries to open the form for a private workspace", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.get(
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/new`,
    );

    expect(response.statusCode).toBe(404);
  });

  it("returns 404 when another user tries to open the form for a public workspace", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.get(
      `/workspaces/${publicWorkspaceId}/collections/${publicCollectionId}/records/new`,
    );

    expect(response.statusCode).toBe(404);
  });

  it("returns 404 when the collection does not belong to the specified workspace", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.get(
      `/workspaces/${privateWorkspaceId}/collections/${publicCollectionId}/records/new`,
    );

    expect(response.statusCode).toBe(404);
  });
});
