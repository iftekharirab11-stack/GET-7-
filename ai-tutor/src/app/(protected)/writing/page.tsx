"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./page.module.css";

interface WritingFeedback {
  score: number;
  grammar_feedback: string;
  vocabulary_feedback: string;
  improved_version: string;
}

const TOPICS = [
  "Describe your favorite place",
  "The most memorable day of my life",
  "Why learn a new language",
  "My dream career",
  "A book that changed my perspective",
  "Custom topic...",
];

export default function Writing() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [essay, setEssay] = useState("");
  const [result, setResult] = useState<WritingFeedback | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const saveProgress = async (finalResult: WritingFeedback) => {
    if (!userId) {
      console.log("User not logged in, skipping progress save");
      return;
    }

    const combinedFeedback = `Grammar: ${finalResult.grammar_feedback} | Vocabulary: ${finalResult.vocabulary_feedback}`;

    const { error } = await supabase.from('progress').insert({
      user_id: userId,
      activity_type: 'writing',
      score: finalResult.score,
      feedback: combinedFeedback,
      metadata: {
        topic: topic === "Custom topic..." ? customTopic : topic,
        improved_version: finalResult.improved_version
      }
    });

    if (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!essay.trim() || loading) return;

    const finalTopic = topic === "Custom topic..." ? customTopic : topic;
    setResult(null);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, topic: finalTopic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      await saveProgress(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEssay("");
    setResult(null);
    setError("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>IELTS Writing Practice</h1>
          <p className={styles.subtitle}>
            Write an essay and get AI-powered IELTS feedback
          </p>
        </div>

        <form className={styles.content} onSubmit={handleSubmit}>
          <div className={styles.editor}>
            <div className={styles.editorHeader}>
              <label htmlFor="topic">Essay Topic:</label>
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={styles.topicSelect}
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {topic === "Custom topic..." && (
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Enter your topic..."
                  className={styles.customTopicInput}
                />
              )}
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Write your essay here (250+ words for best results)..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              disabled={loading}
            />

            <div className={styles.actions}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !essay.trim()}
              >
                {loading ? "Analyzing..." : "Submit for Review"}
              </button>
            </div>
          </div>

          <div className={styles.feedback}>
            <h3>AI Feedback</h3>
            {loading && (
              <div className={styles.loadingFeedback}>
                <span className={styles.spinner}></span>
                <span>Analyzing your essay...</span>
              </div>
            )}
            {error && (
              <div className={styles.errorFeedback}>
                <p>Error: {error}</p>
              </div>
            )}
            {result && (
              <>
                <div className={styles.score}>
                  <span>IELTS Band Score</span>
                  <strong>{result.score}</strong>
                </div>
                <div className={styles.feedbackSection}>
                  <h4>Grammar & Mechanics</h4>
                  <p>{result.grammar_feedback}</p>
                </div>
                <div className={styles.feedbackSection}>
                  <h4>Vocabulary</h4>
                  <p>{result.vocabulary_feedback}</p>
                </div>
                <div className={styles.feedbackSection}>
                  <h4>Improved Version</h4>
                  <pre className={styles.improvedText}>{result.improved_version}</pre>
                </div>
              </>
            )}
            {!result && !loading && !error && (
              <div className={styles.emptyFeedback}>
                <p>Submit your essay to receive IELTS feedback.</p>
                <ul>
                  <li>IELTS Band Score (0-9)</li>
                  <li>Grammar feedback</li>
                  <li>Vocabulary suggestions</li>
                  <li>Improved version</li>
                </ul>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}