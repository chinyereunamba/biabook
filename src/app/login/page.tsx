import { LoginForm } from "@/components/forms/login-form"
import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Image Side (Left) - Hidden on Mobile */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-80"
            alt="Modern high-end Lagos interior"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_XwSW4W6Tr0RmnPvjJ6e6vVVsuwqLzea-p4kJsJgHi9kNcJ64B6_zxOG4YAyZw_5upS2aPA65NIDQAqHDS8reLDe8K2vPjyJRIkwoEWfN2eInJ7rIoY71qUbDc_jtWCDg8K8OVPTV17BVblRC62xJg4gTrG5831Bj_l9_CCcYbjdNctG2pPHAh2NTkl1GKyicbEJKjdRP7JNYAcPoKyN67NkdcdCciDKEKg74NRcWFvzvcUZxjnlGk02Fo-GgpQpfN6SiHvT3S3W0"
          />
        </div>
        {/* Editorial Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent z-10 p-16 flex flex-col justify-end">
          <div className="max-w-xl text-white">
            <span className="font-display text-secondary-container uppercase tracking-widest text-sm mb-4 block font-bold">
              BiaBook Experience
            </span>
            <h1 className="font-display text-5xl lg:text-7xl  font-extrabold tracking-tight mb-6">
              Elevate your scheduling.
            </h1>
            <p className="text-white text-lg lg:text-xl leading-relaxed font-light">
              Join the community of modern artisans defining the future of professional services in Nigeria.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col bg-background relative z-20">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-6">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary font-display">
            BiaBook
          </Link>
          <Link href="/signup" className="text-secondary font-semibold text-sm">
            Sign Up
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
          <div className="w-full max-w-md">
            {/* Branding - Hidden on mobile because of Top Bar */}
            <div className="hidden md:block mb-12">
              <Link href="/" className="text-3xl font-bold tracking-tight text-primary font-display">
                BiaBook
              </Link>
            </div>

            <LoginForm />

            <p className="mt-10 text-center text-on-surface-variant text-sm font-sans">
              New to BiaBook?{" "}
              <Link href="/signup" className="text-secondary font-bold hover:underline underline-offset-4">
                Create your Business page
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Small */}
        <footer className="p-8 mt-auto flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold font-sans gap-4 border-t border-border/10">
          <span>&copy; {new Date().getFullYear()} BIABOOK</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-secondary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-secondary transition-colors">Support</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
