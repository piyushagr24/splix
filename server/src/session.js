import bcrypt from "bcryptjs"; 
import express from "express";
import jwt from "jsonwebtoken"; 
import Joi from "joi"; // For validating request bodies
import { env } from "./env.js";
import { Group } from "./models/Group.js";
import { authLimiter } from "./rateLimiter.js";
import { validateBody } from "./validate.js";


const sessionSchema = Joi.object({
  editId: Joi.string().trim().required(),
  pin: Joi.string().pattern(/^\d{4}$/).required()
});

// Handler for creating a new session. It checks the provided editId and PIN against the database, and if valid, returns a JWT token.
async function createSession(req, res) {
  const { editId, pin } = req.body; 
  const group = await Group.findOne({ editId }).lean(); 
  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }
  const ok = await bcrypt.compare(pin, group.pinHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid PIN" });
  }


  const token = jwt.sign({ groupId: String(group._id), editId: group.editId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
  await Group.updateOne({ _id: group._id }, { $set: { lastActivityAt: new Date() } });

  return res.status(200).json({ token });
}

const router = express.Router();

// Route for creating a new session. It applies proxy-safe rate limiting and body validation middleware before calling the createSession handler.
router.post("/session", authLimiter, validateBody(sessionSchema), createSession);

export default router;
