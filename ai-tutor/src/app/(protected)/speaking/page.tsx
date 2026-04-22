import styles from "./page.module.css";

export default function Speaking() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Speaking Practice</h1>
          <p className={styles.subtitle}>Practice pronunciation and speaking skills with AI</p>
        </div>

        <div className={styles.content}>
          <div className={styles.prompt}>
            <h3>Speaking Prompt</h3>
            <p>Describe your favorite travel destination and why you would recommend it to others.</p>
          </div>

          <div className={styles.recorder}>
            <div className={styles.recordButton}>
              <button className={styles.micButton}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              <p>Click to start recording</p>
            </div>
          </div>

          <div className={styles.feedback}>
            <h3>Analysis</h3>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span>Pronunciation</span>
                <strong>85%</strong>
              </div>
              <div className={styles.metric}>
                <span>Fluency</span>
                <strong>78%</strong>
              </div>
              <div className={styles.metric}>
                <span>Grammar</span>
                <strong>82%</strong>
              </div>
              <div className={styles.metric}>
                <span>Vocabulary</span>
                <strong>90%</strong>
              </div>
            </div>
            <div className={styles.suggestions}>
              <h4>Tips for Improvement</h4>
              <ul>
                <li>Work on linking words more smoothly</li>
                <li>Try to reduce pauses between sentences</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn btn-secondary">Try Again</button>
          <button className="btn btn-primary">Next Prompt</button>
        </div>
      </div>
    </div>
  );
}