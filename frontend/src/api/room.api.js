import api from "./axios";

export const createRoom = async () => {
  const res = await api.post("/api/rooms/create");
  return res.data;
};

export const joinRoom = async (roomId) => {
  const res = await api.get(`/api/rooms/${roomId}`);
  return res.data;
};