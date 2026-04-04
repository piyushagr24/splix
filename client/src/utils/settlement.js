export function deriveBalances(participants, expenses) {
  const rows = new Map(
    participants.map((participant) => [
      participant.id,
      {
        participantId: participant.id,
        participantName: participant.name,
        netMinor: 0
      }
    ])
  );

  for (const expense of expenses) {
    const payer = rows.get(expense.paidByParticipantId);
    if (!payer) continue;
    payer.netMinor += expense.amountMinor;

    for (const [participantId, shareMinor] of Object.entries(expense.splitJson || {})) {
      const row = rows.get(participantId);
      if (!row) continue;
      row.netMinor -= Number(shareMinor || 0);
    }
  }

  return Array.from(rows.values());
}

export function simplifyDebts(balances) {
  const debtors = balances
    .filter((item) => item.netMinor < 0)
    .map((item) => ({ ...item, remaining: Math.abs(item.netMinor) }))
    .sort((a, b) => b.remaining - a.remaining);
  const creditors = balances
    .filter((item) => item.netMinor > 0)
    .map((item) => ({ ...item, remaining: item.netMinor }))
    .sort((a, b) => b.remaining - a.remaining);

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
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

    if (debtor.remaining === 0) debtorIndex += 1;
    if (creditor.remaining === 0) creditorIndex += 1;
  }

  return settlements;
}
