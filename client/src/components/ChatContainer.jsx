import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils.js";
import { acceptFriendRequest } from "../../../server/src/controllers/friend.controller.js";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    isMessageLoading,
    subscribeToMessage,
    unsubscribeFromMessage,
    getMessage,
    isFriend,
    friendRequestSent,
    friendRequestReceived,
    addFriend,
    setIsFriend,
    setFriendRequestSent,
    setFriendRequestReceived,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  //get chat messages
  useEffect(() => {
    //get history messages
    getMessage(selectedUser._id);
    //listen to socket
    subscribeToMessage();
    return () => {
      unsubscribeFromMessage();
    };
  }, [
    selectedUser._id,
    getMessage,
    subscribeToMessage,
    unsubscribeFromMessage,
  ]);

  const handleAcceptRequest = () => {
    acceptFriendRequest(selectedUser._id);
    setIsFriend(true), setFriendRequestReceived(false);
    getMessage(selectedUser);
  };

  //Fix it
  useEffect(() => {
    if (authUser && selectedUser) {
      setIsFriend(
        authUser.friends && authUser.friends.includes(selectedUser._id)
      );
      setFriendRequestReceived(
        authUser.friendRequests &&
          authUser.friendRequests.includes(selectedUser._id)
      );
      setFriendRequestReceived(
        selectedUser.friendRequests &&
          selectedUser.friendRequests.includes(authUser._id)
      );
      setFriendRequestSent(
        selectedUser.friendRequests &&
          selectedUser.friendRequests.includes(authUser._id)
      );
    }
  }, [
    authUser,
    selectedUser,
    setIsFriend,
    setFriendRequestReceived,
    setFriendRequestSent,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleAddFriend = () => {
    addFriend(selectedUser);
  };

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flexcol overflow-auto">
        <ChatHeader />
        <MessageInput />
        <MessageSkeleton />
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      {!isFriend && !friendRequestSent && !friendRequestReceived && (
        <div className="p-4 text-center text-red-500">
          You must be friend with this {selectedUser.fullName} to send message.
          <button className="btn btn-sm   mx-2" onClick={handleAddFriend}>
            Add friend
          </button>
        </div>
      )}

      {!isFriend && friendRequestSent && !friendRequestReceived && (
        <div className="p-4 text-center text-red-500">
          Friend request sent. Waiting for acceptance.
        </div>
      )}
      {!isFriend && !friendRequestSent && friendRequestReceived && (
        <div className="p-4 text-center text-red-500">
          This user has sent you a friend request
          <button className="btn btn-sm   mx-2" onClick={handleAcceptRequest}>
            Accept friend request
          </button>
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
