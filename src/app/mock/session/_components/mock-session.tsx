"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { saveMockSession, saveTopicMastery } from "@/lib/actions/user-tracking";
import type { MockQuestion } from "@/lib/mock-shared";
import { buildQuestionResults, computeMockScore } from "@/lib/mock-scoring";
import type { Language } from "@/lib/supabase/types";
import { i18nCommon, i18nMockSession } from "@/lib/i18n";

import { EndScreen } from "./end-screen";
import { ProgressBar } from "./progress-bar";
import { QuestionView } from "./question-view";

export function MockSession({
  questions,
  topicLabels = {},
  lang = "en",
}: {
  questions: MockQuestion[];
  topicLabels?: Record<string, string>;
  lang?: Language;
}) {
  const i18n = i18nMockSession[lang];
  const common = i18nCommon[lang];

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<(string | null)[]>(() =>
    questions.map(() => null),
  );
  const [finished, setFinished] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const saveCalledRef = useRef(false);

  const total = questions.length;
  const current = questions[index];

  const score = useMemo(
    () => (finished ? computeMockScore(questions, selected) : 0),
    [finished, questions, selected],
  );

  useEffect(() => {
    if (!finished || saveCalledRef.current) return;
    saveCalledRef.current = true;

    const questionResults = buildQuestionResults(questions, selected);
    const topics = [...new Set(questions.map((q) => q.topic))];

    void Promise.all([
      saveMockSession({
        score,
        total,
        topics,
        questionResults: questionResults.map(({ questionId, correct }) => ({
          questionId,
          correct,
        })),
      }),
      saveTopicMastery(
        "mock",
        questionResults.map((r) => ({
          questionId: r.questionId,
          topic: r.topic,
          mastered: r.correct,
        })),
      ),
    ]).catch(() => setSaveError(true));
  }, [finished, questions, score, selected, total]);

  if (!current) return null;

  if (finished) {
    return (
      <EndScreen
        questions={questions}
        selected={selected}
        score={score}
        total={total}
        lang={lang}
        topicLabels={topicLabels}
        saveError={saveError}
      />
    );
  }

  function handleSelect(optionId: string) {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = optionId;
      return next;
    });
  }

  function handleNext() {
    if (index === total - 1) setFinished(true);
    else setIndex((i) => i + 1);
  }

  return (
    <div className="space-y-5">
      <ProgressBar current={index + 1} total={total} quitLabel={common.quit} questionLabel={i18n.questionOf(index + 1, total)} />
      <QuestionView
        question={current}
        selectedId={selected[index] ?? null}
        isLast={index === total - 1}
        lang={lang}
        topicLabels={topicLabels}
        i18n={{
          correct: i18n.correct,
          notQuite: i18n.notQuite,
          correctAnswer: i18n.correctAnswer,
          next: i18n.next,
          finish: i18n.finish,
        }}
        onSelect={handleSelect}
        onNext={handleNext}
      />
    </div>
  );
}
