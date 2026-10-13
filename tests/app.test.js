const request = require("supertest");
const app = require("../app");

describe("Application", () => {
  it("should respond to a request", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBeDefined();
  });
});
