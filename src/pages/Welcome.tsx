import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Cross, Mail, Eye, EyeOff } from "lucide-react";

const Welcome = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"welcome" | "login" | "signup">("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) setError(error.message || t("auth.errorGeneric"));
    setLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage(t("auth.checkEmail"));
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeInUp} className="absolute top-6 right-6">
        <LanguageSelector />
      </motion.div>

      <motion.div variants={fadeInUp} className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✝️</span>
        </div>
        <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight mb-2">
          {t("auth.welcome")}
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          {t("auth.subtitle")}
        </p>
      </motion.div>

      {mode === "welcome" && (
        <motion.div variants={fadeInUp} className="w-full space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-2xl text-base font-medium gap-3"
            variant="outline"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("auth.continueGoogle")}
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("auth.or")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            onClick={() => setMode("login")}
            variant="default"
            className="w-full h-12 rounded-2xl text-base font-medium gap-2"
          >
            <Mail className="w-4 h-4" />
            {t("auth.loginEmail")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
              {t("auth.signUp")}
            </button>
          </p>
        </motion.div>
      )}

      {mode === "login" && (
        <motion.form variants={fadeInUp} onSubmit={handleEmailLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl h-11 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base font-medium">
            {loading ? t("auth.loading") : t("auth.login")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <button type="button" onClick={() => { setMode("signup"); setError(""); }} className="text-primary font-medium hover:underline">
              {t("auth.signUp")}
            </button>
          </p>
          <button type="button" onClick={() => { setMode("welcome"); setError(""); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
            ← {t("auth.back")}
          </button>
        </motion.form>
      )}

      {mode === "signup" && (
        <motion.form variants={fadeInUp} onSubmit={handleEmailSignup} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">{t("auth.email")}</Label>
            <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">{t("auth.password")}</Label>
            <div className="relative">
              <Input id="signup-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-xl h-11 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base font-medium">
            {loading ? t("auth.loading") : t("auth.createAccount")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-primary font-medium hover:underline">
              {t("auth.login")}
            </button>
          </p>
          <button type="button" onClick={() => { setMode("welcome"); setError(""); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
            ← {t("auth.back")}
          </button>
        </motion.form>
      )}

      {error && (
        <motion.p variants={fadeInUp} className="mt-4 text-sm text-destructive text-center">{error}</motion.p>
      )}
      {message && (
        <motion.p variants={fadeInUp} className="mt-4 text-sm text-primary text-center">{message}</motion.p>
      )}
    </motion.div>
  );
};

export default Welcome;
