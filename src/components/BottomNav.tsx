import { NavLink } from "react-router-dom";
import { Home, Map, BookOpen, User } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/path", icon: Map, label: "Path" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/profile", icon: User, label: "Profile" },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
    <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Icon className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] font-medium tracking-wide">{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);
