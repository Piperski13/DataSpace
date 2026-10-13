const request = require("supertest");
const app = require("../../app");
const pool = require("../../db/pool");
const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/:workspaceId/collections/:collectionId/update", () => {
  let owner;
  let otherUser;
  let privateWorkspaceId;
  let privateCollectionId;
  let publicWorkspaceId;
  let publicCollectionId;

  const ownerEmail = "collection-update-owner@example.com";
  const otherUserEmail = "collection-update-other@example.com";
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
      name: "Private Update Workspace",
      description: "Private workspace for collection update tests",
      visibility: "private",
      user: owner,
    });

    privateWorkspaceId = privateWorkspace.id;

    const privateCollection = await Collection.create({
      workspaceId: privateWorkspaceId,
      name: "Original Private Collection",
      description: "Original description",
    });

    privateCollectionId = privateCollection.id;

    const publicWorkspace = await Workspace.create({
      name: "Public Update Workspace",
      description: "Public workspace for collection update tests",
      visibility: "public",
      user: owner,
    });

    publicWorkspaceId = publicWorkspace.id;

    const publicCollection = await Collection.create({
      workspaceId: publicWorkspaceId,
      name: "Original Public Collection",
      description: "Original public description",
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
    const response = await request(app)
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/update`,
      )
      .send({
        name: "Updated Collection",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  it("returns 400 when the collection name is empty", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/update`,
      )
      .send({
        name: "",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(400);
  });

  it("returns 404 when another user tries to update a private workspace collection", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/update`,
      )
      .send({
        name: "Unauthorized Update",
        description: "Should not be saved",
      });

    expect(response.statusCode).toBe(404);
  });

  it("returns 404 when another user tries to update a public workspace collection", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent
      .post(
        `/workspaces/${publicWorkspaceId}/collections/${publicCollectionId}/update`,
      )
      .send({
        name: "UnauthorizedUpdate",
        description: "Should not be saved",
      });

    expect(response.statusCode).toBe(404);
  });

  it("returns 404 when the collection does not belong to the specified workspace", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${publicCollectionId}/update`,
      )
      .send({
        name: "Invalid Update",
        description: "Should not be saved",
      });

    expect(response.statusCode).toBe(404);
  });

  it("updates the collection when the workspace owner submits valid data", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/update`,
      )
      .send({
        name: "Updated Collection",
        description: "Updated collection description",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(`/workspaces/${privateWorkspaceId}`);

    const result = await pool.query(
      `SELECT name, description
       FROM collections
       WHERE workspace_id = $1 AND id = $2`,
      [privateWorkspaceId, privateCollectionId],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      name: "Updated Collection",
      description: "Updated collection description",
    });
  });
});
