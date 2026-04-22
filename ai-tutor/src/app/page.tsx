import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Master Your Skills with
          <span className={styles.highlight}> AI Tutor</span>
        </h1>
        <p className={styles.subtitle}>
          Your personal AI-powered learning assistant for writing and speaking practice.
          Get instant feedback and improve your skills.
        </p>
        <div className={styles.actions}>
          <Link href="/dashboard" className="btn btn-primary">
            Get Started
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>
      </div>

      <div className={styles.features}>
        <div className="card">
          <h3>AI Chat</h3>
          <p>Interactive conversations with our AI tutor for personalized learning.</p>
        </div>
        <div className="card">
          <h3>Writing Practice</h3>
          <p>Get feedback on your writing and improve your composition skills.</p>
        </div>
        <div className="card">
          <h3>Speaking Practice</h3>
          <p>Practice speaking and get AI-powered feedback on your pronunciation.</p>
        </div>
      </div>
    </div>
  );
}