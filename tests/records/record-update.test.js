const request = require("supertest");
const app = require("../../app");
const pool = require("../../db/pool");
const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository");
const Record = require("../../model/record.repository");
const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/:workspaceId/collections/:collectionId/records/:recordId/update", () => {
  let owner;
  let otherUser;
  let privateWorkspaceId;
  let publicWorkspaceId;
  let privateCollectionId;
  let publicCollectionId;
  let privateRecordId;
  let publicRecordId;

  const ownerEmail = "record-update-owner@example.com";
  const otherUserEmail = "record-update-other@example.com";
  const password = "password123!";

  const login = async (email, password) => {
    const agent = request.agent(app);
    const response = await agent.post("/auth/login").send({ email, password });

    expect(response.statusCode).toBe(302);
    return agent;
  };

  const updateUrl = (workspaceId, collectionId, recordId) =>
    `/workspaces/${workspaceId}/collections/${collectionId}/records/${recordId}/update`;

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
      title: "Original Record",
      description: "Original description",
    });

    privateRecordId = privateRecord.id;

    const publicRecord = await Record.create({
      collectionId: publicCollectionId,
      title: "Public Record",
      description: "Public description",
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
    const response = await request(app)
      .post(updateUrl(privateWorkspaceId, privateCollectionId, privateRecordId))
      .send({
        title: "Updated Record",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  test("returns 400 when the title is empty", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(updateUrl(privateWorkspaceId, privateCollectionId, privateRecordId))
      .send({
        title: "",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(400);
  });

  test("returns 400 when the title exceeds 20 characters", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(updateUrl(privateWorkspaceId, privateCollectionId, privateRecordId))
      .send({
        title: "This Title Is Too Long",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(400);
  });

  test("returns 400 when the description exceeds 200 characters", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(updateUrl(privateWorkspaceId, privateCollectionId, privateRecordId))
      .send({
        title: "Updated Record",
        description: "a".repeat(201),
      });

    expect(response.statusCode).toBe(400);
  });

  test("returns 404 when another user updates a private workspace record", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent
      .post(updateUrl(privateWorkspaceId, privateCollectionId, privateRecordId))
      .send({
        title: "Updated Record",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(404);
  });

  test("returns 404 when another user updates a public workspace record", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent
      .post(updateUrl(publicWorkspaceId, publicCollectionId, publicRecordId))
      .send({
        title: "Updated Record",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(404);
  });

  test("returns 400 when the record ID is invalid", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(updateUrl(privateWorkspaceId, privateCollectionId, "invalid"))
      .send({
        title: "Updated Record",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(400);
  });

  test("returns 404 when the record belongs to a different collection", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(updateUrl(privateWorkspaceId, privateCollectionId, publicRecordId))
      .send({
        title: "Updated Record",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(404);
  });

  test("updates a record for the workspace owner", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(updateUrl(privateWorkspaceId, privateCollectionId, privateRecordId))
      .send({
        title: "Updated Record",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}`,
    );

    const { rows } = await pool.query(
      `SELECT title, description, collection_id
       FROM records
       WHERE id = $1`,
      [privateRecordId],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      title: "Updated Record",
      description: "Updated description",
      collection_id: privateCollectionId,
    });
  });
});
