export function HowItWorks() {
    return (
        <section className="py-24 bg-surface-container overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="max-w-xl">
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">Built for scale, <br />designed for ease.</h2>
                        <p className="text-lg text-on-surface-variant font-sans leading-relaxed">Getting started with BiaBook takes less than a minute. Here is how you can transform your business today.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="material-symbols-outlined text-secondary text-8xl opacity-10">rocket_launch</span>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-border/30 z-0"></div>
                    {/* Step 1 */}
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-8 shadow-lg shadow-primary/20 font-display">1</div>
                        <h3 className="text-2xl font-bold text-primary mb-4 font-display">Create your page</h3>
                        <p className="text-on-surface-variant leading-relaxed font-sans">Add your services, pricing, and availability. Customize your page to match your brand's unique style.</p>
                    </div>
                    {/* Step 2 */}
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-8 shadow-lg shadow-secondary/20 font-display">2</div>
                        <h3 className="text-2xl font-bold text-primary mb-4 font-display">Share your link</h3>
                        <p className="text-on-surface-variant leading-relaxed font-sans">Put your booking link in your Instagram bio, WhatsApp status, or send it directly to your clients.</p>
                    </div>
                    {/* Step 3 */}
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-primary-container text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-8 shadow-lg shadow-primary-container/20 font-display">3</div>
                        <h3 className="text-2xl font-bold text-primary mb-4 font-display">Show up and serve</h3>
                        <p className="text-on-surface-variant leading-relaxed font-sans">Focus on what you do best. We'll handle the reminders, payments, and calendar management.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
