import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PUBLIC_NAV, SCHOOL } from "@/lib/school";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-navy-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-bold">{SCHOOL.name}</h3>
          <p className="mt-3 max-w-sm text-sm opacity-80">
            A co-educational institution since {SCHOOL.established}, committed to academic
            excellence, strong character and service to the community.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase opacity-70">Explore</h4>
          <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
            {PUBLIC_NAV.map((i) => (
              <Link key={i.to} to={i.to} className="opacity-80 hover:opacity-100">
                {i.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase opacity-70">Reach us</h4>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {SCHOOL.address}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              {SCHOOL.phone}
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              {SCHOOL.email}
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              {SCHOOL.hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.
      </div>
    </footer>
  );
}