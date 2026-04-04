"use client";

export function Footer() {
  return (
    <footer className="bg-surface-container pt-16 pb-8 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2 md:col-span-1">
          <div className="text-xl font-black text-primary mb-6 font-display">BiaBook</div>
          <p className="text-on-surface-variant font-sans text-sm leading-relaxed max-w-xs">
            Empowering the modern Nigerian artisan with high-end scheduling tools designed for our unique market.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-primary mb-6 font-display">Product</h4>
          <ul className="space-y-4">
            <li><a className="text-on-surface-variant hover:text-secondary transition-colors font-sans text-sm" href="#">Features</a></li>
            <li><a className="text-on-surface-variant hover:text-secondary transition-colors font-sans text-sm" href="#">Pricing</a></li>
            <li><a className="text-on-surface-variant hover:text-secondary transition-colors font-sans text-sm" href="#">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-primary mb-6 font-display">Company</h4>
          <ul className="space-y-4">
            <li><a className="text-on-surface-variant hover:text-secondary transition-colors font-sans text-sm" href="#">Careers</a></li>
            <li><a className="text-on-surface-variant hover:text-secondary transition-colors font-sans text-sm" href="#">Contact</a></li>
            <li><a className="text-on-surface-variant hover:text-secondary transition-colors font-sans text-sm" href="#">Privacy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-primary mb-6 font-display">Follow Us</h4>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all" href="#">
              <span className="material-symbols-outlined text-xl">share</span>
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 pt-8 border-t border-border/20 text-center">
        <p className="text-on-surface-variant text-xs font-sans">
          &copy; {new Date().getFullYear()} BiaBook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
