import { Hono } from "hono";
import { prisma } from "../db/prisma";
import { Direction, DayType } from "@prisma/client";

const timetableApi = new Hono();

timetableApi.get("/departures", async (c) => {
  const direction = c.req.query("direction") as Direction | undefined;
  const dayType = c.req.query("dayType") as DayType | undefined;

  try {
    const departures = await prisma.departure.findMany({
      where: { direction, dayType },
      orderBy: { departureTime: "asc" },
    });

    return c.json(departures);
  } catch {
    return c.json({ error: "Failed to fetch departures" }, 500);
  }
});

timetableApi.get("/departures/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    const departure = await prisma.departure.findUnique({
      where: { id },
    });

    if (!departure) {
      return c.json({ error: "Departure not found" }, 404);
    }

    return c.json(departure);
  } catch (error) {
    return c.json({ error: "Failed to fetch departure" }, 500);
  }
});

export { timetableApi };
