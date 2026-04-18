"use client";

import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Switch, Textarea } from "@/components/ui";
import type { CaptureForm, CaptureFormField } from "@/types";

type FormBuilderProps = {
  form: CaptureForm;
  onChange: (form: CaptureForm) => void;
};

const moveField = (fields: CaptureFormField[], index: number, direction: "up" | "down") => {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= fields.length) return fields;
  const next = [...fields];
  const [current] = next.splice(index, 1);
  next.splice(target, 0, current);
  return next;
};

export const FormBuilder = ({ form, onChange }: FormBuilderProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">FormBuilder</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Titulo</Label>
          <Input value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>URL publica</Label>
          <Input value={form.publicUrl} disabled />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descricao</Label>
        <Textarea value={form.description ?? ""} onChange={(event) => onChange({ ...form, description: event.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Campos</Label>
        <div className="space-y-2">
          {form.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-blue-100 bg-blue-50/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-900">{field.label}</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{field.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => onChange({ ...form, fields: moveField(form.fields, index, "up") })}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => onChange({ ...form, fields: moveField(form.fields, index, "down") })}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <Switch
                    checked={field.enabled}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...form,
                        fields: form.fields.map((item) => (item.id === field.id ? { ...item, enabled: Boolean(checked) } : item))
                      })
                    }
                  />
                  Ativo
                </label>
                <label className="inline-flex items-center gap-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...form,
                        fields: form.fields.map((item) => (item.id === field.id ? { ...item, required: Boolean(checked) } : item))
                      })
                    }
                  />
                  Obrigatorio
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
