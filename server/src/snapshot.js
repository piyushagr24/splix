import { Expense } from "./models/Expense.js";
import { Group } from "./models/Group.js";
import { Participant } from "./models/Participant.js";
// import { sortParticipantsByName } from "./participants.js";
import { deriveBalances, simplifyDebts } from "./settlement.js";

//raw data to json
function mapGroup(group) {
  return {
    id: String(group._id),
    name: group.name,
    currency: group.currency,
    editId: group.editId,
    viewId: group.viewId,
    createdAt: group.createdAt
  };
}

function mapParticipant(participant) {
  return {
    id: String(participant._id),
    groupId: String(participant.groupId),
    name: participant.name,
    upiId: participant.upiId || null,
    createdAt: participant.createdAt
  };
}

function mapExpense(expense) {
  return {
    id: String(expense._id),
    groupId: String(expense.groupId),
    title: expense.title,
    amountMinor: expense.amountMinor,
    paidByParticipantId: String(expense.paidByParticipantId),
    splitJson: expense.splitJson,
    createdAt: expense.createdAt
  };
}

function sortParticipantsByName(participants) {
  return participants
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));
}

export async function getGroupByEditId(editId) {
  return Group.findOne({ editId }).lean();
}

export async function getGroupByViewId(viewId) {
  return Group.findOne({ viewId }).lean();
}

export async function getSnapshotByGroup(group) {
  const [participantsRaw, expensesRaw] = await Promise.all([
    Participant.find({ groupId: group._id }).sort({ name: 1 }).lean(),
    Expense.find({ groupId: group._id }).sort({ createdAt: -1 }).lean()
  ]);
  const participants = sortParticipantsByName(participantsRaw.map(mapParticipant));
  const expenses = expensesRaw.map(mapExpense);
  const balances = deriveBalances(participants, expenses);
  const states = group.settlementStates || []; // any saved mark as settled state

  const settlements = simplifyDebts(balances).map((row) => {
    const settledRow = states.find(
      (state) =>
        state.fromParticipantId === row.fromParticipantId &&
        state.toParticipantId === row.toParticipantId &&
        state.amountMinor === row.amountMinor &&
        state.settled
    );
    return {
      ...row,
      settled: Boolean(settledRow)
    };
  });
  return {
    group: mapGroup(group),
    participants,
    expenses,
    balances,
    settlements
  };
}
