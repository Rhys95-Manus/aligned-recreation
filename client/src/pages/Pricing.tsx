import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const monthlyPlans = [
  {
    name: "Starter",
    price: 15,
    description: "1 Category",
    features: [
      "Choose any 1 category",
      "AI form analysis",
      "Live coaching feedback",
      "Rep counter & auto-stop",
      "Video replay with skeleton overlay",
    ],
    highlight: false,
  },
  {
    name: "Plus",
    price: 29,
    description: "2 Categories",
    features: [
      "Choose any 2 categories",
      "AI form analysis",
      "Live coaching feedback",
      "Rep counter & auto-stop",
      "Video replay with skeleton overlay",
      "3D hologram reference",
    ],
    highlight: true,
  },
  {
    name: "All Access",
    price: 40,
    description: "All 3 Categories",
    features: [
      "Sports, Weightlifting & Recovery",
      "AI form analysis",
      "Live coaching feedback",
      "Rep counter & auto-stop",
      "Video replay with skeleton overlay",
      "3D hologram reference",
      "Priority support",
    ],
    highlight: false,
  },
];

const lifetimeDeals = [
  {
    name: "Lifetime Starter",
    price: 97,
    description: "1 Category",
    monthly: 15,
  },
  {
    name: "Lifetime Plus",
    price: 167,
    description: "2 Categories",
    monthly: 29,
  },
  {
    name: "Lifetime All Access",
    price: 200,
    description: "All 3 Categories",
    monthly: 40,
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <Header />

      <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-12 pb-32">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
          className="mb-8 !border-2 !border-slate-600 bg-transparent text-white hover:bg-slate-600/10 rounded-lg px-4 py-2"
        >
          &larr; Back
        </Button>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your training. Upgrade, downgrade, or
            cancel anytime.
          </p>
        </div>

        {/* ─── Monthly Plans ─── */}
        <section className="mb-20">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 mb-8">
            Monthly Plans
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monthlyPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all ${
                  plan.highlight
                    ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_40px_-12px_rgba(0,200,255,0.25)]"
                    : "border-slate-700/60 bg-slate-900/30"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                  </span>
                )}

                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-extrabold">${plan.price}</span>
                  <span className="text-slate-400 text-lg">/mo</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <span className="text-cyan-400 mt-0.5 shrink-0">
                        &#10003;
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-5 text-base font-semibold rounded-xl ${
                    plan.highlight
                      ? "bg-cyan-500 hover:bg-cyan-600 text-black"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                  onClick={() =>
                    console.log(`Selected monthly: ${plan.name}`)
                  }
                >
                  Get {plan.name}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Lifetime Deals ─── */}
        <section>
          {/* Urgency badge */}
          <div className="text-center mb-6">
            <span className="inline-block bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full">
              Pre-Launch Special &mdash; Price goes up at launch
            </span>
          </div>

          <h2 className="text-center text-3xl md:text-4xl font-bold mb-3">
            Lifetime Deals
          </h2>
          <p className="text-center text-slate-400 max-w-xl mx-auto mb-10">
            Lock in lifetime access before we launch &mdash; pricing increases
            once we go live.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lifetimeDeals.map((deal) => {
              const monthsSaved = Math.ceil(deal.price / deal.monthly);
              return (
                <div
                  key={deal.name}
                  className="relative rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 flex flex-col transition-all hover:border-amber-400/50 hover:shadow-[0_0_40px_-12px_rgba(245,158,11,0.2)]"
                >
                  <h3 className="text-2xl font-bold mb-1">{deal.name}</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    {deal.description}
                  </p>

                  <div className="mb-2">
                    <span className="text-5xl font-extrabold">
                      ${deal.price}
                    </span>
                    <span className="text-slate-400 text-lg ml-1">
                      one-time
                    </span>
                  </div>
                  <p className="text-sm text-amber-400/80 mb-8">
                    Equivalent to ~{monthsSaved} months &mdash; then it&apos;s
                    free forever
                  </p>

                  <Button
                    className="w-full py-5 text-base font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-black mt-auto"
                    onClick={() =>
                      console.log(`Selected lifetime: ${deal.name}`)
                    }
                  >
                    Lock In {deal.name}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <p className="text-slate-500 text-xs text-center mt-16">
          All prices in USD. Subscriptions can be cancelled anytime. Lifetime
          deals are a one-time payment with no recurring charges.
        </p>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#050810] border-t border-slate-800/50 py-4 px-8 flex items-center justify-between">
        <div className="text-slate-400 text-sm">Aligned Motion</div>
        <div className="flex gap-4 text-sm">
          <span
            className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
            onClick={() => setLocation("/terms")}
          >
            Terms
          </span>
          <span
            className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
            onClick={() => setLocation("/privacy")}
          >
            Privacy
          </span>
        </div>
      </footer>
    </div>
  );
}
