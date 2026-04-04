import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { assertEnv, env } from "./env.js";
import { Expense } from "./models/Expense.js";
import { Group } from "./models/Group.js";
import { Participant } from "./models/Participant.js";

const isDryRun = process.argv.includes("--dry-run");

function buildCutoff(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  assertEnv();
  await connectDb(env.mongodbUri);

  try {
    const inactiveDays = Number.isFinite(env.cleanupInactiveDays) && env.cleanupInactiveDays > 0
      ? env.cleanupInactiveDays
      : 45;
    const cutoff = buildCutoff(inactiveDays);
    const staleGroups = await Group.find({
      $or: [
        { lastActivityAt: { $lt: cutoff } },
        { lastActivityAt: { $exists: false }, createdAt: { $lt: cutoff } }
      ]
    })
      .select("_id name editId viewId createdAt lastActivityAt")
      .lean();

    if (!staleGroups.length) {
      console.log(`No groups inactive for ${inactiveDays}+ days.`);
      return;
    }

    const groupIds = staleGroups.map((group) => group._id);

    if (isDryRun) {
      console.log(`Dry run: ${staleGroups.length} groups would be deleted (threshold: ${inactiveDays} days).`);
      staleGroups.forEach((group) => {
        console.log(
          `- ${group.name} | edit:${group.editId} | lastActivity:${group.lastActivityAt || group.createdAt}`
        );
      });
      return;
    }

    const [expenseResult, participantResult, groupResult] = await Promise.all([
      Expense.deleteMany({ groupId: { $in: groupIds } }),
      Participant.deleteMany({ groupId: { $in: groupIds } }),
      Group.deleteMany({ _id: { $in: groupIds } })
    ]);

    console.log(`Deleted ${groupResult.deletedCount} inactive groups.`);
    console.log(`Deleted ${participantResult.deletedCount} participants.`);
    console.log(`Deleted ${expenseResult.deletedCount} expenses.`);
    console.log(`Threshold used: ${inactiveDays} days.`);
  } finally {
    await mongoose.disconnect();
  }
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  });
