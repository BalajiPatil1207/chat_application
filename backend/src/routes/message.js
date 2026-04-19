import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { 
  getAllContacts, 
  getChatPartners, 
  getMessagesByUserId, 
  sendMessage 
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", authenticateToken, getAllContacts);
router.get("/partners", authenticateToken, getChatPartners);
router.get("/:id", authenticateToken, getMessagesByUserId);

router.post("/send/:id", authenticateToken, sendMessage);

export default router;