import dotenv from "dotenv";
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
dotenv.config();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "";
const USER_JWT_SECRET = process.env.USER_JWT_SECRET || "";
console.log("the admin jwt secret is: ", ADMIN_JWT_SECRET);
console.log("the user jwt secret is: ", USER_JWT_SECRET);

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const header = req.headers["authorization"];
	const token = header?.split(" ")[1];

	if (!token) {
		res.status(403).json({message: "Unauthorized"});
		return;
	}

	try {
		const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as {role: string; userId: string};
		if (decoded.role !== "Admin") {
			res.status(403).json({message: "Unauthorized, only admins allowed"});
			return;
		}
		req.userId = decoded.userId;
		next();
	} catch (e) {
		try {
			const decoded = jwt.verify(token, USER_JWT_SECRET) as {role: string; userId: string};
			if (decoded.role !== "User") {
				res.status(403).json({message: "Unauthorized, only user allowed"});
				return;
			}
			req.userId = decoded.userId;
			next();
		} catch (e) {
			res.status(401).json({message: "Unauthorized"});
			return;
		}
	}
};
