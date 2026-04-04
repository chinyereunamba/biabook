"use client";

export function Features() {
  const features = [
    {
      icon: "chat",
      title: "WhatsApp Reminders",
      desc: "Send automated booking confirmations and reminders directly to your clients' WhatsApp.",
      colorClass: "bg-primary group-hover:bg-primary-fixed", // I'll use primary-container for fixed
      iconColor: "text-on-primary group-hover:text-primary",
    },
    {
      icon: "schedule",
      title: "Smart Scheduling",
      desc: "Intelligent gap management that prevents overlapping appointments and optimizes your day.",
      colorClass: "bg-secondary group-hover:bg-secondary-fixed",
      iconColor: "text-on-secondary group-hover:text-secondary",
    },
    {
      icon: "dashboard",
      title: "Live Dashboard",
      desc: "Track your daily revenue, upcoming bookings, and staff performance in real-time.",
      colorClass: "bg-tertiary group-hover:bg-tertiary-fixed",
      iconColor: "text-on-tertiary group-hover:text-tertiary",
    },
    {
      icon: "link",
      title: "Shareable Link",
      desc: "A custom bio link for your Instagram and TikTok that lets clients book in two taps.",
      colorClass: "bg-primary-container group-hover:bg-primary-fixed-dim",
      iconColor: "text-primary",
    },
    {
      icon: "payments",
      title: "Payment Collection",
      desc: "Collect deposits or full payments upfront to secure your time and eliminate ghosting.",
      colorClass: "bg-secondary-container group-hover:bg-secondary-fixed-dim",
      iconColor: "text-secondary",
    },
    {
      icon: "group",
      title: "Team Calendar",
      desc: "Manage multiple staff members, their individual shifts, and service specialties easily.",
      colorClass: "bg-surface-container-highest group-hover:bg-surface-container-lowest",
      iconColor: "text-primary",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
            Everything you need. <br />Nothing you don't.
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-sans leading-relaxed">
            We've built tools specifically for the Nigerian business landscape, from WhatsApp integration to local payment processing.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-surface-container-low p-10 rounded-[2rem] group hover:bg-primary transition-colors duration-500 cursor-default"
            >
              <div className={`w-14 h-14 ${feature.colorClass.replace('-fixed', '-container')} rounded-2xl flex items-center justify-center mb-8 transition-colors`}>
                <span className={`material-symbols-outlined ${feature.iconColor} text-3xl`}>
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary group-hover:text-primary-foreground mb-4 font-display">
                {feature.title}
              </h3>
              <p className="text-on-surface-variant group-hover:text-primary-foreground/80 leading-relaxed font-sans">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
