const request = require("supertest");
const app = require("../../../app");

const AuthService = require("../../../services/auth/auth.service.js");
const SessionExpiredError = require("../../../errors/session.error.js");
const InvalidOtpError = require("../../../errors/otp/invalid-otp.error.js");
const OtpExpiredError = require("../../../errors/otp/otp-expired.error.js");

jest.mock("../../../services/auth/auth.service.js");

describe("POST /auth/register/verify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders an error when the registration session has expired", async () => {
    AuthService.completeRegistration.mockRejectedValue(
      new SessionExpiredError(),
    );

    const response = await request(app)
      .post("/auth/register/verify")
      .send({
        otp: ["1", "2", "3", "4", "5", "6"],
      });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain(
      "Registration session expired. Please register again.",
    );
  });

  it("renders an error when the OTP is invalid", async () => {
    AuthService.completeRegistration.mockRejectedValue(new InvalidOtpError());

    const response = await request(app)
      .post("/auth/register/verify")
      .send({
        otp: ["1", "2", "3", "4", "5", "6"],
      });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Invalid verification code");
  });

  it("renders an error when the OTP has expired", async () => {
    AuthService.completeRegistration.mockRejectedValue(new OtpExpiredError());

    const response = await request(app)
      .post("/auth/register/verify")
      .send({
        otp: ["1", "2", "3", "4", "5", "6"],
      });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Your verification code expired");
  });

  it("redirects to login after successful verification", async () => {
    AuthService.completeRegistration.mockResolvedValue();

    const response = await request(app)
      .post("/auth/register/verify")
      .send({
        otp: ["1", "2", "3", "4", "5", "6"],
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/auth/login");
  });
});
