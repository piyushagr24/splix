import { Download, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { pdfDownloadUrl } from "../api";
import { money } from "../utils/format";

export function ShareCard({
  editId,
  viewId,
  groupName,
  settlements = [],
  currency,
  hideEditLink = false
}) {
  async function copy(text, label) {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  }

  function whatsappLink() {
    const lines = [groupName || "Splix group", ""];

    if (settlements.length) {
      lines.push("Final settlement:");
      settlements.forEach((item) => {
        lines.push(`${item.fromName} -> ${item.toName} : ${money(item.amountMinor, currency)}`);
      });
    } else {
      lines.push("Final settlement:");
      lines.push("All settled. No payments required.");
    }

    lines.push("");
    lines.push(`View link: ${window.location.origin}/view/${viewId}`);
    // if (!hideEditLink && editId) {
      lines.push(`Edit link: ${window.location.origin}/edit/${editId}`);
    // }
    lines.push("");
    lines.push("Thanks for using Splix.");
    const text = lines.join("\n");
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  return (
    <section className="card reveal reveal-3">
      <h2 className="text-base font-semibold text-zinc-900 sm:text-xl">Share</h2>
      <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
        <a className="btn-ghost rounded-md px-2.5 py-1.5 text-xs sm:px-2 sm:py-1 sm:text-sm" href={whatsappLink()} target="_blank" rel="noreferrer">
          <MessageCircle size={15} />
          WhatsApp Summary
        </a>
        {!hideEditLink && editId ? (
          <button
            className="btn-ghost rounded-md px-2.5 py-1.5 text-xs sm:px-2 sm:py-1 sm:text-sm"
            onClick={() => copy(`${window.location.origin}/edit/${editId}`, "Edit link copied")}
            type="button"
          >
            <Link2 size={15} />
            Copy Edit Link
          </button>
        ) : null}
        <button
          className="btn-ghost rounded-md px-2.5 py-1.5 text-xs sm:px-2 sm:py-1 sm:text-sm"
          onClick={() => copy(`${window.location.origin}/view/${viewId}`, "View link copied")}
          type="button"
        >
          <Link2 size={15} />
          Copy View Link
        </button>
        <a className="btn-ghost rounded-md px-2.5 py-1.5 text-xs sm:px-2 sm:py-1 sm:text-sm" href={pdfDownloadUrl(viewId)} target="_blank" rel="noreferrer">
          <Download size={15} />
          Download PDF
        </a>
      </div>
    </section>
  );
}
