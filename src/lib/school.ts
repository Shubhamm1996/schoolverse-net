export const SCHOOL = {
  name: "St. Aldrin Public School",
  short: "St. Aldrin",
  tagline: "Knowledge · Character · Service",
  established: 1974,
  phone: "+91 98765 43210",
  email: "office@staldrin.edu.in",
  address: "12 Cathedral Road, Civil Lines, Nagpur 440001",
  hours: "Mon – Sat, 8:00 AM – 3:30 PM",
};

export const PUBLIC_NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/principal-message", label: "Principal" },
  { to: "/faculty", label: "Faculty" },
  { to: "/admissions", label: "Admissions" },
  { to: "/gallery", label: "Gallery" },
  { to: "/news", label: "News" },
  { to: "/daily-quote", label: "Daily Quote" },
  { to: "/results", label: "Results" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
] as const;