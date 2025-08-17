const request = require("supertest");
const app = require("../app");

describe("Journal Operations", () => {
  let userToken;
  let journalId;

  beforeAll(async () => {
    // user login to get token
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "astrastone19@gmail.com", password: "pokemon" });
    userToken = res.body.token;
  });

  test("Create journal entry", async () => {
    const res = await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Test Journal",
        content: "This is a test journal entry",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    journalId = res.body.id;
  });

  test("Get user journals", async () => {
    const res = await request(app)
      .get("/api/journals")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test("Get single journal", async () => {
    const res = await request(app)
      .get(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", journalId);
  });

  test("Update journal", async () => {
    const res = await request(app)
      .put(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Updated Journal",
        content: "Updated content",
      });

    expect(res.statusCode).toEqual(200);
  });

  test("Delete journal", async () => {
    const res = await request(app)
      .delete(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
  });
});
