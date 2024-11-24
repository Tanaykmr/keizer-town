import dotenv from "dotenv";
import jwt, {JwtPayload} from "jsonwebtoken";
import {WebSocket} from "ws";
import prisma from "../../http-server/src/db/prisma";
import {RoomManager} from "./RoomManager";
import {OutgoingMessage} from "./types/types";
dotenv.config();

const USER_JWT_SECRET = process.env.USER_JWT_SECRET || "";
function getRandomString(length: number) {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

// TODO: only letting users join the space for now, allowing admins to do so will come later
export class User {
	public id: string;
	public userId?: string;
	private spaceId?: string;
	private x: number;
	private y: number;
	private ws: WebSocket;

	constructor(ws: WebSocket) {
		this.id = getRandomString(10);
		this.x = 0;
		this.y = 0;
		this.ws = ws;
		this.initHandlers();
	}

	initHandlers() {
		this.ws.on("message", async (data) => {
			console.log(data);
			const parsedData = JSON.parse(data.toString());
			console.log("parsedData: ");
			console.log(parsedData);
			switch (parsedData.type) {
				case "join":
					console.log("join recieved");
					const spaceId = parsedData.payload.spaceId;
					const token = parsedData.payload.token;
					const userId = (jwt.verify(token, USER_JWT_SECRET) as JwtPayload).userId;
					if (!userId) {
						console.log("userId does not exist");
						this.ws.close();
						return;
					}
					this.userId = userId;
					const space = await prisma.space.findFirst({
						where: {
							id: spaceId,
						},
					});
					if (!space) {
						console.log("space does not exist");
						this.ws.close();
						return;
					}
					this.spaceId = spaceId;
					RoomManager.getInstance().addUser(spaceId, this);
					this.x = Math.floor(Math.random() * space?.width);
					this.y = Math.floor(Math.random() * space?.height);
					this.send({
						type: "space-joined",
						payload: {
							spawn: {
								x: this.x,
								y: this.y,
							},
							users:
								RoomManager.getInstance()
									.rooms.get(spaceId)
									?.filter((x) => x.id !== this.id)
									?.map((u) => ({id: u.id})) ?? [],
						},
					});
					console.log("jouin receiverdf5");
					RoomManager.getInstance().broadcast(
						{
							type: "user-joined",
							payload: {
								userId: this.userId,
								x: this.x,
								y: this.y,
							},
						},
						this,
						this.spaceId!,
					);
					break;
				case "move":
					const moveX = parsedData.payload.x;
					const moveY = parsedData.payload.y;
					const xDisplacement = Math.abs(this.x - moveX);
					const yDisplacement = Math.abs(this.y - moveY);
					if ((xDisplacement == 1 && yDisplacement == 0) || (xDisplacement == 0 && yDisplacement == 1)) {
						this.x = moveX;
						this.y = moveY;
						RoomManager.getInstance().broadcast(
							{
								type: "movement",
								payload: {
									x: this.x,
									y: this.y,
								},
							},
							this,
							this.spaceId!,
						);
						return;
					}

					this.send({
						type: "movement-rejected",
						payload: {
							x: this.x,
							y: this.y,
						},
					});
			}
		});
	}

	destroy() {
		RoomManager.getInstance().broadcast(
			{
				type: "user-left",
				payload: {
					userId: this.userId,
				},
			},
			this,
			this.spaceId!,
		);
		RoomManager.getInstance().removeUser(this, this.spaceId!);
	}

	send(payload: OutgoingMessage) {
		this.ws.send(JSON.stringify(payload));
	}
}
