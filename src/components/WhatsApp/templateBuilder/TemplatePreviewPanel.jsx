import {
  Code2,
  FileImage,
  FileText,
  LayoutPanelTop,
  Phone,
} from "lucide-react";
import {
  applyVariableSamples,
  buildTemplatePayload,
} from "./templateBuilderData";

function MetaBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  );
}

function PreviewButton({ button, sampleValues }) {
  const label = applyVariableSamples(button.text, sampleValues);

  return (
    <button
      type="button"
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-sky-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
    >
      {label}
    </button>
  );
}

export default function TemplatePreviewPanel({ template, variableKeys }) {
  const payload = buildTemplatePayload(template);
  const previewHeader = template.includeHeader
    ? template.headerType === "TEXT"
      ? applyVariableSamples(template.headerText, template.sampleValues)
      : `${template.headerType.toLowerCase()} placeholder`
    : "";
  const previewBody = applyVariableSamples(template.body, template.sampleValues);
  const previewFooter = applyVariableSamples(template.footer, template.sampleValues);

  return (
    <section className="rounded-[30px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.3)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Live Preview
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Customer message and payload
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-4 shadow-[0_22px_70px_-34px_rgba(15,23,42,0.7)]">
          <div className="mx-auto max-w-[360px] rounded-[28px] bg-[#e8f3ee] p-4">
            <div className="flex items-center justify-between rounded-full bg-slate-900 px-4 py-3 text-xs text-slate-200">
              <span>WhatsApp preview</span>
              <span>11:24</span>
            </div>

            <div className="mt-4 rounded-[24px] bg-white px-4 py-4 shadow-sm">
              {template.includeHeader && (
                template.headerType === "TEXT" ? (
                  <p className="text-sm font-semibold text-slate-900">
                    {previewHeader}
                  </p>
                ) : (
                  <div className="mb-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                      {template.headerType === "IMAGE" ? (
                        <FileImage className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    {previewHeader}
                  </div>
                )
              )}

              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                {previewBody}
              </p>

              {previewFooter && (
                <p className="mt-4 text-xs text-slate-400">{previewFooter}</p>
              )}

              {template.buttons.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {template.buttons.map((button) => (
                    <PreviewButton
                      key={button.id}
                      button={button}
                      sampleValues={template.sampleValues}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetaBadge>
            <LayoutPanelTop className="mr-2 h-3.5 w-3.5" />
            {template.includeHeader ? template.headerType : "No header"}
          </MetaBadge>
          <MetaBadge>
            <Code2 className="mr-2 h-3.5 w-3.5" />
            {variableKeys.length} variable {variableKeys.length === 1 ? "slot" : "slots"}
          </MetaBadge>
          <MetaBadge>
            <Phone className="mr-2 h-3.5 w-3.5" />
            {template.buttons.length} button {template.buttons.length === 1 ? "action" : "actions"}
          </MetaBadge>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Generated Payload
          </p>
          <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}
