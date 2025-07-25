import { Hono } from "hono";
import { prisma } from "../db/prisma";
import { Direction, DayType } from "@prisma/client";

const timetableApi = new Hono();

timetableApi.get("/departures", async (c) => {
  const direction = c.req.query("direction") as Direction;
  const dayType = c.req.query("dayType") as DayType;

  const where: any = {};
  if (direction) where.direction = direction;
  if (dayType) where.dayType = dayType;

  try {
    const departures = await prisma.departure.findMany({
      where,
      orderBy: {
        departureTime: "asc",
      },
    });

    return c.json(departures);
  } catch (error) {
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

timetableApi.post("/departures", async (c) => {
  try {
    const body = await c.req.json();

    const departure = await prisma.departure.create({
      data: {
        direction: body.direction,
        dayType: body.dayType,
        departureTime: body.departureTime,
        destination: body.destination,
        note: body.note,
      },
    });

    return c.json(departure, 201);
  } catch (error) {
    return c.json({ error: "Failed to create departure" }, 500);
  }
});

export { timetableApi };
