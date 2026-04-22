"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import styles from "./page.module.css";

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
  const [feedback, setFeedback] = useState("");
  const [streamingFeedback, setStreamingFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const feedbackEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedbackEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamingFeedback, feedback]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!essay.trim() || loading) return;

    const finalTopic = topic === "Custom topic..." ? customTopic : topic;
    setFeedback("");
    setStreamingFeedback("");
    setScore(null);
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

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullFeedback = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullFeedback += parsed.content;
              setStreamingFeedback(fullFeedback);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      // Extract score from feedback
      const scoreMatch = fullFeedback.match(/(\d{1,3})\s*\/\s*100/i);
      if (scoreMatch) {
        setScore(parseInt(scoreMatch[1]));
      }

      setFeedback(fullFeedback);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setFeedback(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setStreamingFeedback("");
    }
  };

  const handleClear = () => {
    setEssay("");
    setFeedback("");
    setScore(null);
    setStreamingFeedback("");
  };

  

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Writing Practice</h1>
          <p className={styles.subtitle}>
            Write an essay and get AI-powered feedback
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
                  <option key={t} value={t}>
                    {t}
                  </option>
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
              placeholder="Start writing your essay here..."
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
            {loading ? (
              <div className={styles.loadingFeedback}>
                <span className={styles.spinner}></span>
                <span>Analyzing your essay...</span>
              </div>
            ) : feedback ? (
              <>
                <div className={styles.feedbackContent}>
                  {feedback.split("\n").map((line, i) => {
                    if (line.match(/^\d{1,3}\s*\/\s*100/i)) {
                      return null;
                    }
                    return (
                      <p key={i} className={line.startsWith("- ") || line.match(/^[\d•]/) ? styles.listItem : ""}>
                        {line}
                      </p>
                    );
                  })}
                </div>
                {score !== null && (
                  <div className={styles.score}>
                    <span>Overall Score</span>
                    <strong>{score}/100</strong>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyFeedback}>
                <p>Submit your essay to receive AI feedback.</p>
                <ul>
                  <li>Grammar and punctuation review</li>
                  <li>Vocabulary suggestions</li>
                  <li>Structure and flow improvements</li>
                  <li>Overall score</li>
                </ul>
              </div>
            )}
            {streamingFeedback && (
              <div className={styles.feedbackContent}>
                {streamingFeedback}
                <span className={styles.cursor}>▊</span>
              </div>
            )}
            <div ref={feedbackEndRef} />
          </div>
        </form>
      </div>
    </div>
  );
}