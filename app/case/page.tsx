"use client";

import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { caseData, type GuestReview } from "../data/case";

// ─── Типы состояния ──────────────────────────────────────────────────────────

type CaseStep =
  | "intro"       // вводный текст
  | "dec-table"   // таблица декабрьских отзывов
  | "questions"   // вопросы (по одному)
  | "checklist"   // чек-лист для ТУ
  | "result";     // итоговый результат

interface SessionState {
  step: CaseStep;
  questionIndex: number; // текущий вопрос в "questions"
  showHint: boolean;     // показана ли подсказка текущего вопроса
  checklist: Record<string, boolean>;
}

const SESSION_KEY = "gostemania_case";

function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionState) : null;
  } catch {
    return null;
  }
}

function saveSession(state: SessionState) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

const defaultState: SessionState = {
  step: "intro",
  questionIndex: 0,
  showHint: false,
  checklist: Object.fromEntries(caseData.checklist.map((item) => [item.id, false])),
};

// ─── Компонент таблицы отзывов ───────────────────────────────────────────────

function ReviewsTable({ reviews }: { reviews: GuestReview[] }) {
  const stars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < n ? "text-bk-yellow" : "text-bk-cream"}>★</span>
    ));

  const Tag = ({ active, label }: { active: boolean; label: string }) =>
    active ? (
      <span className="inline-block text-[10px] bg-bk-orange/10 text-bk-orange border border-bk-orange/20 rounded px-1.5 py-0.5 mr-1 mb-1">
        {label}
      </span>
    ) : null;

  return (
    <div className="overflow-x-auto rounded-xl border border-bk-cream">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bk-cream/60 text-bk-brown/70 text-xs font-semibold uppercase tracking-wide">
            <th className="text-left px-3 py-3 whitespace-nowrap">Дата</th>
            <th className="text-left px-3 py-3">Оценка</th>
            <th className="text-left px-3 py-3">Текст отзыва</th>
            <th className="text-left px-3 py-3 hidden sm:table-cell">Темы</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review, i) => (
            <tr key={i} className={`border-t border-bk-cream/70 ${i % 2 === 0 ? "bg-white" : "bg-bk-cream/20"}`}>
              <td className="px-3 py-3 text-bk-brown/60 whitespace-nowrap font-mono text-xs">{review.date}</td>
              <td className="px-3 py-3 whitespace-nowrap text-base leading-none">{stars(review.rating)}</td>
              <td className="px-3 py-3 text-bk-brown leading-snug">
                {review.text}
                <div className="sm:hidden mt-1.5">
                  <Tag active={review.tags.taste} label="Вкус блюда" />
                  <Tag active={review.tags.speed} label="Скорость" />
                  <Tag active={review.tags.atmosphere} label="Обстановка" />
                  <Tag active={review.tags.staff} label="Персонал" />
                </div>
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Tag active={review.tags.taste} label="Вкус блюда" />
                <Tag active={review.tags.speed} label="Скорость" />
                <Tag active={review.tags.atmosphere} label="Обстановка и чистота" />
                <Tag active={review.tags.staff} label="Общение персонала" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Рендер markdown-подобного текста (простой) ──────────────────────────────

function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm text-bk-brown leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-bold text-bk-brown">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith("| ")) {
          return null; // таблица — обрабатывается отдельно
        }
        if (line.startsWith("*(")) {
          return <p key={i} className="text-bk-brown/50 italic text-xs">{line.slice(1, -1)}</p>;
        }
        if (line.match(/^\d+\./)) {
          return <p key={i} className="ml-3">{line}</p>;
        }
        return line ? <p key={i}>{line}</p> : <div key={i} className="h-1" />;
      })}
    </div>
  );
}

// ─── Шаг «Введение» ─────────────────────────────────────────────────────────

function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-bk-cream/40 border border-bk-cream rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-bk-brown/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#502314" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-bk-brown/60 uppercase tracking-wide">Территориальный управляющий</span>
        </div>
        <p className="text-bk-brown leading-relaxed text-base">{caseData.intro}</p>
      </div>

      <div className="text-center">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3 bg-bk-yellow text-bk-brown font-bold rounded-xl hover:bg-bk-yellow/80 transition-colors"
        >
          Начать
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Шаг «Таблица декабрьских отзывов» ──────────────────────────────────────

function DecTableStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="font-flame font-bold text-xl text-bk-brown mb-1">{caseData.tableTitle}</h2>
        <p className="text-bk-brown/60 text-sm">Изучи отзывы. Обрати внимание на оценки и темы.</p>
      </div>
      <ReviewsTable reviews={caseData.decemberReviews} />
      <div className="mt-8 text-center">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3 bg-bk-yellow text-bk-brown font-bold rounded-xl hover:bg-bk-yellow/80 transition-colors"
        >
          Далее
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Шаг «Вопросы» ──────────────────────────────────────────────────────────

function QuestionsStep({
  questionIndex,
  showHint,
  onToggleHint,
  onNext,
}: {
  questionIndex: number;
  showHint: boolean;
  onToggleHint: () => void;
  onNext: () => void;
}) {
  const question = caseData.questions[questionIndex];
  const isLast = questionIndex === caseData.questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Прогресс */}
      <div className="flex items-center gap-1.5 mb-6">
        {caseData.questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < questionIndex ? "bg-bk-yellow" : i === questionIndex ? "bg-bk-yellow" : "bg-bk-cream"
            }`}
          />
        ))}
        <span className="text-xs text-bk-brown/50 shrink-0 font-mono">{questionIndex + 1}/{caseData.questions.length}</span>
      </div>

      {/* Реплика ТУ */}
      <div className="bg-bk-cream/50 border border-bk-cream rounded-2xl p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-bk-brown/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#502314" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-bk-brown/60 uppercase tracking-wide">ТУ говорит директору:</span>
        </div>
        <p className="text-bk-brown leading-relaxed">{question.facilitatorText}</p>
      </div>

      {/* Дополнительный контент после нажатия «Далее» на предыдущем вопросе */}
      {question.afterHintText === "actionPlan" && (
        <div className="bg-white border border-bk-cream rounded-xl p-4 mb-5">
          <SimpleMarkdown text={caseData.actionPlanJanuary} />
        </div>
      )}
      {question.afterHintText === "januaryReviews" && (
        <div className="mb-5">
          <p className="font-semibold text-bk-brown mb-3 text-sm">Отзывы гостей — Январь</p>
          <ReviewsTable reviews={caseData.januaryReviews} />
        </div>
      )}
      {question.afterHintText === "dobroReport" && (
        <div className="bg-white border border-bk-cream rounded-xl p-4 mb-5 overflow-x-auto">
          <SimpleMarkdown text={caseData.dobroReport} />
          <table className="w-full text-xs mt-2">
            <thead>
              <tr className="bg-bk-cream/60 text-bk-brown/70 text-xs">
                <th className="text-left px-2 py-2">Период</th>
                <th className="text-left px-2 py-2">Жалоб на температуру</th>
                <th className="text-left px-2 py-2">Выдано комплементов</th>
                <th className="text-left px-2 py-2">% использования</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-bk-cream">
                <td className="px-2 py-2">Декабрь</td>
                <td className="px-2 py-2">7</td>
                <td className="px-2 py-2">1</td>
                <td className="px-2 py-2 text-bk-red font-semibold">14%</td>
              </tr>
              <tr className="border-t border-bk-cream bg-bk-cream/20">
                <td className="px-2 py-2">Январь</td>
                <td className="px-2 py-2">4</td>
                <td className="px-2 py-2">0</td>
                <td className="px-2 py-2 text-bk-red font-semibold">0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Подсказка */}
      <div className="mb-6">
        <button
          onClick={onToggleHint}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
            showHint
              ? "border-bk-yellow bg-bk-yellow/10"
              : "border-bk-cream hover:border-bk-yellow/40"
          }`}
        >
          <span className="text-sm font-medium text-bk-brown">
            {showHint ? "Скрыть подсказку" : "Показать подсказку (правильный ответ директора)"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-bk-yellow transition-transform ${showHint ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {showHint && (
          <div className="mt-2 px-4 py-3 bg-bk-yellow/10 border border-bk-yellow/30 rounded-xl">
            <p className="text-xs text-bk-brown/60 font-semibold uppercase tracking-wide mb-1">Правильный ответ директора:</p>
            <p className="text-bk-brown text-sm italic leading-relaxed">{question.hint}</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3 bg-bk-yellow text-bk-brown font-bold rounded-xl hover:bg-bk-yellow/80 transition-colors"
        >
          {isLast ? "Перейти к чек-листу" : "Далее"}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Шаг «Чек-лист» ─────────────────────────────────────────────────────────

function ChecklistStep({
  checklist,
  onToggle,
  onFinish,
}: {
  checklist: Record<string, boolean>;
  onToggle: (id: string) => void;
  onFinish: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="font-flame font-bold text-xl text-bk-brown mb-2">Чек-лист ТУ</h2>
      <p className="text-bk-brown/60 text-sm mb-6 leading-relaxed">
        Отметьте, что директор выполнил в ходе разбора кейса.
      </p>

      <div className="space-y-3 mb-8">
        {caseData.checklist.map((item) => (
          <label
            key={item.id}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              checklist[item.id]
                ? "border-bk-green/50 bg-bk-green/5"
                : "border-bk-cream hover:border-bk-green/20"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                checklist[item.id] ? "bg-bk-green border-bk-green" : "border-bk-cream/80"
              }`}
              onClick={() => onToggle(item.id)}
            >
              {checklist[item.id] && (
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              className={`text-sm leading-snug ${checklist[item.id] ? "text-bk-brown" : "text-bk-brown/70"}`}
              onClick={() => onToggle(item.id)}
            >
              {item.text}
            </span>
          </label>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onFinish}
          className="inline-flex items-center gap-2 px-8 py-3 bg-bk-brown text-white font-bold rounded-xl hover:bg-bk-brown/80 transition-colors"
        >
          Завершить и посмотреть результат
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Шаг «Результат» ─────────────────────────────────────────────────────────

function ResultStep({
  checklist,
  onRestart,
}: {
  checklist: Record<string, boolean>;
  onRestart: () => void;
}) {
  const total = caseData.checklist.length;
  const done = Object.values(checklist).filter(Boolean).length;
  const percent = Math.round((done / total) * 100);

  const comment = () => {
    if (percent === 100) return "Отличная работа! Директор полностью разобрался в ситуации и предложил конкретный план. Так держать!";
    if (percent >= 67) return "Хороший результат! Большинство ключевых моментов учтено. Обрати внимание на пропущенные пункты в следующий раз.";
    if (percent >= 34) return "Есть над чем поработать. Несколько важных аспектов были упущены. Рекомендуем повторить кейс.";
    return "Нужно серьёзно проработать кейс. Попробуй снова, обращая особое внимание на каждый вопрос.";
  };

  const color = percent === 100 ? "text-bk-green" : percent >= 67 ? "text-bk-orange" : "text-bk-red";
  const ring = percent === 100 ? "bg-bk-green/10" : percent >= 67 ? "bg-bk-orange/10" : "bg-bk-red/10";

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 text-center">
      <div className={`w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center ${ring}`}>
        <span className={`font-flame font-bold text-4xl ${color}`}>{percent}%</span>
      </div>
      <h2 className="font-flame font-bold text-2xl text-bk-brown mb-3">
        Выполнено {done} из {total} пунктов
      </h2>
      <p className="text-bk-brown/65 text-base leading-relaxed mb-6">{comment()}</p>

      {/* Итоговый список */}
      <div className="text-left space-y-2 mb-8">
        {caseData.checklist.map((item) => (
          <div key={item.id} className="flex items-start gap-2.5">
            <span className={`text-base shrink-0 mt-0.5 ${checklist[item.id] ? "text-bk-green" : "text-bk-red/60"}`}>
              {checklist[item.id] ? "✓" : "✗"}
            </span>
            <span className={`text-sm leading-snug ${checklist[item.id] ? "text-bk-brown" : "text-bk-brown/50"}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="px-8 py-3 bg-bk-yellow text-bk-brown font-bold rounded-xl hover:bg-bk-yellow/80 transition-colors"
      >
        Начать заново
      </button>
    </div>
  );
}

// ─── Главный компонент страницы ──────────────────────────────────────────────

export default function CasePage() {
  const [state, setState] = useState<SessionState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedState, setSavedState] = useState<SessionState | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s && s.step !== "intro") {
      setSavedState(s);
      setShowResumePrompt(true);
    }
    setIsLoaded(true);
  }, []);

  const updateState = (patch: Partial<SessionState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveSession(next);
      return next;
    });
  };

  const handleResume = () => {
    if (savedState) {
      setState(savedState);
    }
    setShowResumePrompt(false);
  };

  const handleRestart = () => {
    clearSession();
    setState(defaultState);
    setShowResumePrompt(false);
  };

  if (!isLoaded) return null;

  // Диалог «Продолжить / Начать заново»
  if (showResumePrompt) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader backHref="/" title="Кейс с ТУ" subtitle="Индекс Гостемании" accent="yellow" />
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-bk-yellow/20 mx-auto mb-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFAA00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="font-flame font-bold text-2xl text-bk-brown mb-3">Есть незавершённый кейс</h2>
          <p className="text-bk-brown/60 mb-8">Хотите продолжить с того места, где остановились?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleResume}
              className="px-8 py-3 bg-bk-yellow text-bk-brown font-bold rounded-xl hover:bg-bk-yellow/80 transition-colors"
            >
              Продолжить
            </button>
            <button
              onClick={handleRestart}
              className="px-8 py-3 border-2 border-bk-cream text-bk-brown/70 font-medium rounded-xl hover:bg-bk-cream/50 transition-colors"
            >
              Начать заново
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader backHref="/" title="Кейс с ТУ" subtitle="Индекс Гостемании" accent="yellow" />

      {state.step === "intro" && (
        <IntroStep onNext={() => updateState({ step: "dec-table" })} />
      )}

      {state.step === "dec-table" && (
        <DecTableStep onNext={() => updateState({ step: "questions", questionIndex: 0, showHint: false })} />
      )}

      {state.step === "questions" && (
        <QuestionsStep
          questionIndex={state.questionIndex}
          showHint={state.showHint}
          onToggleHint={() => updateState({ showHint: !state.showHint })}
          onNext={() => {
            const isLast = state.questionIndex === caseData.questions.length - 1;
            if (isLast) {
              updateState({ step: "checklist", showHint: false });
            } else {
              updateState({ questionIndex: state.questionIndex + 1, showHint: false });
            }
          }}
        />
      )}

      {state.step === "checklist" && (
        <ChecklistStep
          checklist={state.checklist}
          onToggle={(id) =>
            updateState({ checklist: { ...state.checklist, [id]: !state.checklist[id] } })
          }
          onFinish={() => updateState({ step: "result" })}
        />
      )}

      {state.step === "result" && (
        <ResultStep
          checklist={state.checklist}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
