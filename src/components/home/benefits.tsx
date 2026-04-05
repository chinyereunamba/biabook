"use client";

export function Benefits() {
  return (
    <section className="py-24 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">How your customers book</h2>
          <p className="text-lg text-on-surface-variant font-sans">A seamless, beautiful booking experience that makes your business stand out from the first tap.</p>
        </div>
        <div className="flex flex-col gap-32">
          {/* Step 1: Browse Services (Left content, Right image) */}
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-xl mb-6 shadow-lg shadow-primary/20 font-display">1</div>
              <h3 className="text-3xl font-bold text-primary mb-4 font-display">Browse Services</h3>
              <p className="text-lg text-on-surface-variant mb-6 font-sans">Clients view your professional menu with clear local pricing. They can see exactly what you offer, the duration, and the cost in Naira.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-on-surface-variant font-medium font-sans">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Live menu updates
                </li>
                <li className="flex items-center gap-2 text-on-surface-variant font-medium font-sans">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Transparent local pricing
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-primary/5 border border-border/30 aspect-[4/5] flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">storefront</span>
                  </div>
                  <div className="h-4 w-32 bg-surface-container-highest rounded-full"></div>
                </div>
                <h4 className="font-display font-bold text-primary mb-6">Our Services</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border/20">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-primary font-display">Hair Braiding</span>
                      <span className="text-xs text-on-surface-variant italic font-sans">2 hours</span>
                    </div>
                    <span className="text-secondary font-bold font-display">₦15,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold font-display">Bridal Styling</span>
                      <span className="text-xs text-primary-foreground/70 italic font-sans">3.5 hours</span>
                    </div>
                    <span className="text-accent font-bold font-display">₦45,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border/20">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-primary font-display">Manicure</span>
                      <span className="text-xs text-on-surface-variant italic font-sans">45 mins</span>
                    </div>
                    <span className="text-secondary font-bold font-display">₦8,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Select Staff (Right content, Left image) */}
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="w-full md:w-1/2">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-primary/5 border border-border/30 aspect-[4/5] flex flex-col">
                <h4 className="font-display font-bold text-primary mb-8 text-lg">Choose Professional</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border-2 border-secondary bg-secondary/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <img alt="Artisan Zainab" className="w-14 h-14 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhMMgMyB9eHphiYgGyxpU3fBmipIFlZONL1UCymI24FyCMV9yCXrjzTP-ej1940mJo0FR8FdhAR-zK_1Sg5EeBQ1-HwBYlYVgEwdiNFV95cyVKfpTNwMdzbLT02BCq_Xvd7Ep7pCKdlJJcOeIIdOLj8MMjJaGCeLd39o31TpnPUg1Brh8juSZGBL-ykHsda-VEKwvD8sPvTURGZtBGLASR3dZ-zGaxDx02MtBFA56KWVVOCLyYRw3RoL76_hKxc74wdqY8MNIHaHJN" />
                      <div>
                        <p className="font-bold text-primary font-display">Zainab O.</p>
                        <div className="flex items-center text-secondary font-sans leading-none">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-xs font-bold ml-1">4.9 (124)</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-secondary flex items-center justify-center">
                      <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border/20 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <img alt="Artisan Sarah" className="w-14 h-14 rounded-full object-cover grayscale opacity-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnyQWSd8RDJkJSrAhox6As8-LNmQWlXiZTPc1dC018TXZZMpMgQ-p9KJHgxBrAKNZl8jxzfYO4yHZdNFQWhIVjPTOpXObslMMEJoYK8HEtbRNvVGx-ZPhos5dMtZbifalhttLtHWCRj9LD-Vhgw07PJY_WecTuyAw59E8sF8LLEn6QCxv2J-x2408P8ZqlmGciJJnc960yKiH5-LOkLFeDcrfnjZIDA4lEFOsfFwlNPv-dbABn873Yu-Ku7tHew4_OKkaueaflWspm" />
                      <div>
                        <p className="font-bold text-primary font-display">Sarah K.</p>
                        <div className="flex items-center text-on-surface-variant font-sans leading-none">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-xs font-bold ml-1">4.8 (82)</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-border/30"></div>
                  </div>
                </div>
                <button className="mt-auto w-full py-4 bg-secondary text-secondary-foreground rounded-xl font-bold font-display">Select Professional</button>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary text-secondary-foreground font-bold text-xl mb-6 shadow-lg shadow-secondary/20">2</div>
              <h3 className="text-3xl font-bold text-primary mb-4 font-display">Select Professional</h3>
              <p className="text-lg text-on-surface-variant mb-6 font-sans">Let your clients choose their favorite staff member or browse through your team of experts. Show off ratings and reviews to build instant trust.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-on-surface-variant font-medium font-sans">
                  <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Staff-specific scheduling
                </li>
                <li className="flex items-center gap-2 text-on-surface-variant font-medium font-sans">
                  <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Verified ratings and reviews
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3: Pick a Time (Left content, Right image) */}
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-xl mb-6 shadow-lg shadow-primary/20 font-display">3</div>
              <h3 className="text-3xl font-bold text-primary mb-4 font-display">Pick a Time</h3>
              <p className="text-lg text-on-surface-variant mb-6 font-sans">Clients see your live availability in their own time zone. Real-time synchronization ensures no double-bookings, ever.</p>
              <div className="p-4 bg-primary-container/20 rounded-2xl border border-primary/10">
                <p className="text-primary font-bold text-sm font-sans">Pro Tip: "Our users reduce scheduling calls by 85% by letting clients book 24/7."</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="w-full bg-white rounded-3xl p-8 shadow-2xl shadow-primary/5 border border-border/30 aspect-[4/5] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <span className="material-symbols-outlined text-primary cursor-pointer">chevron_left</span>
                  <span className="text-lg font-bold text-primary font-display">October 2024</span>
                  <span className="material-symbols-outlined text-primary cursor-pointer">chevron_right</span>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-8 text-center">
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full"></div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full"></div>
                  <div className="h-1.5 w-full bg-primary rounded-full"></div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full"></div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full"></div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full"></div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full"></div>
                </div>
                <p className="text-sm font-bold text-on-surface-variant mb-6 uppercase tracking-widest font-sans">Available Times</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-border/30 rounded-xl text-center text-sm text-on-surface-variant font-sans">09:00 AM</div>
                  <div className="p-4 border-2 border-secondary bg-secondary/5 rounded-xl text-center text-sm font-bold text-secondary font-sans leading-none flex items-center justify-center">10:30 AM</div>
                  <div className="p-4 border border-border/30 rounded-xl text-center text-sm text-on-surface-variant font-sans">01:00 PM</div>
                  <div className="p-4 border border-border/30 rounded-xl text-center text-sm text-on-surface-variant font-sans">02:30 PM</div>
                  <div className="p-4 border border-border/30 rounded-xl text-center text-sm text-on-surface-variant font-sans">04:00 PM</div>
                  <div className="p-4 border border-border/30 rounded-xl text-center text-sm text-on-surface-variant font-sans">05:30 PM</div>
                </div>
                <button className="mt-auto w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 font-display">Confirm Date & Time</button>
              </div>
            </div>
          </div>

          {/* Step 4: Secure Payment (Right content, Left image) */}
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="w-full md:w-1/2">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-primary/5 border border-border/30 aspect-[4/5] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-sm">
                  <h4 className="font-display font-bold text-primary mb-6 text-center text-lg">Secure Your Booking</h4>
                  <div className="bg-surface-container-low p-6 rounded-2xl mb-6">
                    <div className="flex justify-between items-center mb-4 font-sans">
                      <span className="text-on-surface-variant">Bridal Styling</span>
                      <span className="font-bold text-primary">₦45,000</span>
                    </div>
                    <div className="h-[1px] bg-border/30 mb-4"></div>
                    <div className="flex justify-between items-center text-secondary font-bold font-sans">
                      <span>Deposit (50%)</span>
                      <span>₦22,500</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-on-surface-variant mb-4 uppercase text-center font-sans tracking-wide">Pay via</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 border-2 border-secondary rounded-2xl flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                      <span className="text-xs font-bold text-primary font-display">Bank Transfer</span>
                    </div>
                    <div className="p-4 border border-border/30 rounded-2xl flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
                      <span className="text-xs font-bold text-on-surface-variant font-display">Card / USSD</span>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-secondary text-secondary-foreground rounded-xl font-bold font-display">Pay & Secure Now</button>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary text-secondary-foreground font-bold text-xl mb-6 shadow-lg shadow-secondary/20 font-display">4</div>
              <h3 className="text-3xl font-bold text-primary mb-4 font-display">Secure Payment</h3>
              <p className="text-lg text-on-surface-variant mb-6 font-sans">Eliminate no-shows by collecting deposits or full payments upfront. We support all major Nigerian payment methods including Bank Transfer, Card, and USSD.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-on-surface-variant font-medium font-sans">
                  <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Instant bank transfer verification
                </li>
                <li className="flex items-center gap-2 text-on-surface-variant font-medium font-sans">
                  <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  94% reduction in ghosting
                </li>
              </ul>
            </div>
          </div>

          {/* Step 5: Instant Confirmation (Left content, Right image) */}
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-xl mb-6 shadow-lg shadow-primary/20 font-display">5</div>
              <h3 className="text-3xl font-bold text-primary mb-4 font-display">Instant Confirmation</h3>
              <p className="text-lg text-on-surface-variant mb-6 font-sans">The moment a booking is made, a beautiful WhatsApp confirmation is sent to the client and an alert reaches your dashboard. Everyone stays in sync without a single manual text.</p>
              <div className="flex gap-4">
                <div className="px-6 py-3 bg-surface-container-highest rounded-xl text-primary font-bold text-sm font-display">WhatsApp Alerts</div>
                <div className="px-6 py-3 bg-surface-container-highest rounded-xl text-primary font-bold text-sm font-display">Calendar Sync</div>
              </div>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="w-full bg-[#E4FFD4] rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 border border-black/5 aspect-[4/5] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-16 bg-[#075E54] flex items-center px-6 gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-bold font-sans">BiaBook Business</span>
                    <span className="text-[10px] text-white/70 font-sans">Online</span>
                  </div>
                </div>
                <div className="mt-16 space-y-6">
                  <div className="bg-white p-5 rounded-3xl rounded-tl-none shadow-sm max-w-[90%]">
                    <p className="text-sm text-on-surface leading-snug font-sans">
                      <span className="font-bold text-[#075E54]">Booking Confirmed! ✅</span><br /><br />
                      Hi Zainab, your session for <span className="font-bold">Bridal Styling</span> is set for tomorrow at <span className="font-bold">10:30 AM</span>.<br /><br />
                      📍 Location: Lekki Phase 1
                    </p>
                    <p className="text-right text-[10px] text-on-surface-variant mt-2 font-sans">14:02</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl rounded-tl-none shadow-sm max-w-[80%] border-l-4 border-secondary">
                    <p className="text-sm text-on-surface leading-snug font-medium italic font-sans">
                      "I can't wait! See you then."
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex gap-3">
                  <div className="flex-grow h-12 bg-white rounded-full border border-black/5 flex items-center px-5">
                    <div className="w-1/2 h-2.5 bg-surface-container-highest rounded-full"></div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#128C7E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
