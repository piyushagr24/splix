import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    fromParticipantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true
    },
    toParticipantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true
    },
    amountMinor: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    note: { type: String, default: "", trim: true, maxlength: 100 }
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

settlementSchema.index({ groupId: 1, date: -1, createdAt: -1 });

export const Settlement = mongoose.model("Settlement", settlementSchema);
