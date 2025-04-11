import User from "../models/user.model.js";

export const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;
    console.log("friend:", friendId, "user:", userId);

    if (userId === friendId) {
      return res
        .status(400)
        .json({ message: "You connot add yourself as a friend " });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ message: "Friend not found" });

    //Check if already friend
    if (user.friends.includes(friendId))
      res.status(400).json({ message: "User is already a friend" });

    if (user.friendRequests.includes(friendId)) {
      user.friends.push(friendId);
      friend.friends.push(userId);
      user.friendRequests = user.friendRequests.filter(
        (id) => friendId !== id.toString()
      );
      friend.friendRequests = friend.friendRequests.filter(
        (id) => userId !== id.toString()
      );
      await user.save();
      await friend.save();

      return res.status(200).json({ message: "Friend request accepted" });
    }

    if (!friend.friendRequests.includes(userId)) {
      friend.friendRequests.push(userId);
      await friend.save();
    }
    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error while adding a new friend" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body; //id ของเพื่อน
    const userId = req.user._id; //id ของเรา
    // console.log("friend:", friendId, "user:", userId);
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ message: "Friend not found" });

    if (!user.friendRequests.includes(friendId))
      return res
        .status(404)
        .json({ message: "No friend request from this user" });

    user.friends.push(friendId);
    friend.friends.push(userId);
    return res.status(200).json({ message: "friend request accepted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error while accepting a new friend" });
  }
};

// export const acceptFriendRequest = async (req, res) => {
//   try {
//     const { friendId } = req.body; // id ของเพื่อน
//     const userId = req.user._id; // id ของเรา
//     console.log("friend:", friendId, "user:", userId);

//     const user = await User.findById(userId);
//     const friend = await User.findById(friendId);

//     if (!friend) return res.status(404).json({ message: "Friend not found" });

//     if (!user.friendRequests.includes(friendId))
//       return res
//         .status(404)
//         .json({ message: "No friend request from this user" });

//     // Accepting the friend request
//     user.friends.push(friendId);
//     friend.friends.push(userId);

//     // Remove friendId from friendRequests for both users
//     user.friendRequests = user.friendRequests.filter(
//       (id) => friendId !== id.toString()
//     );
//     friend.friendRequests = friend.friendRequests.filter(
//       (id) => userId !== id.toString()
//     );

//     await user.save(); // Save after updates
//     await friend.save(); // Save after updates

//     return res.status(200).json({ message: "Friend request accepted" });
//   } catch (error) {
//     console.error(error); // Log error for debugging
//     res.status(500).json({
//       message: "Internal Server Error while accepting a new friend",
//     });
//   }
// };
