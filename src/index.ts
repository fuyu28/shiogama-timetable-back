import { Hono } from "hono";
import { cors } from "hono/cors";
import { timetableApi } from "./api/timetable";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({ message: "Shiogama Timetable API" });
});

app.route("/api", timetableApi);

export default app;
