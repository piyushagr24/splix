function toRoundedInt(value) {
  return Math.round(Number(value || 0));
}

export function buildSplitJson({ amountMinor, split, participantsById }) {
  const participantIds = split.entries.map((entry) => String(entry.participantId));
  for (const participantId of participantIds) {
    if (!participantsById.has(participantId)) {
      throw new Error("Split contains unknown participant");
    }
  }
  if (!participantIds.length) {
    throw new Error("Split entries are required");
  }

  if (split.mode === "even") {
    const base = Math.floor(amountMinor / participantIds.length);
    let remainder = amountMinor - base * participantIds.length;
    const sorted = participantIds.slice().sort();
    const result = {};
    for (const participantId of sorted) {
      const extra = remainder > 0 ? 1 : 0;
      result[participantId] = base + extra;
      if (remainder > 0) remainder -= 1;
    }
    return result;
  }

  if (split.mode === "amount") {
    const result = {};
    let total = 0;
    for (const entry of split.entries) {
      const value = toRoundedInt(entry.amountMinor);
      if (value < 0) throw new Error("Split amount cannot be negative");
      result[String(entry.participantId)] = value;
      total += value;
    }
    if (total !== amountMinor) {
      throw new Error("Split amount total must equal expense amount");
    }
    return result;
  }

  if (split.mode === "percentage") {
    const result = {};
    const sumPercent = split.entries.reduce((acc, item) => acc + Number(item.percent || 0), 0);
    if (Math.abs(sumPercent - 100) > 0.001) {
      throw new Error("Split percentages must total 100");
    }

    const rounded = split.entries.map((entry) => ({
      participantId: String(entry.participantId),
      raw: (amountMinor * Number(entry.percent || 0)) / 100,
      floor: Math.floor((amountMinor * Number(entry.percent || 0)) / 100)
    }));
    let used = rounded.reduce((acc, item) => acc + item.floor, 0);
    let remainder = amountMinor - used;
    rounded.sort((a, b) => (b.raw - b.floor) - (a.raw - a.floor));
    for (const item of rounded) {
      const extra = remainder > 0 ? 1 : 0;
      result[item.participantId] = item.floor + extra;
      if (remainder > 0) remainder -= 1;
    }
    used = Object.values(result).reduce((acc, n) => acc + n, 0);
    if (used !== amountMinor) {
      throw new Error("Split percentage conversion failed");
    }
    return result;
  }

  throw new Error("Unsupported split mode");
}