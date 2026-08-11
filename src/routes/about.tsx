import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { SCHOOL } from "@/lib/school";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — St. Aldrin Public School" },
      {
        name: "description",
        content:
          "Our history, vision, mission and values: fifty years of CBSE education at St. Aldrin Public School.",
      },
      { property: "og:title", content: "About St. Aldrin Public School" },
      { property: "og:description", content: "History, vision, mission and values." },
    ],
  }),
  component: About,
});

const values = [
  { title: "Integrity", text: "We expect honesty in the classroom, on the field and beyond the gate." },
  { title: "Curiosity", text: "Questions matter more than answers; enquiry drives every lesson." },
  { title: "Service", text: "Each student completes community service hours every academic year." },
  { title: "Excellence", text: "High standards, patiently taught, consistently practised." },
];

function About() {
  return (
    <PublicLayout>
      <PageHero
        title="About our school"
        subtitle={`${SCHOOL.name} has served the city since ${SCHOOL.established}.`}
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-primary">Our story</h2>
            <p className="mt-4 text-muted-foreground">
              Founded in {SCHOOL.established} with three classrooms and forty-two students, the school
              today educates over 1,800 learners from Nursery to Class XII. What has not changed is the
              founding belief that a school should shape people, not just scores.
            </p>
            <p className="mt-4 text-muted-foreground">
              Our fourteen-acre campus houses science and robotics laboratories, a library of 22,000
              volumes, an auditorium, art and music studios, and playing fields for athletics, cricket,
              football and basketball.
            </p>
          </div>
          <div className="grid gap-6">
            <Card className="border-l-4 border-l-gold shadow-[var(--shadow-card)]">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-primary">Our vision</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  To be a school where every child discovers a talent worth developing and a value worth
                  defending.
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-gold shadow-[var(--shadow-card)]">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-primary">Our mission</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  To deliver a rigorous, inclusive CBSE education supported by mentorship, co-curricular
                  depth and meaningful community engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-md border border-border bg-card p-6">
              <span className="block h-1 w-10 bg-gold" />
              <h3 className="mt-4 text-lg font-semibold text-primary">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 rounded-md bg-primary p-10 text-primary-foreground sm:grid-cols-4">
          {[
            ["1,800+", "Students"],
            ["120", "Faculty"],
            ["14", "Acre campus"],
            ["100%", "Board pass rate"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-bold text-gold">{n}</p>
              <p className="mt-1 text-sm opacity-80">{l}</p>
            </div>
          ))}
        </div>
      </Section>
    </PublicLayout>
  );
}