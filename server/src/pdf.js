import { PDFDocument, PDFName, PDFArray, PDFNumber, PDFString, StandardFonts, rgb } from "pdf-lib";
import { formatMoney } from "./settlement.js";

const SPLIX_URL = "https://splix-app.vercel.app";

function safeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "");
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
}

function addLinkAnnotation(pdf, page, { x, y, width, height, url }) {
  const context = pdf.context;
  const link = context.obj({
    Type: PDFName.of("Annot"),
    Subtype: PDFName.of("Link"),
    Rect: context.obj([x, y, x + width, y + height]),
    Border: context.obj([0, 0, 0]),
    A: context.obj({
      Type: PDFName.of("Action"),
      S: PDFName.of("URI"),
      URI: PDFString.of(url)
    })
  });

  const linkRef = context.register(link);
  const annots = page.node.lookup(PDFName.of("Annots"), PDFArray) || context.obj([]);
  annots.push(linkRef);
  page.node.set(PDFName.of("Annots"), annots);
}

export async function buildReceiptPdf(snapshot) {
  const pdf = await PDFDocument.create();
  const width = 302;
  const height = 1100;
  const marginX = 18;
  let page = pdf.addPage([width, height]);
  const font = await pdf.embedFont(StandardFonts.Courier);
  const bold = await pdf.embedFont(StandardFonts.CourierBold);

  const participantById = new Map(snapshot.participants.map((participant) => [participant.id, participant]));
  const gross = snapshot.expenses.reduce((sum, expense) => sum + expense.amountMinor, 0);
  const orderedExpenses = snapshot.expenses
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let y = height - 24;
  const lineGap = 12;
  const text = rgb(0.11, 0.12, 0.14);
  const muted = rgb(0.36, 0.38, 0.43);
  const accent = rgb(0.12, 0.45, 0.18);

  function ensureSpace(linesNeeded = 1) {
    if (y - linesNeeded * lineGap > 26) return;
    page = pdf.addPage([width, height]);
    y = height - 24;
  }

  function line(value, isBold = false, size = 9, color = text) {
    ensureSpace(1);
    page.drawText(safeText(value), {
      x: marginX,
      y,
      size,
      font: isBold ? bold : font,
      color
    });
    y -= lineGap;
  }

  function center(value, isBold = false, size = 10, color = text, url = "") {
    ensureSpace(1);
    const clean = safeText(value);
    const activeFont = isBold ? bold : font;
    const widthAtSize = activeFont.widthOfTextAtSize(clean, size);
    const x = (width - widthAtSize) / 2;

    page.drawText(clean, {
      x,
      y,
      size,
      font: activeFont,
      color
    });

    if (url) {
      addLinkAnnotation(pdf, page, {
        x,
        y: y - 2,
        width: widthAtSize,
        height: size + 4,
        url
      });
    }

    y -= lineGap;
  }

  function divider(char = "-") {
    line(char.repeat(42), false, 8, muted);
  }

  center("SPLIX", true, 15, accent, SPLIX_URL);
  center("EXPENSE SETTLEMENT RECEIPT", true, 9);
  center("Share PDF summary", false, 8, muted);
  divider("=");
  line(`Group : ${snapshot.group.name}`, true);
  line(`Bill# : ${snapshot.group.viewId.slice(0, 8).toUpperCase()}`);
  line(`Date  : ${formatDateTime(new Date().toISOString())}`);
  line(`Curr  : ${snapshot.group.currency}`);
  divider();

  line("ITEMIZED EXPENSES", true);
  divider();
  orderedExpenses.forEach((expense, idx) => {
    const payer = participantById.get(expense.paidByParticipantId)?.name || "Unknown";
    line(`${idx + 1}. ${expense.title}`, true);
    line(`   Amt : ${formatMoney(expense.amountMinor, snapshot.group.currency)}`);
    line(`   By  : ${payer}`);
    line(`   At  : ${formatDateTime(expense.createdAt)}`, false, 8, muted);
    Object.entries(expense.splitJson || {})
      .sort((a, b) => {
        const aName = participantById.get(a[0])?.name || "";
        const bName = participantById.get(b[0])?.name || "";
        return aName.localeCompare(bName, undefined, { sensitivity: "base", numeric: true });
      })
      .forEach(([participantId, share]) => {
        const name = participantById.get(participantId)?.name || "Unknown";
        line(`   -> ${name}: ${formatMoney(Number(share), snapshot.group.currency)}`, false, 8, muted);
      });
    divider();
  });
  line(`Total Items : ${snapshot.expenses.length}`, true);
  line(`Gross Total : ${formatMoney(gross, snapshot.group.currency)}`, true);
  divider("=");

  line("FINAL SETTLEMENTS", true);
  divider();
  if (!snapshot.settlements.length) {
    line("All balances are settled.");
  } else {
    snapshot.settlements
      .slice()
      .sort((a, b) => {
        const from = a.fromName.localeCompare(b.fromName, undefined, { sensitivity: "base", numeric: true });
        if (from !== 0) return from;
        return a.toName.localeCompare(b.toName, undefined, { sensitivity: "base", numeric: true });
      })
      .forEach((row, idx) => {
        line(
          `${idx + 1}) ${row.fromName} -> ${row.toName} : ${formatMoney(row.amountMinor, snapshot.group.currency)}`
        );
      });
  }

  divider("=");
  center("Thank you for using Splix", true, 9, accent);
  center("https://splix-app.vercel.app", false, 7, accent, SPLIX_URL);
  center("System-generated receipt", false, 8, muted);

  return pdf.save();
}
