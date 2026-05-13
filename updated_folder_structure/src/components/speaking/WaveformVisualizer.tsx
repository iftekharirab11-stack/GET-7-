export function WaveformVisualizer({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return (<div className="flex items-center justify-center gap-1 h-16 mt-4">{Array.from({ length: 12 }).map((_, i) => (<div key={i} className="w-1.5 bg-gradient-to-t from-accent-cyan to-accent-purple rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s`, height: `${20 + Math.random() * 60}%` }}></div>))}</div>);
}