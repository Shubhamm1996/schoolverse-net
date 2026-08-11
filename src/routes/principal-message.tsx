import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";
import principal from "@/assets/principal.jpg";

export const Route = createFileRoute("/principal-message")({
  head: () => ({
    meta: [
      { title: "Principal's Message — St. Aldrin Public School" },
      {
        name: "description",
        content:
          "A message from the Principal of St. Aldrin Public School on learning, character and the year ahead.",
      },
      { property: "og:title", content: "Principal's Message" },
      { property: "og:description", content: "A note from our Principal to students and parents." },
    ],
  }),
  component: PrincipalMessage,
});

function PrincipalMessage() {
  return (
    <PublicLayout>
      <PageHero title="Principal's message" subtitle="Dr. Anjali Verma, Principal" />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
          <figure>
            <img
              src={principal}
              alt="Portrait of the school Principal"
              loading="lazy"
              width={800}
              height={1000}
              className="w-full rounded-md object-cover shadow-[var(--shadow-card)]"
            />
            <figcaption className="mt-3 text-sm text-muted-foreground">
              Dr. Anjali Verma · Principal since 2016
            </figcaption>
          </figure>
          <div className="space-y-5 text-muted-foreground">
            <p className="font-display text-2xl text-primary">Dear parents and students,</p>
            <p>
              A school is not measured by its buildings but by the quiet habits it builds in young
              people: the willingness to try again, to listen carefully, to stand up for someone else.
              Everything else — marks, medals, admissions — follows from those habits.
            </p>
            <p>
              This year we have deepened our mentoring programme so that every student from Class VI
              upward meets a faculty mentor each fortnight. We have expanded the robotics and design
              lab, introduced a structured reading hour across the middle school, and widened our
              scholarship pool for deserving applicants.
            </p>
            <p>
              To our parents: you are partners, not spectators. Come to the parent-teacher meetings,
              ask us difficult questions, and tell us what your child needs. To our students: be
              curious, be kind, and be patient with yourselves.
            </p>
            <p>
              I look forward to meeting you on campus.
            </p>
            <p className="font-display text-lg text-primary">Dr. Anjali Verma</p>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}