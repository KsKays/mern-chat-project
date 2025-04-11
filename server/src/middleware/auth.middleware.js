import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    // console.log("Token received:", token); // ตรวจสอบว่า token ถูกส่งมาหรือไม่

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    // แก้ไขจุดนี้: เพิ่ม console.log
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Data:", decoded); // ตรวจสอบว่า decoded ได้ค่าถูกไหม

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // แก้ไขจุดนี้: ตรวจสอบว่า userId มีค่าและหา User
    const user = await User.findById(decoded.userId).select("-password");
    // console.log("User from DB:", user); // ตรวจสอบว่าพบ user หรือไม่

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // กำหนดค่า req.user ให้ middleware ถัดไป
    next();
  } catch (error) {
    // console.error("Error in protectedRoute:", error);
    res.status(500).json({ message: "Internal server error while checking token" });
  }
};
