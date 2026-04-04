import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { Group } from "./models/Group.js";

// middleware for edit group , checks for valid jwt token
// ensures user is allowed to edit the specific editId they are requesting
export async function requireEditAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const editId = req.params.editId;
    if (!payload?.groupId || !payload?.editId || payload.editId !== editId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const group = await Group.findOne({ _id: payload.groupId, editId }).lean();
    if (!group) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.auth = { token, payload, group };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function extractToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    return auth.slice("Bearer ".length).trim();
  }
  const headerToken = req.headers["x-edit-token"];
  return typeof headerToken === "string" ? headerToken : "";
}
