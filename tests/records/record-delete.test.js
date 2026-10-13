const request = require("supertest");
const app = require("../../app");
const pool = require("../../db/pool");
const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository");
const Record = require("../../model/record.repository");
const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/:workspaceId/collections/:collectionId/records/:recordId/delete", () => {
  let owner;
  let otherUser;
  let privateWorkspaceId;
  let publicWorkspaceId;
  let privateCollectionId;
  let publicCollectionId;
  let privateRecordId;
  let publicRecordId;

  const ownerEmail = "record-delete-owner@example.com";
  const otherUserEmail = "record-delete-other@example.com";
  const password = "password123!";

  const deleteUrl = (workspaceId, collectionId, recordId) =>
    `/workspaces/${workspaceId}/collections/${collectionId}/records/${recordId}/delete`;

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
      name: "Private Rec WS",
      description: "Private record test workspace",
      visibility: "private",
      user: owner,
    });

    privateWorkspaceId = privateWorkspace.id;

    const publicWorkspace = await Workspace.create({
      name: "Public Rec WS",
      description: "Public record test workspace",
      visibility: "public",
      user: owner,
    });

    publicWorkspaceId = publicWorkspace.id;

    const privateCollection = await Collection.create({
      workspaceId: privateWorkspaceId,
      name: "Private Rec Col",
      description: "Private record test collection",
    });

    privateCollectionId = privateCollection.id;

    const publicCollection = await Collection.create({
      workspaceId: publicWorkspaceId,
      name: "Public Rec Col",
      description: "Public record test collection",
    });

    publicCollectionId = publicCollection.id;

    const privateRecord = await Record.create({
      collectionId: privateCollectionId,
      title: "Private Record",
      description: "Private record details",
    });

    privateRecordId = privateRecord.id;

    const publicRecord = await Record.create({
      collectionId: publicCollectionId,
      title: "Public Record",
      description: "Public record details",
    });

    publicRecordId = publicRecord.id;
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

  test("redirects unauthenticated users to login", async () => {
    const response = await request(app).post(
      deleteUrl(privateWorkspaceId, privateCollectionId, privateRecordId),
    );

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  test("returns 404 when another user tries to delete a private workspace record", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.post(
      deleteUrl(privateWorkspaceId, privateCollectionId, privateRecordId),
    );

    expect(response.statusCode).toBe(404);
  });

  test("returns 404 when another user tries to delete a public workspace record", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent.post(
      deleteUrl(publicWorkspaceId, publicCollectionId, publicRecordId),
    );

    expect(response.statusCode).toBe(404);
  });

  test("returns 500 when the record ID is invalid", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.post(
      deleteUrl(privateWorkspaceId, privateCollectionId, "invalid"),
    );

    expect(response.statusCode).toBe(500);
  });

  test("returns 404 when the record belongs to a different collection", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.post(
      deleteUrl(privateWorkspaceId, privateCollectionId, publicRecordId),
    );

    expect(response.statusCode).toBe(404);
  });

  test("deletes a record when requested by the workspace owner", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent.post(
      deleteUrl(privateWorkspaceId, privateCollectionId, privateRecordId),
    );

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}`,
    );

    const { rows } = await pool.query("SELECT id FROM records WHERE id = $1", [
      privateRecordId,
    ]);

    expect(rows).toHaveLength(0);

    privateRecordId = null;
  });
});
