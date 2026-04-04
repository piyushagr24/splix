export function buildUpiLink({ upiId, name, amountMinor }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: (amountMinor / 100).toFixed(2),
    cu: "INR"
  });
  return `upi://pay?${params.toString()}`;
}

export function buildQrUrl(upiLink) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;
}
