const { formatDate } = require("../utils/formatDate.js");

describe("formatDate", () => {
  it("should format a date", () => {
    const result = formatDate("2026-10-07T10:30:00Z");

    expect(result).toContain("2026");
    expect(result).toContain("Oct");
  });
});
