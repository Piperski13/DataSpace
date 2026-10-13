const request = require("supertest");
const app = require("../../app");
const Workspace = require("../../model/workspace.repository");

const createTestUser = require("../helpers/createTestUser");
const cleanupTestData = require("../helpers/cleanupTestData");

describe("GET /workspaces/:workspaceId", () => {
  const ownerEmail = "workspace-owner@example.com";
  const otherUserEmail = "workspace-other@example.com";
  const password = "secret123!";

  let owner;
  let otherUser;
  let publicWorkspaceId;
  let privateWorkspaceId;

  beforeAll(async () => {
    owner = await createTestUser({
      email: ownerEmail,
      password,
      first_name: "Workspace",
      last_name: "Owner",
    });

    otherUser = await createTestUser({
      email: otherUserEmail,
      password,
      first_name: "Other",
      last_name: "User",
    });

    const publicWorkspace = await Workspace.create({
      name: `Public Test`,
      description: "Public workspace for integration tests",
      visibility: "public",
      user: owner,
    });

    publicWorkspaceId = publicWorkspace.id;

    const privateWorkspace = await Workspace.create({
      name: `Private Test`,
      description: "Private workspace for integration tests",
      visibility: "private",
      user: owner,
    });

    privateWorkspaceId = privateWorkspace.id;
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

  it("rejects an invalid workspace ID", async () => {
    const response = await request(app).get("/workspaces/not-a-number");

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });

  it("allows unauthenticated users to view a public workspace", async () => {
    const response = await request(app).get(`/workspaces/${publicWorkspaceId}`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Public Test");
  });

  it("allows the owner to view their private workspace", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: ownerEmail,
      password: password,
    });

    expect(loginResponse.statusCode).toBe(302);

    const response = await agent.get(`/workspaces/${privateWorkspaceId}`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Private Test");
  });

  it("rejects unauthenticated users from viewing a private workspace", async () => {
    const response = await request(app).get(
      `/workspaces/${privateWorkspaceId}`,
    );

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });

  it("rejects another user from viewing a private workspace", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/auth/login").send({
      email: otherUserEmail,
      password: password,
    });

    expect(loginResponse.statusCode).toBe(302);

    const response = await agent.get(`/workspaces/${privateWorkspaceId}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("Workspace not found");
  });
});
