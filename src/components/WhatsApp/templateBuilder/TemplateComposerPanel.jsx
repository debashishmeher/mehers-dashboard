import {
  MessageSquareDashed,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { buttonTypes, headerTypes } from "./templateBuilderData";

function CardShell({ title, subtitle, action, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 4, hint }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        <span className="text-xs uppercase tracking-[0.14em] text-slate-400">
          {value.length} chars
        </span>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
      />
      {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
    </label>
  );
}

export default function TemplateComposerPanel({
  template,
  variableKeys,
  onFieldChange,
  onToggleSection,
  onButtonChange,
  onAddButton,
  onRemoveButton,
  onSampleChange,
}) {
  return (
    <section className="rounded-[30px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.3)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
          <MessageSquareDashed className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Message Composer
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Header, body, footer, and actions
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <CardShell
          title="Header"
          subtitle="Optional top section for a quick title or media placeholder."
          action={
            <button
              type="button"
              onClick={() => onToggleSection("includeHeader")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                template.includeHeader
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {template.includeHeader ? "Header enabled" : "Enable header"}
            </button>
          }
        >
          {template.includeHeader ? (
            <div className="grid gap-5 md:grid-cols-[0.45fr_0.55fr]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  Header type
                </span>
                <select
                  value={template.headerType}
                  onChange={(event) => onFieldChange("headerType", event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                >
                  {headerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              {template.headerType === "TEXT" ? (
                <TextAreaField
                  label="Header text"
                  value={template.headerText}
                  onChange={(event) => onFieldChange("headerText", event.target.value)}
                  rows={3}
                  placeholder="Your order ships today"
                  hint="Keep it short. Text headers are usually one concise line."
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500">
                  The preview will render a media placeholder for {template.headerType.toLowerCase()} headers.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Enable the header when your template needs a short intro line or a media hero.
            </div>
          )}
        </CardShell>

        <CardShell
          title="Body"
          subtitle="The main content of your WhatsApp template. Variables like {{1}} are supported."
        >
          <TextAreaField
            label="Body message"
            value={template.body}
            onChange={(event) => onFieldChange("body", event.target.value)}
            rows={7}
            placeholder="Hi {{1}}, your order is on the way and should arrive by {{2}}."
            hint="Explain the exact message users will receive. This section is required."
          />
        </CardShell>

        <CardShell
          title="Footer"
          subtitle="Optional closing line for disclaimer text or a small reminder."
          action={
            <button
              type="button"
              onClick={() => onToggleSection("footer")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                template.footer
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {template.footer ? "Footer enabled" : "Enable footer"}
            </button>
          }
        >
          {template.footer ? (
            <TextAreaField
              label="Footer text"
              value={template.footer}
              onChange={(event) => onFieldChange("footer", event.target.value)}
              rows={2}
              placeholder="Reply STOP to opt out."
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Add a footer when you need a short disclaimer, support note, or opt-out instruction.
            </div>
          )}
        </CardShell>

        <CardShell
          title="Buttons"
          subtitle="Add up to three quick replies or call-to-action buttons."
          action={
            <button
              type="button"
              onClick={onAddButton}
              disabled={template.buttons.length >= 3}
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <Plus className="h-4 w-4" />
              Add button
            </button>
          }
        >
          {template.buttons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Add buttons to help users reply, call, or open a landing page.
            </div>
          ) : (
            <div className="space-y-4">
              {template.buttons.map((button, index) => (
                <div
                  key={button.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">
                      Button {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemoveButton(index)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        Button type
                      </span>
                      <select
                        value={button.type}
                        onChange={(event) =>
                          onButtonChange(index, "type", event.target.value)
                        }
                        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      >
                        {buttonTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        Button label
                      </span>
                      <input
                        type="text"
                        value={button.text}
                        onChange={(event) =>
                          onButtonChange(index, "text", event.target.value)
                        }
                        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="Track package"
                      />
                    </label>
                  </div>

                  {button.type === "URL" && (
                    <label className="mt-4 block">
                      <span className="text-sm font-semibold text-slate-800">
                        Destination URL
                      </span>
                      <input
                        type="text"
                        value={button.url}
                        onChange={(event) =>
                          onButtonChange(index, "url", event.target.value)
                        }
                        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="https://example.com/track/{{1}}"
                      />
                    </label>
                  )}

                  {button.type === "PHONE_NUMBER" && (
                    <label className="mt-4 block">
                      <span className="text-sm font-semibold text-slate-800">
                        Phone number
                      </span>
                      <input
                        type="text"
                        value={button.phoneNumber}
                        onChange={(event) =>
                          onButtonChange(index, "phoneNumber", event.target.value)
                        }
                        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        placeholder="+1 415 555 0199"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardShell>

        <CardShell
          title="Sample values"
          subtitle="Variables are easier to validate when the preview uses real examples."
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
              <Sparkles className="h-4 w-4" />
              {variableKeys.length} detected
            </div>
          }
        >
          {variableKeys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Add placeholders like {`{{1}}`} and {`{{2}}`} to unlock sample inputs.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {variableKeys.map((key) => (
                <label key={key} className="block">
                  <span className="text-sm font-semibold text-slate-800">
                    Sample for {`{{${key}}}`}
                  </span>
                  <input
                    type="text"
                    value={template.sampleValues[key] || ""}
                    onChange={(event) => onSampleChange(key, event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    placeholder={`Example value ${key}`}
                  />
                </label>
              ))}
            </div>
          )}
        </CardShell>
      </div>
    </section>
  );
}
