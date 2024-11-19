import {Router} from "express";
import prisma from "../../db/prisma";
import {adminMiddleware} from "../../middleware/admin";
import {CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema} from "../../types/types";

export const adminRouter = Router();
adminRouter.use(adminMiddleware);

adminRouter.post("/element", async (req, res) => {
	const parsedData = CreateElementSchema.safeParse(req.body);
	if (!parsedData.success) {
		res.status(400).json({message: "Validation failed"});
		return;
	}

	const element = await prisma.element.create({
		data: {
			width: parsedData.data.width,
			height: parsedData.data.height,
			static: parsedData.data.static,
			imageUrl: parsedData.data.imageUrl,
		},
	});

	res.json({
		id: element.id,
	});
});

adminRouter.put("/element/:elementId", (req, res) => {
	const parsedData = UpdateElementSchema.safeParse(req.body);
	if (!parsedData.success) {
		res.status(400).json({message: "Validation failed"});
		return;
	}
	prisma.element.update({
		where: {
			id: req.params.elementId,
		},
		data: {
			imageUrl: parsedData.data.imageUrl,
		},
	});
	res.json({message: "Element updated"});
});

adminRouter.post("/avatar", async (req, res) => {
	const parsedData = CreateAvatarSchema.safeParse(req.body);
	if (!parsedData.success) {
		res.status(400).json({message: "Validation failed"});
		return;
	}
	const avatar = await prisma.avatar.create({
		data: {
			name: parsedData.data.name,
			imageUrl: parsedData.data.imageUrl,
		},
	});
	res.json({avatarId: avatar.id});
});

adminRouter.post("/map", async (req, res) => {
	const parsedData = CreateMapSchema.safeParse(req.body);
	if (!parsedData.success) {
		res.status(400).json({message: "Validation failed"});
		return;
	}
	const map = await prisma.map.create({
		data: {
			name: parsedData.data.name,
			width: parseInt(parsedData.data.dimensions.split("x")[0]),
			height: parseInt(parsedData.data.dimensions.split("x")[1]),
			thumbnail: parsedData.data.thumbnail,
			mapElements: {
				create: parsedData.data.defaultElements.map((e) => ({
					elementId: e.elementId,
					x: e.x,
					y: e.y,
				})),
			},
		},
	});

	res.json({
		id: map.id,
	});
});
