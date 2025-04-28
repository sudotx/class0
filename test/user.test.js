import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import "dotenv/config";
import User from "../src/models/user.js";

describe("User API", () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/test_db",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("GET /:id", () => {
    it("should retrieve a user by id", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
      await user.save();

      const response = await request(app).get(`/api/users/${user._id}`);
      expect(response.status).toBe(200);
      expect(response.body.message.name).toBe("Test User");
    });

    it("should return 404 if user not found", async () => {
      const response = await request(app).get(
        "/api/users/60f1a5c5c5b7f40015f1a5c5"
      );
      expect(response.status).toBe(404);
    });
  });

  describe("GET /", () => {
    it("should retrieve a paginated list of users", async () => {
      await User.create([
        { name: "User 1", email: "user1@example.com", password: "password1" },
        { name: "User 2", email: "user2@example.com", password: "password2" },
      ]);

      const response = await request(app).get("/api/users?page=1&limit=2");
      expect(response.status).toBe(200);
      expect(response.body.users.length).toBe(2);
      expect(response.body.currentPage).toBe(1);
    });
  });

  describe("POST /", () => {
    it("should create a new user", async () => {
      const userData = {
        name: "New User",
        email: "newuser@example.com",
        password: "newpassword",
      };
      const response = await request(app).post("/api/users").send(userData);
      expect(response.status).toBe(200);
      expect(response.body.message.name).toBe("New User");
    });
  });

  describe("PUT /:id", () => {
    it("should update an existing user", async () => {
      const user = new User({
        name: "Old Name",
        email: "old@example.com",
        password: "oldpassword",
      });
      await user.save();

      const response = await request(app).put(`/api/users/${user._id}`).send({
        name: "Updated Name",
        email: "updated@example.com",
        password: "updatedpassword",
      });
      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe("Updated Name");
    });
  });

  describe("DELETE /:id", () => {
    it("should delete a user", async () => {
      const user = new User({
        name: "Delete Me",
        email: "delete@example.com",
        password: "deletepassword",
      });
      await user.save();

      const response = await request(app).delete(`/api/users/${user._id}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User deleted successfully");
    });
  });
});
