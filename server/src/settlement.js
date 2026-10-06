export function deriveBalances(participants, expenses, settlements = []) {
  const rows = new Map(
    participants.map((participant) => [
      String(participant.id || participant._id),
      {
        participantId: String(participant.id || participant._id),
        participantName: participant.name,
        netMinor: 0
      }
    ])
  );

  for (const expense of expenses) {
    // Credit the payer
    const payer = rows.get(String(expense.paidByParticipantId));
    if (!payer) continue;
    payer.netMinor += expense.amountMinor;
    // Debit each participant
    for (const [participantId, share] of Object.entries(expense.splitJson || {})) {
      const row = rows.get(String(participantId));
      if (!row) continue;
      row.netMinor -= Number(share || 0);
    }
  }

  // Offset balances with formal settlement reimbursements
  for (const settlement of settlements) {
    const payer = rows.get(String(settlement.fromParticipantId));
    const payee = rows.get(String(settlement.toParticipantId));
    if (payer) payer.netMinor += Number(settlement.amountMinor || 0);
    if (payee) payee.netMinor -= Number(settlement.amountMinor || 0);
  }

  return Array.from(rows.values());
}

export function simplifyDebts(balances) {
  // Separate debtors and creditors , and sort them decreasingly
  const debtors = balances
    .filter((item) => item.netMinor < 0)
    .map((item) => ({ ...item, remaining: Math.abs(item.netMinor) }))
    .sort((a, b) => b.remaining - a.remaining);
  const creditors = balances
    .filter((item) => item.netMinor > 0)
    .map((item) => ({ ...item, remaining: item.netMinor }))
    .sort((a, b) => b.remaining - a.remaining);

  const settlements = [];
  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    // Match the current largest debtor with the current largest creditor
    const amountMinor = Math.min(debtor.remaining, creditor.remaining);
    if (amountMinor > 0) {
      settlements.push({
        fromParticipantId: debtor.participantId,
        fromName: debtor.participantName,
        toParticipantId: creditor.participantId,
        toName: creditor.participantName,
        amountMinor
      });
    }
    debtor.remaining -= amountMinor;
    creditor.remaining -= amountMinor;
    if (debtor.remaining === 0) d += 1;
    if (creditor.remaining === 0) c += 1;
  }

  return settlements;
}

export function formatMoney(amountMinor, currency) {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}