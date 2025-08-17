const request = require("supertest");
const app = require("../app");

describe("Appointment Operations", () => {
  let userToken;
  let adminToken;
  let appointmentId;

  beforeAll(async () => {
    // login as user and admin
    const userRes = await request(app)
      .post("/api/users/login")
      .send({ email: "astrastone19@gmail.com", password: "pokemon" });
    userToken = userRes.body.token;

    const adminRes = await request(app)
      .post("/api/users/login")
      .send({ email: "koyukisky18@gmail.com", password: "realme" });
    adminToken = adminRes.body.token;
  });

  test("User can create appointment", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        scheduledAt: futureDate.toISOString(),
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    appointmentId = res.body.id;
  });

  test("User can get their appointments", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test("Admin can get all appointments", async () => {
    const res = await request(app)
      .get("/api/appointments/admin/all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test("Admin can update appointment status", async () => {
    const res = await request(app)
      .put(`/api/appointments/admin/${appointmentId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "approved",
      });

    expect(res.statusCode).toEqual(200);
  });

  test("User can delete their appointment", async () => {
    const res = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${userToken}`);

    // add timeout and debugging
    console.log("Delete appointment response:", res.status, res.body);
    expect(res.statusCode).toEqual(200);
  }, 10000);
});
