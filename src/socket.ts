const { Server } = require("socket.io");
import type { Socket } from "socket.io";

// 初始化 Socket.io 伺服器，負責處理 WebRTC 信令交換（offer、answer 和 ICE candidate）
// 參數 server 是 HTTP 伺服器（通常由 Express 創建）
export function setupSocket(server: any) {
  // 創建 Socket.io 伺服器實例，綁定到傳入的 HTTP 伺服器
  // 配置 CORS 以允許前端跨域請求（例如從 http://localhost:3000）
  const io = new Server(server, {
    cors: {
      origin: "*", // 允許所有來源（開發環境用，生產環境應限制為前端域名）
      methods: ["GET", "POST"],
      credentials: true // 允許攜帶認證資訊
    }
  });

  // 監聽用戶連線事件，當前端通過 Socket.io 連接到伺服器時觸發
  io.on("connection", (socket: Socket) => {
    console.log("A user connected");

    // 處理建立房間事件，當前端發送 "create" 事件時觸發
    // 用戶通過輸入 roomId 創建一個房間，後端將其 socket 加入該房間
    socket.on("create", ({ roomId }) => {
      // 將當前 socket 加入指定的房間（roomId）
      socket.join(roomId);
      console.log(`Room created: ${roomId}`);
    });

    // 處理加入房間事件，當前端發送 "join" 事件時觸發
    // 用戶通過輸入相同的 roomId 加入現有房間，後端將其 socket 加入該房間
    socket.on("join", ({ roomId }) => {
      // 將當前 socket 加入指定的房間（roomId）
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // 處理 offer 事件，當前端發送 "offer" 事件時觸發
    // offer 包含 WebRTC 的 SDP 資訊，由加入房間的用戶創建並發送（通常在 setLocalDescription(offer) 後）
    socket.on("offer", ({ roomId, offer }) => {
      // 將 offer 轉發給房間內的其他用戶（不包括發送者）
      // 接收者會調用 setRemoteDescription(offer) 處理該 SDP
      socket.to(roomId).emit("offer", { offer });
    });

    // 處理 answer 事件，當前端發送 "answer" 事件時觸發
    // answer 包含 WebRTC 的 SDP 資訊，由建立房間的用戶創建並回應（通常在 setLocalDescription(answer) 後）
    socket.on("answer", ({ roomId, answer }) => {
      // 將 answer 轉發給房間內的其他用戶（不包括發送者）
      // 接收者會調用 setRemoteDescription(answer) 完成 SDP 協商
      socket.to(roomId).emit("answer", { answer });
    });

    // 處理 ICE candidate 事件，當前端發送 "candidate" 事件時觸發
    // ICE candidate 是在前端調用 setLocalDescription 後，由 RTCPeerConnection 收集並通過 onicecandidate 事件發送
    socket.on("candidate", ({ roomId, candidate }) => {
      // 將 ICE candidate 轉發給房間內的其他用戶（不包括發送者）
      // 接收者會調用 addIceCandidate 將 candidate 添加到 RTCPeerConnection
      // 這是建立點對點連線的關鍵步驟，幫助雙方找到最佳網路路徑
      socket.to(roomId).emit("candidate", { candidate });
    });

    // 處理用戶斷線事件，當前端斷開 Socket.io 連線時觸發
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}