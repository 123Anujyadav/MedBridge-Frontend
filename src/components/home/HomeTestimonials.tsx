export default function HomeTestimonials() {
  return (
    <section className="py-20 lg:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Professionals &amp; Patients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 card-3d-depth space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-200 text-[#064e3b] font-bold flex items-center justify-center text-lg shadow-xs">
                DA
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Dr. Ananya Iyer</h4>
                <p className="text-xs text-slate-500">Chief Cardiologist, Apex Hospital</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              &ldquo;MedBridge AI has significantly reduced the time we spend on preliminary triage and records retrieval, allowing us to focus on patient outcomes.&rdquo;
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 card-3d-depth space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-200 text-teal-900 font-bold flex items-center justify-center text-lg shadow-xs">
                RS
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Rahul Sharma</h4>
                <p className="text-xs text-slate-500">Patient User</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              &ldquo;The automated reminders and instant SOS feature saved my father&apos;s life during an emergency. Essential tool for every family.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
