import mongoose from "mongoose";
import { connectDb, disconnectDb } from "./db.js";
import { assertEnv, env } from "./env.js";
import { Expense } from "./models/Expense.js";
import { Group } from "./models/Group.js";
import { Participant } from "./models/Participant.js";
import { Settlement } from "./models/Settlement.js";

function buildCutoff(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function runGroupCleanup({ isDryRun = false, days = null } = {}) {
  const inactiveDays = Number.isFinite(days) && days > 0
    ? days
    : (Number.isFinite(env.cleanupInactiveDays) && env.cleanupInactiveDays > 0 ? env.cleanupInactiveDays : 45);
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
    return {
      message: `No groups inactive for ${inactiveDays}+ days.`,
      thresholdDays: inactiveDays,
      deletedGroups: 0
    };
  }

  const groupIds = staleGroups.map((group) => group._id);

  if (isDryRun) {
    return {
      dryRun: true,
      thresholdDays: inactiveDays,
      staleGroupsCount: staleGroups.length,
      groups: staleGroups.map((g) => ({
        name: g.name,
        editId: g.editId,
        lastActivity: g.lastActivityAt || g.createdAt
      }))
    };
  }

  const [expenseResult, participantResult, settlementResult, groupResult] = await Promise.all([
    Expense.deleteMany({ groupId: { $in: groupIds } }),
    Participant.deleteMany({ groupId: { $in: groupIds } }),
    Settlement.deleteMany({ groupId: { $in: groupIds } }),
    Group.deleteMany({ _id: { $in: groupIds } })
  ]);

  return {
    deletedGroups: groupResult.deletedCount,
    deletedParticipants: participantResult.deletedCount,
    deletedExpenses: expenseResult.deletedCount,
    deletedSettlements: settlementResult.deletedCount,
    thresholdDays: inactiveDays
  };
}

// Allow CLI execution
if (process.argv[1] && process.argv[1].includes("cleanupInactiveGroups")) {
  const isDryRun = process.argv.includes("--dry-run");
  assertEnv();

  connectDb(env.mongodbUri)
    .then(() => runGroupCleanup({ isDryRun }))
    .then((result) => {
      console.log("Cleanup result:", JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("Cleanup failed:", error);
      process.exitCode = 1;
    })
    .finally(() => disconnectDb());
}

