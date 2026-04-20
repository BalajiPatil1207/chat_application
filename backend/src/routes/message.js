import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { 
  getAllContacts, 
  getChatPartners, 
  getMessagesByUserId, 
  sendMessage,
  markMessagesAsSeen
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", authenticateToken, getAllContacts);
router.get("/partners", authenticateToken, getChatPartners);
router.get("/:id", authenticateToken, getMessagesByUserId);

router.post("/send/:id", authenticateToken, sendMessage);
router.put("/seen/:id", authenticateToken, markMessagesAsSeen);

export default router;