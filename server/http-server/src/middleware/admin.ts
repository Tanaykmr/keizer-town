import dotenv from "dotenv";
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
dotenv.config();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "";
console.log("the admin jwt secret is: ", ADMIN_JWT_SECRET);

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
		res.status(403).json({message: "Unauthorized"});
		return;
	}
};
