const request = require("supertest");
const app = require("../../app");
const pool = require("../../db/pool");
const Workspace = require("../../model/workspace.repository");
const Collection = require("../../model/collection.repository");
const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("POST /workspaces/:workspaceId/collections/:collectionId/records/create", () => {
  let owner;
  let otherUser;
  let privateWorkspaceId;
  let publicWorkspaceId;
  let privateCollectionId;
  let publicCollectionId;

  const ownerEmail = "record-create-owner@example.com";
  const otherUserEmail = "record-create-other@example.com";
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
  });

  afterAll(async () => {
    await pool.query("DELETE FROM records WHERE title = $1", ["Valid Record"]);

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
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/create`,
      )
      .send({ title: "Valid Record" });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });

  test("returns 400 when the title is empty", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/create`,
      )
      .send({ title: "" });

    expect(response.statusCode).toBe(400);
  });

  test("returns 400 when the title is shorter than 2 characters", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/create`,
      )
      .send({ title: "A" });

    expect(response.statusCode).toBe(400);
  });

  test("returns 400 when the title exceeds 20 characters", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/create`,
      )
      .send({ title: "This Title Is Too Long" });

    expect(response.statusCode).toBe(400);
  });

  test("returns 404 when a non-owner creates a record in a private workspace", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/create`,
      )
      .send({ title: "Valid Record" });

    expect(response.statusCode).toBe(404);
  });

  test("returns 404 when a non-owner creates a record in a public workspace", async () => {
    const agent = await login(otherUserEmail, password);

    const response = await agent
      .post(
        `/workspaces/${publicWorkspaceId}/collections/${publicCollectionId}/records/create`,
      )
      .send({ title: "Valid Record" });

    expect(response.statusCode).toBe(404);
  });

  test("returns 404 when the collection belongs to a different workspace", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${publicCollectionId}/records/create`,
      )
      .send({ title: "Valid Record" });

    expect(response.statusCode).toBe(404);
  });

  test("creates a record for the workspace owner", async () => {
    const agent = await login(ownerEmail, password);

    const response = await agent
      .post(
        `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}/records/create`,
      )
      .send({
        title: "Valid Record",
        description: "Record created by the owner",
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(
      `/workspaces/${privateWorkspaceId}/collections/${privateCollectionId}`,
    );

    const { rows } = await pool.query(
      `SELECT title, description, collection_id
       FROM records
       WHERE collection_id = $1 AND title = $2`,
      [privateCollectionId, "Valid Record"],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      title: "Valid Record",
      description: "Record created by the owner",
      collection_id: privateCollectionId,
    });
  });
});
