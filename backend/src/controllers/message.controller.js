import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { handle200, handle201 } from "../helper/successHandler.js";
import { formatMongooseError, handle404, handle400 } from "../helper/errorHandler.js";


export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    return handle200(res, filteredUsers, "Contacts fetched successfully");
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    return formatMongooseError(res, error);
  }
};


export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    return handle200(res, messages, "Messages fetched successfully");
  } catch (error) {
    console.error("Error in getMessagesByUserId:", error);
    return formatMongooseError(res, error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return handle400(res, "Text or image is required.");
    }

    if (senderId.equals(receiverId)) {
      return handle400(res, "Cannot send messages to yourself.");
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return handle404(res, "Receiver not found");
    }

    let imageUrl;
    let cloudinaryId;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
      cloudinaryId = uploadResponse.public_id;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      cloudinaryId,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return handle201(res, newMessage, "Message sent successfully");
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    return formatMongooseError(res, error);
  }
};


export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    return handle200(res, chatPartners, "Chat partners fetched successfully");
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    return formatMongooseError(res, error);
  }
};
export const markMessagesAsSeen = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: senderId } = req.params;

    // Update messages where I am the receiver and the specified user is the sender
    await Message.updateMany(
      { senderId: senderId, receiverId: myId, isSeen: false },
      { $set: { isSeen: true } }
    );

    // Notify the sender that their messages have been seen
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { seenBy: myId });
    }

    return handle200(res, null, "Messages marked as seen");
  } catch (error) {
    console.error("Error in markMessagesAsSeen:", error);
    return formatMongooseError(res, error);
  }
};
