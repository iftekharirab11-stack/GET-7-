import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-16 px-6 bg-gradient-to-b from-[#0A0C10] to-[#0D1117]">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-extrabold leading-tight mb-6 uppercase tracking-tight">
          NEXUS STUDY ABROAD
          <span className="text-[var(--accent-cyan)] drop-shadow-[0_0_10px_rgba(0,242,254,0.5)]"> // AI IELTS TUTOR</span>
        </h1>
        <p className="text-xl text-[var(--muted)] mb-8 font-mono uppercase tracking-wider">
          PREMIUM AI-POWERED PREPARATION FOR PRESTIGIOUS UNIVERSITY ADMISSIONS
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="btn btn-primary">Initialize Mission</Link>
          <Link href="/login" className="btn btn-secondary">Access Terminal</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="card">
          <h3 className="text-xl mb-2 font-sans uppercase tracking-wide">AI CHAT</h3>
          <p className="text-[var(--muted)] text-sm font-mono">Real-time conversational practice with neural language processing for IELTS excellence.</p>
        </div>
        <div className="card">
          <h3 className="text-xl mb-2 font-sans uppercase tracking-wide">WRITING PRACTICE</h3>
          <p className="text-[var(--muted)] text-sm font-mono">Advanced analysis and feedback with glitch-decoding AI commentary on your essays.</p>
        </div>
        <div className="card">
          <h3 className="text-xl mb-2 font-sans uppercase tracking-wide">SPEAKING PRACTICE</h3>
          <p className="text-[var(--muted)] text-sm font-mono">Fluid geometric waveform visualization for pronunciation mastery.</p>
        </div>
      </div>
    </div>
  );
}