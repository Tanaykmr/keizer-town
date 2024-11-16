import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { SignupSchema } from "../../types";
import client from "@repo/db/client";

export const router = Router();

router.get("/signup", async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Message validation failed",
            errors: parsedData.error.errors,
        });
        return;
    }

    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: parsedData.data.password,
                role: parsedData.data.type === "admin" ? "Admin" : "User",
            },
        });

            res.json({userId: user.id})

    } catch (e) {
        console.log("unable to create user: ", e)
        res.status(400).json({ message: "User already exists" });
    }
});

router.get("/signin", (req, res) => {
    res.json({
        message: "Signin",
    });
});

router.get("/elements", (req, res) => {});

router.get("/avatars", (req, res) => {});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
