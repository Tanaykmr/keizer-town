import {Router} from "express";
import {userRouter} from "./user";
import {spaceRouter} from "./space";
import {adminRouter} from "./admin";
import {SigninSchema, SignupSchema} from "../../types/types";
import prisma from "../../db/prisma";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "";
const USER_JWT_SECRET = process.env.USER_JWT_SECRET || "";
// TODO: hash passwords

export const router = Router();

router.post("/signup", async (req, res) => {
	const parsedData = SignupSchema.safeParse(req.body);
	if (!parsedData.success) {
		res.status(400).json({
			message: "Sign up message validation failed",
			errors: parsedData.error.errors,
		});
		return;
	}

	try {
		const user = await prisma.user.create({
			data: {
				username: parsedData.data.username,
				password: parsedData.data.password,
				role: parsedData.data.type === "admin" ? "Admin" : "User",
			},
		});

		res.json({userId: user.id});
	} catch (e) {
		// console.log("unable to create user: ", e);
		res.status(400).json({message: "User already exists"});
	}
});

router.post("/signin", async (req, res) => {
	const parsedData = SigninSchema.safeParse(req.body);
	if (!parsedData.success) {
		res.status(400).json({
			message: "Sign in message validation failed",
			errors: parsedData.error.errors,
		});
		return;
	}
	try {
		const existingUser = await prisma.user.findUnique({
			where: {
				username: parsedData.data.username,
			},
		});

		if (!existingUser) {
			res.status(403).json({message: "User not found"});
			return;
		}

		const isValid = existingUser.password === parsedData.data.password;

		if (!isValid) {
			res.status(403).json({message: "Incorrect password"});
			return;
		}

		const token = jwt.sign(
			{
				userId: existingUser.id,
				role: existingUser.role,
			},
			(existingUser.role === "Admin") ? ADMIN_JWT_SECRET : USER_JWT_SECRET,
		);

		res.json({
			token,
		});
	} catch (e) {
		console.log("unable to find user: ", e);
		res.status(400).json({message: "User does not exist"});
	}
});

router.get("/elements", async (req, res) => {
	const elements = await prisma.element.findMany();
	res.json({
		elements: elements.map((e) => ({
			id: e.id,
			imageUrl: e.imageUrl,
			width: e.width,
			height: e.height,
			static: e.static,
		})),
	});
});

router.get("/avatars", async (req, res) => {
	const avatars = await prisma.avatar.findMany();
	res.json({
		avatars: avatars.map((e) => ({
			id: e.id,
			imageUrl: e.imageUrl,
			name: e.name,
		})),
	});
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
