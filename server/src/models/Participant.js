import mongoose from "mongoose";
const participantSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    name: { type: String, required: true, trim: true },
    upiId: { type: String, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);
participantSchema.index({ groupId: 1, name: 1 });
export const Participant = mongoose.model("Participant", participantSchema);