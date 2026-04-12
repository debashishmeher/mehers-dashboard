import { Clock3, FileStack, RefreshCw } from "lucide-react";
import {
  getTemplateBodyPreview,
  getTemplateStatusTone,
} from "./templateBuilderData";

function formatTimestamp(value) {
  if (!value) return "Just now";

  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TemplateLibraryPanel({
  templates,
  drafts,
  loading,
  error,
}) {
  const items = [
    ...drafts,
    ...templates.map((template) => ({
      ...template,
      source: "Synced",
    })),
  ];

  return (
    <section className="rounded-[30px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.3)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <FileStack className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Template Library
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Existing templates and drafts
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Use this panel as a quick reference while you shape the next template.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
          <RefreshCw className="h-4 w-4" />
          {loading ? "Syncing library" : `${items.length} templates visible`}
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Loading synced templates...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            No templates available yet. Save a draft to start a local library.
          </div>
        ) : (
          items.map((template) => (
            <div
              key={template.id || `${template.name}-${template.status}`}
              className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {template.name || "untitled_template"}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getTemplateStatusTone(template.status)}`}
                    >
                      {template.status || "PENDING"}
                    </span>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                      {template.source}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {(template.categoryLabel || template.category || "Uncategorized").toString()}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  {formatTimestamp(template.updatedAt || template.createdAt)}
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {getTemplateBodyPreview(template)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
