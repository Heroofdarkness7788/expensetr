import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DarkVeil from "@/components/DarkVeil";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Create account — Expense It" }] }),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("We sent a 6-digit code to " + email);
    setStep("verify");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Email confirmed — welcome!");
      nav({ to: "/dashboard", replace: true });
    } else {
      toast.success("Email confirmed — please sign in.");
      nav({ to: "/login", replace: true });
    }
  }

  async function handleResend() {
    if (resending) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("A new code is on its way.");
  }

  return (
    <div className="dark relative min-h-app overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <DarkVeil hueShift={140} noiseIntensity={0} scanlineIntensity={0} speed={0.4} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--background) / 0) 0%, hsl(var(--background) / 0.4) 55%, hsl(var(--background) / 0.95) 90%, hsl(var(--background)) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 min-h-app grid place-items-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white/[0.04] backdrop-blur-2xl ring-1 ring-white/10 p-8 md:p-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {step === "form" ? "Create your account" : "Verify your email"}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {step === "form"
                ? "You'll get a 6-digit code by email to confirm."
                : `Enter the 6-digit code we sent to ${email}.`}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.form
                key="form"
                onSubmit={handleSignup}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 mt-8"
              >
                <Field label="Full name">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-transparent outline-none text-base font-medium text-white placeholder:text-white/30 mt-2 pb-2 border-b border-white/15 focus:border-primary transition-colors"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-transparent outline-none text-base font-medium text-white placeholder:text-white/30 mt-2 pb-2 border-b border-white/15 focus:border-primary transition-colors"
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent outline-none text-base font-medium text-white placeholder:text-white/30 mt-2 pb-2 border-b border-white/15 focus:border-primary transition-colors"
                  />
                </Field>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  type="submit"
                  className="relative w-full rounded-2xl py-4 text-sm font-semibold text-primary-foreground overflow-hidden bg-primary ring-1 ring-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_12px_30px_-8px_hsl(var(--primary)/0.55)] disabled:opacity-50"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 via-transparent to-black/20" />
                  <span className="relative">{loading ? "Sending code…" : "Send verification code"}</span>
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="verify"
                onSubmit={handleVerify}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 mt-8"
              >
                <Field label="6-digit code">
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    className="w-full bg-transparent outline-none text-3xl font-semibold tracking-[0.6em] text-center text-white placeholder:text-white/20 mt-2 pb-2 border-b border-white/15 focus:border-primary transition-colors"
                  />
                </Field>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  type="submit"
                  className="relative w-full rounded-2xl py-4 text-sm font-semibold text-primary-foreground overflow-hidden bg-primary ring-1 ring-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_12px_30px_-8px_hsl(var(--primary)/0.55)] disabled:opacity-50"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 via-transparent to-black/20" />
                  <span className="relative">{loading ? "Verifying…" : "Verify & continue"}</span>
                </motion.button>

                <div className="flex items-center justify-between text-xs text-white/60">
                  <button type="button" onClick={() => setStep("form")} className="hover:text-white transition-colors">
                    ← Change email
                  </button>
                  <button type="button" onClick={handleResend} disabled={resending} className="hover:text-white transition-colors disabled:opacity-50">
                    {resending ? "Resending…" : "Resend code"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-white/50 pt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.14em]">{label}</label>
      {children}
    </div>
  );
}
