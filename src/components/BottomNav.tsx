import { NavLink } from "react-router-dom";
import { Home, Map, BookOpen, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export const BottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/path", icon: Map, label: t("nav.path") },
    { to: "/journal", icon: BookOpen, label: t("nav.journal") },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/30">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground/70"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isActive ? "" : ""}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
