"use client";

export function Testimonial() {
  const testimonials = [
    {
      quote: "BiaBook changed my life. I used to spend 3 hours a day just responding to 'Are you free?' messages. Now, I just wake up and see my day fully booked.",
      author: "Zainab Okafor",
      role: "Fashion Designer",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhMMgMyB9eHphiYgGyxpU3fBmipIFlZONL1UCymI24FyCMV9yCXrjzTP-ej1940mJo0FR8FdhAR-zK_1Sg5EeBQ1-HwBYlYVgEwdiNFV95cyVKfpTNwMdzbLT02BCq_Xvd7Ep7pCKdlJJcOeIIdOLj8MMjJaGCeLd39o31TpnPUg1Brh8juSZGBL-ykHsda-VEKwvD8sPvTURGZtBGLASR3dZ-zGaxDx02MtBFA56KWVVOCLyYRw3RoL76_hKxc74wdqY8MNIHaHJN",
      borderColor: "border-primary",
    },
    {
      quote: "The WhatsApp reminders are a game changer. My no-shows dropped to almost zero in the first month. It pays for itself 10 times over.",
      author: "Tunde Olawale",
      role: "Business Consultant",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFb0PaP1jzP_lqXLi-e9AzE26cul20BpQkDSrAZtA2syBNQ7qsQMkL9gMsEt6gv-AbNVXABwvlzmegETJh3dBoSWLL76HvMln1ahjYjqEPBZimP0RjCTSUzx6uk4kjFec85GBWjbHbItiaGZfSBODVxx-UbGYmDu0-kzbbpbYBjB3GuOg20Ngkg3OeDjJF8_mHcV9IL5QhNK-kCpO1uebiZhtAyODpLOVHV1niFCMOhvvf5M3-r5-9hyN3XQw9sCTrfRHjLnE0-bpS",
      borderColor: "border-secondary",
    },
    {
      quote: "The payment collection feature is exactly what I needed. No more chasing clients for deposits. It's so professional and my clients love it.",
      author: "Adaeze Eze",
      role: "Salon Owner",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCX40kWxWEeiPuWqz1tFAIlA9p_trK7cKDJKNfmQhGpOv9TgbnA0sbg4BhzXuqhg5VIzdJXqhPK5c7EzHgbBGRh_UTDdROucWoZnZlqHQLuZWzNUAVDWJ3HbupDtwyOD30OxJ_-cV5yJnUHr70y_tEMS97gaGposp1u8WqI7J8JB4yfhlPB5pOtUhtW3y5uf7r4zQ2ch5VZkppb3a2coCKVL5ywDwBPvYY6HmpdweB0OlYAho59UGX0udO6kXmbRpYopjNpC8reYIQN",
      borderColor: "border-tertiary",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">What people say</h2>
          <p className="text-on-surface-variant text-lg font-sans">Trusted by the best artisans across the nation.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className={`bg-surface-container-low p-10 rounded-[2rem] border-l-8 ${t.borderColor} flex flex-col`}>
              <p className="text-xl italic text-on-surface mb-8 font-sans">"{t.quote}"</p>
              <div className="mt-auto flex items-center gap-4">
                <img className="w-12 h-12 rounded-full object-cover" alt={t.author} src={t.image} />
                <div>
                  <h4 className="font-bold text-primary font-display">{t.author}</h4>
                  <p className="text-xs font-bold text-secondary tracking-widest uppercase font-sans">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
