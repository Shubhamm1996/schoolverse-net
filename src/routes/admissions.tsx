import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadToBucket } from "@/lib/storage";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Online Admission Form — St. Aldrin Public School" },
      {
        name: "description",
        content:
          "Apply online for admission to St. Aldrin Public School: student details, parent details, academic history and document upload.",
      },
      { property: "og:title", content: "Admissions — Apply Online" },
      { property: "og:description", content: "Submit the online admission application in minutes." },
    ],
  }),
  component: Admissions,
});

const CLASSES = [
  "Nursery", "LKG", "UKG", "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII", "Class IX", "Class XI",
];

const schema = z.object({
  student_name: z.string().trim().min(2, "Enter the student's full name").max(120),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Select a gender"),
  applying_for_class: z.string().min(1, "Select a class"),
  student_address: z.string().trim().max(400).optional().or(z.literal("")),
  father_name: z.string().trim().min(2, "Father's / guardian's name is required").max(120),
  mother_name: z.string().trim().max(120).optional().or(z.literal("")),
  guardian_phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  guardian_email: z.string().trim().email("Enter a valid email").max(255),
  guardian_occupation: z.string().trim().max(120).optional().or(z.literal("")),
  previous_school: z.string().trim().max(160).optional().or(z.literal("")),
  previous_class: z.string().trim().max(60).optional().or(z.literal("")),
  previous_percentage: z.string().trim().max(20).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function Admissions() {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      student_name: "", date_of_birth: "", gender: "", applying_for_class: "",
      student_address: "", father_name: "", mother_name: "", guardian_phone: "",
      guardian_email: "", guardian_occupation: "", previous_school: "",
      previous_class: "", previous_percentage: "",
    },
  });

  const err = form.formState.errors;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const documents: { name: string; path: string }[] = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is larger than 10 MB`);
        const path = await uploadToBucket("admission-docs", file, "applications/");
        documents.push({ name: file.name, path });
      }
      const payload = {
        student_name: values.student_name,
        date_of_birth: values.date_of_birth,
        gender: values.gender,
        applying_for_class: values.applying_for_class,
        student_address: values.student_address || null,
        father_name: values.father_name,
        mother_name: values.mother_name || null,
        guardian_phone: values.guardian_phone,
        guardian_email: values.guardian_email,
        guardian_occupation: values.guardian_occupation || null,
        previous_school: values.previous_school || null,
        previous_class: values.previous_class || null,
        previous_percentage: values.previous_percentage || null,
        documents,
      };
      const { error } = await supabase.from("admissions").insert(payload);
      if (error) throw error;
      setDone(true);
      form.reset();
      setFiles([]);
      toast.success("Application submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit the application");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <PublicLayout>
        <PageHero title="Application received" />
        <Section className="max-w-2xl!">
          <div className="rounded-md border border-border bg-card p-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
            <h2 className="mt-4 text-2xl font-bold text-primary">Thank you</h2>
            <p className="mt-3 text-muted-foreground">
              Your admission application has been submitted. The admissions office will contact you by
              email within three working days to schedule the interaction.
            </p>
            <Button className="mt-6" onClick={() => setDone(false)}>
              Submit another application
            </Button>
          </div>
        </Section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageHero
        title="Admissions"
        subtitle="Applications for the 2026–27 session are open for Nursery through Class IX and Class XI."
      />
      <Section className="max-w-4xl!">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <fieldset className="rounded-md border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg font-semibold text-primary">
              Student details
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name *" error={err.student_name?.message}>
                <Input {...form.register("student_name")} placeholder="Aarav Sharma" />
              </Field>
              <Field label="Date of birth *" error={err.date_of_birth?.message}>
                <Input type="date" {...form.register("date_of_birth")} />
              </Field>
              <Field label="Gender *" error={err.gender?.message}>
                <Select onValueChange={(v) => form.setValue("gender", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Applying for class *" error={err.applying_for_class?.message}>
                <Select
                  onValueChange={(v) => form.setValue("applying_for_class", v, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Residential address" error={err.student_address?.message}>
                  <Textarea rows={3} {...form.register("student_address")} />
                </Field>
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-md border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg font-semibold text-primary">
              Parent / guardian details
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Father's / guardian's name *" error={err.father_name?.message}>
                <Input {...form.register("father_name")} />
              </Field>
              <Field label="Mother's name" error={err.mother_name?.message}>
                <Input {...form.register("mother_name")} />
              </Field>
              <Field label="Contact number *" error={err.guardian_phone?.message}>
                <Input {...form.register("guardian_phone")} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Email address *" error={err.guardian_email?.message}>
                <Input type="email" {...form.register("guardian_email")} />
              </Field>
              <Field label="Occupation" error={err.guardian_occupation?.message}>
                <Input {...form.register("guardian_occupation")} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-md border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg font-semibold text-primary">
              Academic information
            </legend>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Previous school" error={err.previous_school?.message}>
                <Input {...form.register("previous_school")} />
              </Field>
              <Field label="Last class attended" error={err.previous_class?.message}>
                <Input {...form.register("previous_class")} />
              </Field>
              <Field label="Last percentage / grade" error={err.previous_percentage?.message}>
                <Input {...form.register("previous_percentage")} placeholder="87% or A1" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-md border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg font-semibold text-primary">Documents</legend>
            <p className="text-sm text-muted-foreground">
              Upload the birth certificate, previous report card, transfer certificate and a passport
              photo. PDF or image files, up to 10 MB each.
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border p-8 text-center hover:bg-secondary/50">
              <Upload className="h-6 w-6 text-gold" />
              <span className="text-sm font-medium text-primary">Choose files</span>
              <span className="text-xs text-muted-foreground">You can select more than one file</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files ?? [])])}
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-4 grid gap-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-sm bg-muted px-3 py-2 text-sm"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </Section>
    </PublicLayout>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}