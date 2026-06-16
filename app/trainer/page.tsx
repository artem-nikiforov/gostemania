"use client";

import { useState, useEffect, useRef } from "react";
import PageHeader from "../components/PageHeader";
import { scenarios, trainerInstructions, type TrainerScenario } from "../data/trainer";

// ─── Типы ────────────────────────────────────────────────────────────────────

type Tab = "self" | "trainer";
type View = "menu" | "instructions" | "playing" | "error" | "won";

interface ChatMessage {
  role: "guest" | "player";
  text: string;
}

interface Session {
  scenarioId: string;
  step: number;
  messages: ChatMessage[];
}

// ─── Session storage ─────────────────────────────────────────────────────────

const SESSION_KEY = "gostemania_trainer_v2";

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(s: Session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Аватар Гостя ────────────────────────────────────────────────────────────

function GuestAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-bk-red/10 border border-bk-red/20 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D62300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

// ─── Пузырёк чата ────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isGuest = message.role === "guest";
  return (
    <div className={`flex gap-2.5 ${isGuest ? "justify-start" : "justify-end"}`}>
      {isGuest && <GuestAvatar />}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isGuest
            ? "bg-bk-cream/80 text-bk-brown rounded-tl-sm"
            : "bg-bk-green text-white rounded-tr-sm"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

// ─── Выбор сценария ──────────────────────────────────────────────────────────

function ScenarioMenu({
  onStart,
  savedSession,
  mode,
}: {
  onStart: (s: TrainerScenario) => void;
  savedSession?: Session | null;
  mode: Tab;
}) {
  const isSelf = mode === "self";
  const resumeScenario = savedSession
    ? scenarios.find((s) => s.id === savedSession.scenarioId)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Баннер продолжения (только в самостоятельном режиме) */}
      {isSelf && savedSession && resumeScenario && savedSession.step > 0 && (
        <div className="bg-bk-orange/10 border border-bk-orange/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-bk-brown text-sm">
              Незавершённый сценарий: «{resumeScenario.title}»
            </p>
            <p className="text-bk-brown/60 text-xs mt-0.5">
              Шаг {savedSession.step + 1} из {resumeScenario.steps.length}
            </p>
          </div>
          <button
            onClick={() => onStart(resumeScenario)}
            className="px-4 py-2 bg-bk-orange text-white rounded-lg text-sm font-medium hover:bg-bk-orange/80 transition-colors"
          >
            Продолжить
          </button>
        </div>
      )}

      <h2 className="font-flame font-bold text-2xl text-bk-brown mb-1">Выбери сценарий</h2>
      <p className="text-bk-brown/60 text-sm mb-6">
        {isSelf
          ? "Практикуй работу с недовольным Гостем. Выбирай правильные ответы и добейся его улыбки."
          : "Выбери сценарий для отработки с сотрудником."}
      </p>

      <div className="grid gap-3 sm:gap-4">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => onStart(s)}
            className="w-full text-left bg-white border-2 border-bk-cream hover:border-bk-green/50 rounded-xl p-4 sm:p-5 transition-all hover:shadow-md group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-flame font-bold text-bk-brown text-lg group-hover:text-bk-green transition-colors">
                  {s.title}
                </h3>
                <p className="text-bk-brown/60 text-sm mt-0.5">{s.description}</p>
                <p className="text-bk-brown/35 text-xs mt-1.5">{s.steps.length} шага · ДОБРО</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bk-green/30 group-hover:text-bk-green transition-colors shrink-0 mt-1">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Экран ошибки ─────────────────────────────────────────────────────────────

function ErrorScreen({
  message,
  mode,
  onRestart,
  onMenu,
}: {
  message: string;
  mode: Tab;
  onRestart: () => void;
  onMenu: () => void;
}) {
  const isTrainer = mode === "trainer";
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className={`rounded-2xl p-5 mb-6 ${isTrainer ? "bg-bk-orange/10 border border-bk-orange/30" : "bg-bk-red/5 border border-bk-red/20"}`}>
        {isTrainer ? (
          <p className="text-xs font-semibold text-bk-orange uppercase tracking-wide mb-2">
            Подсказка тренера
          </p>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <GuestAvatar />
            <p className="text-xs font-semibold text-bk-red">Реакция Гостя</p>
          </div>
        )}
        <p className="text-sm leading-relaxed text-bk-brown">{message}</p>
      </div>

      <p className="text-bk-brown/55 text-sm text-center mb-5">
        {isTrainer
          ? "Проговорите правильный ответ вместе с сотрудником, затем начните сценарий заново."
          : "Вернитесь к началу сценария и попробуйте снова."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-xl bg-bk-green text-white font-semibold hover:bg-bk-green/80 transition-colors"
        >
          🔁 Начать заново
        </button>
        <button
          onClick={onMenu}
          className="flex-1 py-3 rounded-xl bg-white border-2 border-bk-cream text-bk-brown/70 font-semibold hover:bg-bk-cream/50 transition-colors"
        >
          📋 Другой сценарий
        </button>
      </div>
    </div>
  );
}

// ─── Экран победы ─────────────────────────────────────────────────────────────

function WinScreen({
  scenario,
  onRestart,
  onMenu,
}: {
  scenario: TrainerScenario;
  onRestart: () => void;
  onMenu: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-bk-green/10 mx-auto mb-5 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#198737" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="font-flame font-bold text-2xl text-bk-brown mb-3 leading-snug">
        {scenario.winMessage}
      </h2>
      <p className="text-bk-brown/65 text-sm leading-relaxed mb-8">
        Все шаги ДОБРО применены: Доверься → Определи → Без оправданий извинись → Реши → Отметь важность.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-xl bg-bk-green text-white font-semibold hover:bg-bk-green/80 transition-colors"
        >
          🔁 Начать заново
        </button>
        <button
          onClick={onMenu}
          className="flex-1 py-3 rounded-xl bg-white border-2 border-bk-cream text-bk-brown/70 font-semibold hover:bg-bk-cream/50 transition-colors"
        >
          📋 Другой сценарий
        </button>
      </div>
    </div>
  );
}

// ─── Игровой экран ────────────────────────────────────────────────────────────

function GameScreen({
  scenario,
  mode,
  initialStep,
  initialMessages,
  onError,
  onWin,
}: {
  scenario: TrainerScenario;
  mode: Tab;
  initialStep: number;
  initialMessages: ChatMessage[];
  onError: (msg: string) => void;
  onWin: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [locked, setLocked] = useState(false);
  const [correctIdx, setCorrectIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const step = scenario.steps[currentStep];

  useEffect(() => {
    if (initialMessages.length === 0) {
      setMessages([{ role: "guest", text: scenario.steps[0].guestMessage }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode === "self") {
      saveSession({ scenarioId: scenario.id, step: currentStep, messages });
    }
  }, [currentStep, messages, scenario.id, mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChoice = (idx: number) => {
    if (locked) return;
    const choice = step.choices[idx];
    const playerMsg: ChatMessage = { role: "player", text: choice.text };
    const newMessages = [...messages, playerMsg];
    setMessages(newMessages);

    if (choice.isCorrect) {
      setLocked(true);
      setCorrectIdx(idx);
      const isLast = currentStep === scenario.steps.length - 1;

      setTimeout(() => {
        if (isLast) {
          onWin();
        } else {
          const nextMsg: ChatMessage = {
            role: "guest",
            text: scenario.steps[currentStep + 1].guestMessage,
          };
          setMessages((prev) => [...prev, nextMsg]);
          setCurrentStep((s) => s + 1);
          setLocked(false);
          setCorrectIdx(null);
        }
      }, 700);
    } else {
      const errorMsg =
        mode === "trainer"
          ? (choice.trainerHint ?? "Неверный ответ. Проговорите правильный ответ вместе.")
          : (choice.selfError ?? "Это недопустимо! Я напишу плохой отзыв.");
      setTimeout(() => onError(errorMsg), 400);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col" style={{ minHeight: "calc(100vh - 145px)" }}>
      {/* Прогресс */}
      <div className="py-3 flex items-center gap-2">
        <div className="text-xs text-bk-brown/50 font-medium shrink-0 min-w-[60px]">
          {step.stepLabel ?? `Шаг ${currentStep + 1}`}
        </div>
        <div className="flex-1 flex gap-1">
          {scenario.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentStep ? "bg-bk-green" : i === currentStep ? "bg-bk-orange" : "bg-bk-cream"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-bk-brown/40 shrink-0">
          {currentStep + 1}/{scenario.steps.length}
        </span>
      </div>

      {/* Чат */}
      <div className="flex-1 py-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Варианты ответов */}
      {!locked && (
        <div className="py-4 border-t border-bk-cream/60">
          <p className="text-xs text-bk-brown/50 mb-3 font-medium">
            {mode === "trainer"
              ? "Нажми вариант, который выбрал сотрудник:"
              : "Выберите ответ:"}
          </p>
          <div className="space-y-2">
            {step.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-bk-cream hover:border-bk-green/50 bg-white hover:bg-bk-cream/30 transition-all text-sm text-bk-brown leading-snug"
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {locked && (
        <div className="py-4 border-t border-bk-cream/60">
          <div className="flex items-center gap-2 text-bk-green text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Верно! Переходим к следующему шагу…
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Режим «Самостоятельно» ───────────────────────────────────────────────────

function SelfPracticeMode() {
  const [view, setView] = useState<View>("menu");
  const [scenario, setScenario] = useState<TrainerScenario | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedSession, setSavedSession] = useState<Session | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resumeStep, setResumeStep] = useState(0);
  const [resumeMessages, setResumeMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setSavedSession(loadSession());
  }, []);

  const startScenario = (s: TrainerScenario) => {
    const session = loadSession();
    const resume = session && session.scenarioId === s.id && session.step > 0;
    setScenario(s);
    setGameKey((k) => k + 1);
    if (resume && session) {
      setResumeStep(session.step);
      setResumeMessages(session.messages);
    } else {
      clearSession();
      setResumeStep(0);
      setResumeMessages([]);
    }
    setView("playing");
  };

  const handleError = (msg: string) => {
    clearSession();
    setErrorMsg(msg);
    setView("error");
  };

  const handleWin = () => {
    clearSession();
    setView("won");
  };

  const restart = () => {
    if (scenario) {
      clearSession();
      setResumeStep(0);
      setResumeMessages([]);
      setGameKey((k) => k + 1);
      setView("playing");
    }
  };

  const goMenu = () => {
    setView("menu");
    setSavedSession(loadSession());
    setScenario(null);
  };

  if (view === "menu")
    return (
      <ScenarioMenu
        onStart={startScenario}
        savedSession={savedSession}
        mode="self"
      />
    );
  if (view === "error")
    return (
      <ErrorScreen message={errorMsg} mode="self" onRestart={restart} onMenu={goMenu} />
    );
  if (view === "won" && scenario)
    return <WinScreen scenario={scenario} onRestart={restart} onMenu={goMenu} />;
  if (view === "playing" && scenario)
    return (
      <GameScreen
        key={gameKey}
        scenario={scenario}
        mode="self"
        initialStep={resumeStep}
        initialMessages={resumeMessages}
        onError={handleError}
        onWin={handleWin}
      />
    );
  return null;
}

// ─── Режим «С тренером» ──────────────────────────────────────────────────────

function TrainerInstructionsScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-bk-orange/8 border border-bk-orange/20 rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="font-flame font-bold text-xl text-bk-brown mb-4">
          {trainerInstructions.title}
        </h2>
        <ol className="space-y-3 mb-5">
          {trainerInstructions.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-bk-brown/80 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-bk-orange text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span style={{ whiteSpace: "pre-line" }}>{step}</span>
            </li>
          ))}
        </ol>

        <div className="border-t border-bk-orange/20 pt-4 mb-4">
          <p className="text-xs font-semibold text-bk-brown/50 uppercase tracking-wide mb-2">После победы</p>
          <ul className="space-y-1.5">
            {trainerInstructions.afterWin.map((r, i) => (
              <li key={i} className="text-sm text-bk-brown/75 flex gap-2">
                <span className="text-bk-green mt-0.5">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-bk-orange/20 pt-4">
          <p className="text-xs font-semibold text-bk-brown/50 uppercase tracking-wide mb-2">Правила тренера</p>
          <ul className="space-y-1.5">
            {trainerInstructions.rules.map((r, i) => (
              <li key={i} className="text-sm text-bk-brown/75 flex gap-2">
                <span className="text-bk-orange mt-0.5">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-xl bg-bk-orange text-white font-flame font-bold text-lg hover:bg-bk-orange/80 transition-colors"
      >
        Понял, начинаем →
      </button>
    </div>
  );
}

function TrainerModeContent() {
  const [view, setView] = useState<View>("instructions");
  const [scenario, setScenario] = useState<TrainerScenario | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [gameKey, setGameKey] = useState(0);

  const startScenario = (s: TrainerScenario) => {
    setScenario(s);
    setGameKey((k) => k + 1);
    setView("playing");
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setView("error");
  };

  const handleWin = () => setView("won");

  const restart = () => {
    setGameKey((k) => k + 1);
    setView("playing");
  };

  const goMenu = () => {
    setView("menu");
    setScenario(null);
  };

  if (view === "instructions") return <TrainerInstructionsScreen onNext={() => setView("menu")} />;
  if (view === "menu") return <ScenarioMenu onStart={startScenario} mode="trainer" />;
  if (view === "error")
    return <ErrorScreen message={errorMsg} mode="trainer" onRestart={restart} onMenu={goMenu} />;
  if (view === "won" && scenario)
    return <WinScreen scenario={scenario} onRestart={restart} onMenu={goMenu} />;
  if (view === "playing" && scenario)
    return (
      <GameScreen
        key={gameKey}
        scenario={scenario}
        mode="trainer"
        initialStep={0}
        initialMessages={[]}
        onError={handleError}
        onWin={handleWin}
      />
    );
  return null;
}

// ─── Главная страница ─────────────────────────────────────────────────────────

export default function TrainerPage() {
  const [tab, setTab] = useState<Tab>("self");

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        backHref="/"
        title="Чат-тренажёр"
        subtitle="Отработка сценариев работы с Гостем"
        accent="green"
      />

      {/* Вкладки */}
      <div className="border-b border-bk-cream bg-white sticky top-[88px] z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex">
          <button
            onClick={() => setTab("self")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === "self"
                ? "border-bk-green text-bk-green"
                : "border-transparent text-bk-brown/50 hover:text-bk-brown/70"
            }`}
          >
            Самостоятельно
          </button>
          <button
            onClick={() => setTab("trainer")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === "trainer"
                ? "border-bk-orange text-bk-orange"
                : "border-transparent text-bk-brown/50 hover:text-bk-brown/70"
            }`}
          >
            С тренером
          </button>
        </div>
      </div>

      {tab === "self" && <SelfPracticeMode />}
      {tab === "trainer" && <TrainerModeContent />}
    </div>
  );
}
