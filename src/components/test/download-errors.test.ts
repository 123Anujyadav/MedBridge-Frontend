import { describe, expect, it } from "vitest";
import { describeDownloadFailure } from "@/lib/api";

/**
 * A download is fetched with `responseType: "blob"`, so when the server answers
 * with JSON the axios interceptor finds a `Blob` where it looks for `message`
 * and the rejection falls through to axios's own text. Clicking Download on a
 * report with no document showed the patient
 * "Request failed with status code 404".
 */

function blobOf(payload: unknown): Blob {
  return new Blob([JSON.stringify(payload)], { type: "application/json" });
}

describe("describeDownloadFailure", () => {
  it("reports a missing document in the words the user needs", async () => {
    const message = await describeDownloadFailure({
      response: { status: 404, data: blobOf({ message: "Report document ... not found." }) },
    });
    expect(message).toBe("Report not available.");
  });

  it("reports a refusal as a permission problem, not a fault", async () => {
    const message = await describeDownloadFailure({ response: { status: 403, data: blobOf({}) } });
    expect(message).toBe("You do not have access to this report.");
  });

  it("recovers the API's own message from a blob body", async () => {
    const message = await describeDownloadFailure({
      response: { status: 500, data: blobOf({ message: "Database operation failed." }) },
    });
    expect(message).toBe("Database operation failed.");
  });

  it("never surfaces axios transport text", async () => {
    const message = await describeDownloadFailure({
      message: "Request failed with status code 500",
      response: { status: 500, data: new Blob(["<html>oops</html>"]) },
    });
    expect(message).not.toContain("status code");
    expect(message).toBe("This report could not be downloaded. Please try again.");
  });

  it("survives an error with no response at all", async () => {
    const message = await describeDownloadFailure(new Error("Network Error"));
    expect(message).toBe("This report could not be downloaded. Please try again.");
  });

  it("survives a non-JSON blob without throwing", async () => {
    const message = await describeDownloadFailure({
      response: { status: 502, data: new Blob(["not json at all"]) },
    });
    expect(message).toBe("This report could not be downloaded. Please try again.");
  });
});
