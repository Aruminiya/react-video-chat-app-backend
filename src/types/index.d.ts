export interface SocketData {
	userId: string;
	roomId: string;
}

export interface Message {
	senderId: string;
	content: string;
	timestamp: Date;
}