"use client";

import { useMemo, useRef, useState } from "react";
import ImageOcrInput from "./ImageOcrInput";
import terms from "./generated/terms.json";
import { analyzeText, type Match, type TermRecord } from "./lib/matcher";

const SUBJECTS = ["All", "MATH", "CHEM"] as const;
const records = terms as TermRecord[];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("All");
  const [analysis, setAnalysis] = useState<{ text: string; matches: Match[] } | null>(null);
  const [selected, setSelected] = useState<Match | null>(null);
  const [hasExtractedText, setHasExtractedText] = useState(false);
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const workspaceVersionRef = useRef(0);

  const segments = useMemo(() => {
    if (!analysis) return [];
    const output: Array<{ text: string; match?: Match }> = [];
    let cursor = 0;
    for (const match of analysis.matches) {
      if (match.start > cursor) output.push({ text: analysis.text.slice(cursor, match.start) });
      output.push({ text: analysis.text.slice(match.start, match.end), match });
      cursor = match.end;
    }
    if (cursor < analysis.text.length) output.push({ text: analysis.text.slice(cursor) });
    return output;
  }, [analysis]);

  function handleAnalyze() {
    const matches = analyzeText(question, subject, records);
    setAnalysis({ text: question, matches });
    setSelected(null);
    setHasExtractedText(false);
  }

  function handleOcrText(text: string, sourceVersion: number) {
    if (sourceVersion !== workspaceVersionRef.current) return;
    setQuestion(text);
    setHasExtractedText(true);
  }

  function handleClearAll() {
    workspaceVersionRef.current += 1;
    setWorkspaceVersion(workspaceVersionRef.current);
    setQuestion("");
    setAnalysis(null);
    setSelected(null);
    setHasExtractedText(false);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Exam Semantic Decoder home">
          <span className="brand-mark" aria-hidden="true">ES</span>
          <span>Exam Semantic Decoder</span>
        </a>
        <span className="tagline">Read the question. Activate the concept.</span>
      </header>

      <section className="intro" id="top">
        <p className="eyebrow">EXAM LANGUAGE, DECODED</p>
        <h1>See what the question is really asking.</h1>
        <p className="hero-translation">看懂题目真正想考什么</p>
        <p className="intro-copy">Paste your question. We'll help you see what it’s really asking.</p>
      </section>

      <section className="workspace" aria-label="Question analyzer">
        <div className="reader-panel">
          <div className="controls">
            <label className="subject-control">
              <span>Subject&nbsp;&nbsp;<span className="ui-cn">科目</span></span>
              <select value={subject} onChange={(event) => setSubject(event.target.value as typeof subject)}>
                {SUBJECTS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <div className="workspace-actions">
              <button className="analyze-button" type="button" onClick={handleAnalyze} disabled={!question.trim()}>
                <span>Analyze&nbsp;&nbsp;<span className="ui-cn">开始解码</span></span> <span aria-hidden="true">→</span>
              </button>
              <button className="clear-all-button" type="button" onClick={handleClearAll}>Clear all</button>
            </div>
          </div>

          {!analysis ? (
            <div className="question-field">
              <label htmlFor="question-text">Paste question text</label>
              <textarea id="question-text" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Paste or type an exam question here…" autoFocus />
              <ImageOcrInput key={workspaceVersion} onTextRecognized={(text) => handleOcrText(text, workspaceVersion)} />
              {hasExtractedText && <p className="ocr-success" role="status">Text extracted. Please review before analysis.</p>}
            </div>
          ) : (
            <div className="result-wrap">
              <div className="result-heading">
                <span>Analyzed question</span>
                <button type="button" onClick={() => setAnalysis(null)}>Edit text</button>
              </div>
              {analysis.matches.length ? (
                <div className="analyzed-text">
                  {segments.map((segment, index) => segment.match ? (
                    <button type="button" className={`highlight ${selected === segment.match ? "active" : ""}`} key={`${segment.match.start}-${index}`} onClick={() => setSelected(segment.match!)}>
                      {segment.text}
                    </button>
                  ) : <span key={`text-${index}`}>{segment.text}</span>)}
                </div>
              ) : (
                <div className="no-match">
                  <p>No keywords detected.</p>
                  <span>Your keywords may still be under construction or updating.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="meaning-panel" aria-live="polite">
          <div className="aside-label"><span aria-hidden="true">↳</span> <span>Concept panel&nbsp;&nbsp;<span className="ui-cn">解码面板</span></span></div>
          {selected ? (
            <div className="concept-content">
              <div className="concept-kicker">Matched phrase</div>
              <p className="matched-phrase">“{analysis?.text.slice(selected.start, selected.end)}”</p>
              {selected.records.map((record) => (
                <article className="definition" key={`${record.subject}-${record.term}`}>
                  {selected.records.length > 1 && <span className="subject-badge">{record.subject}</span>}
                  <dl>
                    <div><dt><span>Official</span><span className="ui-cn label-translation">教材译法</span></dt><dd>{record.official}</dd></div>
                    <div className="decoded"><dt><span>Decoded</span><span className="ui-cn label-translation">真正理解</span></dt><dd>{record.decoded}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-concept">
              <span className="selection-icon" aria-hidden="true">Aa</span>
              <h2>{analysis?.matches.length ? "Select a highlighted term" : "Concepts appear here"}</h2>
              <p>{analysis?.matches.length ? "Click any yellow highlight to see its official and decoded meaning." : hasExtractedText ? "Review your text, then analyze." : "After analysis, click a highlighted phrase to activate the concept your teacher has defined."}</p>
            </div>
          )}
        </aside>
      </section>

      <footer>
        <div className="footer-principles">
          <span>Teacher-curated.</span>
          <span>No generated explanations.</span>
        </div>
        <div className="footer-details">
          <p>© 2026 Adam SUN</p>
          <p className="footer-title">Exam Semantic Decoder</p>
          <p>Created by Adam SUN</p>
          <address>
            <span>Contact:</span>
            <span>WeChat: carbon37558</span>
            <a href="mailto:adam51538@hotmail.com">Email: adam51538@hotmail.com</a>
          </address>
        </div>
      </footer>
    </main>
  );
}
