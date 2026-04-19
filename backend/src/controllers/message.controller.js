import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { handle200, handle201 } from "../helper/successHandler.js";
import { formatMongooseError, handle404 } from "../helper/errorHandler.js";

/**
 * Get all available contacts (excluding self)
 */
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

/**
 * Get messages between current user and another user
 */
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

/**
 * Send a message
 */
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
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
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

/**
 * Get users with whom the current user has chatted
 */
export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
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
