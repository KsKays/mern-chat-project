import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "./../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filterUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filterUsers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error while getting users info" });
  }
};
