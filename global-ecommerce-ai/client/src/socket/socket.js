import { io } from "socket.io-client";

const userInfo = JSON.parse(
  localStorage.getItem("userInfo")
);

const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl;
  }
  const backendHost = window.location.hostname;
  return `${window.location.protocol}//${backendHost}:5000`;
};

const socket = io(
  getSocketUrl(),
  {
    auth: {
      token: userInfo?.token,
    },
    transports: ["websocket"],
  }
);

export default socket;