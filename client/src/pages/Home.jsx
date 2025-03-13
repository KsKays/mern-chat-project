import React from "react";
import { useAuthStore } from "../stores/useAuthStore";

const Home = () => {
  const { onlineUsers } = useAuthStore(); // ✅ ต้องเรียก useAuthStore()

  return (
    <div className="flex items-center justify-center mt-20">
      <h2 className="text-xl font-semibold">
        ออนไลน์: {onlineUsers.length} คน
      </h2>
    </div>
  );
};

export default Home;
