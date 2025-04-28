import { jest } from "@jest/globals";

// Mock the Resend module
jest.unstable_mockModule("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: "test_id" }),
    },
  })),
}));
