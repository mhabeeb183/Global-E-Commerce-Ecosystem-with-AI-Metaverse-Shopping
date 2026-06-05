import { io } from "socket.io-client";

const userInfo = JSON.parse(
  localStorage.getItem("userInfo")
);

const socket = io(
  "http://localhost:5000",
  {
    auth: {
      token: userInfo?.token,
    },
    transports: ["websocket"],
  }
);

export default socket;