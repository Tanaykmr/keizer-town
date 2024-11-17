import dotenv from "dotenv";
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.USER_JWT_SECRET || "";
console.log("the jwt secret is: ", JWT_SECRET);

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const header = req.headers["authorization"];
	const token = header?.split(" ")[1];

	if (!token) {
		res.status(403).json({message: "Unauthorized"});
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as {role: string; userId: string};
		if (decoded.role !== "User") {
			res.status(403).json({message: "Unauthorized, only users allowed"});
			return;
		}
		req.userId = decoded.userId;
		next();
	} catch (e) {
		res.status(401).json({message: "Unauthorized"});
		return;
	}
};
