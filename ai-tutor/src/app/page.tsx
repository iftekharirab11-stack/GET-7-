import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          NEXUS STUDY ABROAD
          <span className={styles.highlight}>{" // AI IELTS TUTOR"}</span>
        </h1>
        <p className={styles.subtitle}>
          PREMIUM AI-POWERED PREPARATION FOR PRESTIGIOUS UNIVERSITY ADMISSIONS
        </p>
        <div className={styles.actions}>
          <Link href="/dashboard" className="btn btn-primary">
            Initialize Mission
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Access Terminal
          </Link>
        </div>
      </div>

      <div className={styles.features}>
        <div className="card">
          <h3>AI CHAT</h3>
          <p>Real-time conversational practice with neural language processing for IELTS excellence.</p>
        </div>
        <div className="card">
          <h3>WRITING PRACTICE</h3>
          <p>Advanced analysis and feedback with glitch-decoding AI commentary on your essays.</p>
        </div>
        <div className="card">
          <h3>SPEAKING PRACTICE</h3>
          <p>Fluid geometric waveform visualization for pronunciation mastery.</p>
        </div>
      </div>
    </div>
  );
}