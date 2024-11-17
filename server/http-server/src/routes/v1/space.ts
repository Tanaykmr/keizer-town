import { Router } from "express";

export const spaceRouter = Router();

spaceRouter.post("/", async (req, res) => {});

spaceRouter.delete("/:spaceID", async (req, res) => {});

spaceRouter.get("/all", async (req, res) => {});

spaceRouter.get("/:spaceId", async (req, res) => {});

spaceRouter.delete("/element", async (req, res) => {});
