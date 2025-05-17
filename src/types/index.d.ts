declare global {
	interface SocketData {
		userId: string;
		roomId: string;
	}
	interface Message {
		senderId: string;
		content: string;
		timestamp: Date;
	}
}