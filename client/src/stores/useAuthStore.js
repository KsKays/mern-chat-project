import { create } from "zustand";
import api from "../services/api.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isSigningIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],

  //Check Auth
  checkAuth: async () => {
    try {
      const res = await api.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  //Sign Up (data) === {email, password}
  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await api.post("/auth/signup", data);  
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response.data.message || "Sign up failed!");
    } finally {
      set({ isSigningUp: false });
    }
  },

  //Sign In (data) === {email, password}
  signIn: async (data) => {
    set({ isSigningIn: true });
    try {
      const res = await api.post("/auth/signin", data);
      console.log("🔹 API Response:", res); // ตรวจสอบ API ส่งอะไรกลับมา
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Login Error:", error); // ดูว่า error เป็นอะไร
      toast.error(error.response.data.message || "Login failed!");
    } finally {
      set({ isSigningIn: false });
    }
  },

  //Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed!");
    }
  },

  //Update Profile (data) === {name, email}
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await api.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response.data.message || "Profile update failed!");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  //Connect Socket
 connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;
    const socketURL = import.meta.env.VITE_SOCKET_URL;
    const newSocket = io(socketURL, { query: { userId: authUser._id } });
    newSocket.connect();
    set({ socket: newSocket });
    //listen for online users
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
      console.log("Online users", userIds);
    });
  },

  //Disconnect Socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
