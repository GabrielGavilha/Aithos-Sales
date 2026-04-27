import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { CaptureForm } from "@/types";

export const PublicFormPreview = ({ form }: { form: CaptureForm }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">PublicFormPreview</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-white p-4">
        <h3 className="text-lg font-semibold text-slate-900">{form.title}</h3>
        {form.description ? <p className="mt-1 text-sm text-slate-500">{form.description}</p> : null}

        <div className="mt-4 grid gap-3">
          {form.fields
            .filter((field) => field.enabled)
            .map((field) => (
              <label key={field.id} className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {field.label} {field.required ? "*" : ""}
                </span>
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-slate-400">
                  {field.placeholder ?? `Campo ${field.label}`}
                </div>
              </label>
            ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">{form.consentText}</p>
        <button className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">
          Enviar
        </button>
      </div>
    </CardContent>
  </Card>
);
