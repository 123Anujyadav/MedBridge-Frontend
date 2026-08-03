export default function HomeComparison() {
  return (
    <section id="why-us" className="py-20 lg:py-24 bg-[#fafcfb]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose MedBridge?
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 card-3d-depth overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-6">Feature</th>
                  <th className="py-4 px-6">Traditional Healthcare</th>
                  <th className="py-4 px-6 text-[#064e3b] bg-emerald-50/60">MedBridge AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Data Access</td>
                  <td className="py-4 px-6 text-slate-500">Fragmented / Paper-Based</td>
                  <td className="py-4 px-6 font-bold text-[#064e3b] bg-emerald-50/40">Unified &amp; Instant</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Diagnostics</td>
                  <td className="py-4 px-6 text-slate-500">Manual &amp; Slow Only</td>
                  <td className="py-4 px-6 font-bold text-[#064e3b] bg-emerald-50/40">AI-Augmented (99.4% Accuracy)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Emergency Response</td>
                  <td className="py-4 px-6 text-slate-500">Call-Centric / Delayed</td>
                  <td className="py-4 px-6 font-bold text-[#064e3b] bg-emerald-50/40">One-Tap SOS &amp; Automated</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Follow-ups</td>
                  <td className="py-4 px-6 text-slate-500">Self-managed</td>
                  <td className="py-4 px-6 font-bold text-[#064e3b] bg-emerald-50/40">Automated Smart Tracking</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
