import { APP_VERSION, BUILD_DATE } from "@/version";

export function Footer() {
  return (
    <footer className="text-center py-3 text-xs text-muted-foreground border-t border-border/30">
      <p>Spirit Start v{APP_VERSION} • {BUILD_DATE}</p>
    </footer>
  );
}
