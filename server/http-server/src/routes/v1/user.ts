import { Router } from "express";
import prisma from "../../db/prisma";
import { authMiddleware } from "../../middleware/authMiddleware";
import { UpdateMetadataSchema } from "../../types/types";

export const userRouter = Router();

userRouter.post("/metadata", authMiddleware, async (req, res) => {
	const parsedData = UpdateMetadataSchema.safeParse(req.body);
	if (!parsedData.success) {
		console.log("parsed data incorrect");
		res.status(400).json({message: "Validation failed"});
		return;
	}
	try {
		await prisma.user.update({
			where: {
				id: req.userId,
			},
			data: {
				avatarId: parsedData.data.avatarId,
			},
		});
		res.json({message: "Metadata updated"});
	} catch (e) {
		res.status(400).json({message: "Incorrect avatar ID"});
	}
});

userRouter.get("/metadata/bulk", async (req, res) => {
	const userIdString = (req.query.ids ?? "[]") as string;
	const userIds = userIdString.slice(1, userIdString?.length - 1).split(",");
	console.log("userIds are: ", userIds);
	const metadata = await prisma.user.findMany({
		where: {
			id: {
				in: userIds,
			},
		},
		select: {
			avatar: true,
			id: true,
		},
	});

	res.json({
		avatars: metadata.map((m) => ({
			userId: m.id,
			avatarId: m.avatar?.imageUrl,
		})),
	});
});
