import { CheckCircle2, Globe2, ShieldCheck, Tag } from "lucide-react";
import {
  reviewChecklist,
  templateCategories,
  templateLanguages,
} from "./templateBuilderData";

function FieldShell({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-1 block text-sm text-slate-500">{hint}</span>
      <div className="mt-3">{children}</div>
    </label>
  );
}

export default function TemplateConfigurationPanel({ template, onFieldChange }) {
  return (
    <section className="rounded-[30px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.3)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Template Setup
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Basics and review rules
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Start with the template identity, choose the message category, and keep the copy aligned with review expectations.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Review-ready structure
          </div>
          <p className="mt-1 text-emerald-700">
            Naming, examples, and clear intent improve approval speed.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-5">
          <FieldShell
            label="Template name"
            hint="Use only lowercase letters, numbers, and underscores."
          >
            <input
              type="text"
              value={template.name}
              onChange={(event) =>
                onFieldChange(
                  "name",
                  event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_")
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              placeholder="order_update_alert"
            />
          </FieldShell>

          <div className="grid gap-5 md:grid-cols-2">
            <FieldShell
              label="Category"
              hint="Meta uses category context during approval."
            >
              <select
                value={template.category}
                onChange={(event) => onFieldChange("category", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              >
                {templateCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell
              label="Language"
              hint="Choose the exact locale you plan to submit."
            >
              <div className="relative">
                <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={template.language}
                  onChange={(event) => onFieldChange("language", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                >
                  {templateLanguages.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </div>
            </FieldShell>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              checked={template.allowCategoryChange}
              onChange={(event) =>
                onFieldChange("allowCategoryChange", event.target.checked)
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Allow category auto-update
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Useful when you want Meta to revise the category during review instead of rejecting the submission outright.
              </p>
            </div>
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            {templateCategories.map((category) => {
              const isActive = category.value === template.category;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => onFieldChange("category", category.value)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-sky-200 bg-sky-50 shadow-[0_10px_30px_-20px_rgba(14,165,233,0.65)]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{category.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50/90 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Approval Checklist
          </p>
          <div className="mt-5 space-y-4">
            {reviewChecklist.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <div className="rounded-full bg-emerald-100 p-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
