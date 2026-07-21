import { AUTH_PASSWORD, AUTH_STORAGE_KEY, AUTH_USER, validateCredentials } from "@/lib/auth";

describe("auth", () => {
  it("accepts the MVP credentials", () => {
    expect(validateCredentials(AUTH_USER, AUTH_PASSWORD)).toBe(true);
  });

  it("rejects invalid credentials", () => {
    expect(validateCredentials("wrong", AUTH_PASSWORD)).toBe(false);
    expect(validateCredentials(AUTH_USER, "wrong")).toBe(false);
  });

  it("supports trimmed username input", () => {
    expect(validateCredentials(`  ${AUTH_USER}  `, AUTH_PASSWORD)).toBe(true);
  });

  it("uses a stable storage key", () => {
    expect(AUTH_STORAGE_KEY).toBe("pm-authenticated");
  });
});
