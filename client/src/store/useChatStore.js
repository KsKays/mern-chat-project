import { create } from "zustand";
import api from "../services/api.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,
  isFriend: false,
  friendRequestSent: false,
  friendRequestReceived: false,

  //get user
  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await api.get("/message/users"); //เอา user ทุกคน ยกเว้นตัวเอง
      set({ users: res.data });
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Something went wrong while fecthing user"
      );
    } finally {
      set({ isUserLoading: false });
    }
  },

  //get messages
  getMessage: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await api.get("/message/" + userId);
      set({ messages: res.data });
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Something went wrong while getting message"
      );
    } finally {
      set({ isMessageLoading: false });
    }
  },

  //send messages
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    set({ isSendingMessage: true });
    try {
      console.log("User selected",selectedUser);
      const res = await api.post(
        "/message/send/" + selectedUser._id,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Something went wrong while sending message"
      );
    } finally {
      set({ isSendingMessage: false });
    }
  },

  //ส่งข้อความ
  subscribeToMessage: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      const isMessageSendFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSendFromSelectedUser) return;
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  //เลิกส่งข้อความเดิม
  unsubscribeFromMessage: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  ////เลือกส่งข้อความใหม่
  // setSelectedUser: (setSelectedUser) => {
  //   set({ selectedUser: setSelectedUser });
  // },

  addFriend: async (friendId) => {
     console.log("Sending friend request to:", friendId); // ตรวจสอบค่าก่อนส่ง
    try {
      const res = await api.post("/friend/add", { friendId });
      toast.success(res.data.message);

      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("friendRequestSent", friendId);
      }
      set({ friendRequestSent: true });
    } catch (error) {
     
      toast.error(
        error.response.data.message ||
          "Something went wrong while adding friend"
      );
    }
  },

  acceptFriendRequest: async (friendId) => {
    try {
      const res = await api.post("/friend/accept", { friendId });
      toast.success(res.data.message);
      useAuthStore.getState().socket.emit("friendRequestAccepted", friendId);
      set({ isFriend: true, friendRequestReceived: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setIsFriend: (isFriend) => set({ isFriend }),
  setFriendRequestSent: (sent) => set({ friendRequestSent: sent }),
  setFriendRequestReceived: (received) =>
    set({ friendRequestReceived: received }),
}));
