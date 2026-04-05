import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Form Side (Left) */}
      <section className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-surface z-10">
        {/* Brand Anchor */}
        <div className="mb-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl font-extrabold font-display tracking-tight text-primary">BiaBook</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto md:mx-0">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-3 tracking-tight leading-tight">
              Reset Password
            </h1>
            <p className="text-on-surface-variant text-lg font-sans">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </header>

          <ForgotPasswordForm />

          <div className="mt-10 text-center md:text-left">
            <p className="text-on-surface-variant font-sans">
              Remember your password?
              <Link href="/login" className="text-secondary font-bold hover:underline decoration-2 underline-offset-4 ml-1 transition-all">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        <footer className="mt-auto pt-12">
          <p className="text-xs text-on-surface-variant/60 font-medium font-sans">
            &copy; {new Date().getFullYear()} BiaBook. Handcrafted for the Modern Artisan.
          </p>
        </footer>
      </section>

      {/* Visual Narrative Side (Right) - Hidden on Mobile */}
      <section className="hidden md:flex w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background Graphic Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-container rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-secondary-container rounded-full opacity-20 blur-3xl"></div>

        {/* Main Illustration Content */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="relative mb-12">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40 aspect-[4/5] relative">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069"
                alt="Serene workspace"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Floating Glass UI Element */}
              <div className="absolute bottom-6 left-6 right-6 glass-panel p-6 rounded-2xl shadow-lg border border-white/10 bg-surface/80 backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-on-secondary shrink-0">
                    <span className="material-symbols-outlined">shield_lock</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-primary mb-1">Peace of Mind</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
                      "Your security is our priority. We use industry-leading encryption to keep your data safe while you focus on your craft."
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary rounded-2xl flex items-center justify-center transform rotate-12 shadow-xl">
              <span className="material-symbols-outlined text-on-secondary text-4xl">verified_user</span>
            </div>
          </div>

          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl font-display font-bold text-on-primary leading-tight">
              Secure & Professional.
            </h2>
            <p className="text-on-primary/80 text-lg font-sans">
              BiaBook provides double-layer security so you never have to worry about your business data.
            </p>
          </div>
        </div>

        {/* Asymmetric Accent */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 translate-x-[-50%] w-1 bg-secondary/30 h-1/2 rounded-full"></div>
      </section>
    </main>
  );
}
