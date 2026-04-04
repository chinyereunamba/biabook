export function Stats() {
    return (
        <section className="py-24 bg-surface-container-low">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="p-8 bg-surface rounded-3xl text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2 font-display">12k+</div>
                        <div className="text-sm font-bold tracking-widest uppercase text-secondary font-sans leading-none">Businesses</div>
                    </div>
                    <div className="p-8 bg-primary text-primary-foreground rounded-3xl text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="text-4xl md:text-5xl font-extrabold mb-2 font-display">94%</div>
                        <div className="text-sm font-bold tracking-widest uppercase text-primary-container font-sans leading-none">Fewer No-shows</div>
                    </div>
                    <div className="p-8 bg-surface rounded-3xl text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2 font-display">60s</div>
                        <div className="text-sm font-bold tracking-widest uppercase text-secondary font-sans leading-none">Setup Time</div>
                    </div>
                    <div className="p-8 bg-secondary text-secondary-foreground rounded-3xl text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="text-4xl md:text-5xl font-extrabold mb-2 font-display">4.9</div>
                        <div className="text-sm font-bold tracking-widest uppercase text-secondary-container font-sans leading-none font-bold">Avg. Rating</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
