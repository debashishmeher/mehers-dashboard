import {
  ClipboardCopy,
  FileStack,
  LayoutTemplate,
  MessageSquareQuote,
  Save,
  Sparkles,
} from "lucide-react";

function SummaryTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-[0_16px_50px_-28px_rgba(15,23,42,0.9)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 text-slate-50">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-300">{hint}</p>
    </div>
  );
}

export default function TemplateBuilderHeader({
  templateName,
  categoryLabel,
  activeSections,
  variableCount,
  templateCount,
  onSaveDraft,
  onCopyPayload,
  statusMessage,
}) {
  const messageTone =
    statusMessage?.tone === "success"
      ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-50"
      : "border-rose-300/40 bg-rose-400/10 text-rose-50";

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/40 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_120px_-40px_rgba(15,23,42,0.8)] sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgba(37,99,235,0.32),_transparent_24%),radial-gradient(circle_at_88%_0%,_rgba(16,185,129,0.24),_transparent_25%),radial-gradient(circle_at_70%_75%,_rgba(251,191,36,0.12),_transparent_18%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
            <Sparkles className="h-3.5 w-3.5" />
            Meta-style template builder
          </div>

          <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Build WhatsApp templates with the same creation flow teams expect from Meta Business Manager.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Configure the template basics, compose each section, preview the final message, and keep a local draft library ready for backend submission.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              <Save className="h-4 w-4" />
              Save draft
            </button>

            <button
              type="button"
              onClick={onCopyPayload}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <ClipboardCopy className="h-4 w-4" />
              Copy payload
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <span className="font-semibold text-white">Template:</span> {templateName || "untitled_template"}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <span className="font-semibold text-white">Category:</span> {categoryLabel}
            </div>
          </div>

          {statusMessage && (
            <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${messageTone}`}>
              {statusMessage.text}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SummaryTile
            icon={LayoutTemplate}
            label="Sections"
            value={`${activeSections + 1}`}
            hint="Body is always present, and header/footer/buttons are optional."
          />
          <SummaryTile
            icon={MessageSquareQuote}
            label="Variables"
            value={variableCount}
            hint="Detected placeholders are ready for sample values and preview rendering."
          />
          <SummaryTile
            icon={FileStack}
            label="Library"
            value={templateCount}
            hint="Total synced templates plus drafts visible in the library panel."
          />
        </div>
      </div>
    </section>
  );
}
