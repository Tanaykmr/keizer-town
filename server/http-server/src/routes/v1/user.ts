import { Request, Response, Router } from "express";
import prisma from "../../db/prisma";
import { adminMiddleware } from "../../middleware/admin";

export const userRouter = Router();

userRouter.post("/metadata", adminMiddleware, async (req: Request, res: Response) => {
	const avatarId = req.body.avatarId;

	if (!avatarId) {
		res.status(400).json({message: "Avatar ID is required"});
	}

	try {
		await prisma.user.update({
			where: {
				id: req.userId,
			},
			data: {
				avatarId,
			},
		});

		res.json({success: true});
	} catch (error) {
		console.error("Error updating user metadata:", error);
		res.status(400).json({message: "Failed to update user metadata"});
	}
});

userRouter.post("/metadata", async (req, res) => {
	res.status(501).json({message: "Not implemented"});
});

userRouter.post("/metadata/bulk", async (req, res) => {});
