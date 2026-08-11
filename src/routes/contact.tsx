import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";
import { SCHOOL } from "@/lib/school";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — St. Aldrin Public School" },
      {
        name: "description",
        content: `Reach the school office at ${SCHOOL.phone} or visit us at ${SCHOOL.address}.`,
      },
      { property: "og:title", content: "Contact St. Aldrin Public School" },
      { property: "og:description", content: "Address, phone, email and office hours." },
    ],
  }),
  component: Contact,
});

const details = [
  { icon: MapPin, label: "Campus", value: SCHOOL.address },
  { icon: Phone, label: "Front office", value: SCHOOL.phone },
  { icon: Mail, label: "Email", value: SCHOOL.email },
  { icon: Clock, label: "Office hours", value: SCHOOL.hours },
];

function Contact() {
  return (
    <PublicLayout>
      <PageHero title="Contact us" subtitle="The front office is happy to help with any query." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="grid gap-4">
            {details.map((d) => (
              <div key={d.label} className="flex gap-4 rounded-md border border-border bg-card p-5">
                <d.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">{d.label}</p>
                  <p className="mt-1 font-medium text-primary">{d.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-md bg-primary p-8 text-primary-foreground">
            <h2 className="font-display text-2xl font-bold">Planning a visit?</h2>
            <p className="mt-3 text-sm opacity-85">
              Campus tours run every Saturday at 10:00 AM during the admission season. Call the front
              office a day in advance so a member of staff can accompany you.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="opacity-70">Admissions desk</dt>
                <dd className="font-medium">Extension 21 · {SCHOOL.phone}</dd>
              </div>
              <div>
                <dt className="opacity-70">Transport enquiries</dt>
                <dd className="font-medium">Extension 33</dd>
              </div>
              <div>
                <dt className="opacity-70">Accounts</dt>
                <dd className="font-medium">Extension 14</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}