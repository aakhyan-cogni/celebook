import { Router } from "express";
import { getEvents } from "../controllers/event.controller.js";

export const eventRouter = Router();

eventRouter.get("/", getEvents);
