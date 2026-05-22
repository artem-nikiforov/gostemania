"use client";

import { useState, useEffect, useRef } from "react";
import PageHeader from "../components/PageHeader";
import { scenarios, activeScenarioId, type TrainerScenario } from "../data/trainer";

// ─── Типы состояния ──────────────────────────────────────────────────────────

type GameStatus = "menu" | "playing" | "won" | "lost";

interface ChatMessage {
  role: "guest" | "player";
  text: string;
}

interface SessionState {
  scenarioId: string;
  status: GameStatus;
  currentStep: number;
  messages: ChatMessage[];
}

const SESSION_KEY = "gostemania_trainer";

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

// ─── Аватар ─────────────────────────────────────────────────────────────────

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
            : "bg-bk-orange text-white rounded-tr-sm"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

// ─── Экран выбора сценария ───────────────────────────────────────────────────

function ScenarioMenu({
  onStart,
  savedState,
}: {
  onStart: (scenarioId: string, resume: boolean) => void;
  savedState: SessionState | null;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Баннер продолжения */}
      {savedState && savedState.status === "playing" && (
        <div className="bg-bk-orange/10 border border-bk-orange/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-bk-brown text-sm">У вас есть незавершённая игра</p>
            <p className="text-bk-brown/60 text-xs mt-0.5">
              Шаг {savedState.currentStep + 1} из{" "}
              {scenarios.find((s) => s.id === savedState.scenarioId)?.steps.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onStart(savedState.scenarioId, true)}
              className="px-4 py-2 bg-bk-orange text-white rounded-lg text-sm font-medium hover:bg-bk-orange/80 transition-colors"
            >
              Продолжить
            </button>
            <button
              onClick={() => { clearSession(); onStart(savedState.scenarioId, false); }}
              className="px-4 py-2 bg-white border border-bk-cream text-bk-brown/70 rounded-lg text-sm font-medium hover:bg-bk-cream/50 transition-colors"
            >
              Начать заново
            </button>
          </div>
        </div>
      )}

      <h2 className="font-flame font-bold text-2xl text-bk-brown mb-2">Выбери сценарий</h2>
      <p className="text-bk-brown/60 text-sm mb-6">
        Практикуй работу с недовольным Гостем. Выбирай правильные ответы и добейся его улыбки.
      </p>

      <div className="grid gap-4">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onStart(scenario.id, false)}
            className="w-full text-left bg-white border-2 border-bk-cream hover:border-bk-green/40 rounded-xl p-5 transition-all hover:shadow-md group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-flame font-bold text-bk-brown text-lg group-hover:text-bk-green transition-colors">
                  {scenario.title}
                </h3>
                <p className="text-bk-brown/60 text-sm mt-1">{scenario.description}</p>
                <p className="text-bk-brown/40 text-xs mt-2">{scenario.steps.length} шага</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bk-green/40 group-hover:text-bk-green transition-colors shrink-0 mt-1">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Экран результата ────────────────────────────────────────────────────────

function ResultScreen({
  status,
  scenario,
  onRestart,
}: {
  status: "won" | "lost";
  scenario: TrainerScenario;
  onRestart: () => void;
}) {
  const isWin = status === "won";
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      <div
        className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
          isWin ? "bg-bk-green/10" : "bg-bk-red/10"
        }`}
      >
        {isWin ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#198737" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D62300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>
      <h2 className="font-flame font-bold text-2xl text-bk-brown mb-3">
        {isWin ? scenario.winMessage : scenario.loseMessage}
      </h2>
      <p className="text-bk-brown/65 text-base leading-relaxed mb-8">
        {isWin ? scenario.winSubtitle : scenario.loseSubtitle}
      </p>
      <button
        onClick={onRestart}
        className={`px-8 py-3 rounded-xl text-white font-semibold transition-colors ${
          isWin ? "bg-bk-green hover:bg-bk-green/80" : "bg-bk-orange hover:bg-bk-orange/80"
        }`}
      >
        Начать заново
      </button>
    </div>
  );
}

// ─── Игровой экран ───────────────────────────────────────────────────────────

function GameScreen({
  scenario,
  initialStep,
  initialMessages,
  onComplete,
}: {
  scenario: TrainerScenario;
  initialStep: number;
  initialMessages: ChatMessage[];
  onComplete: (status: "won" | "lost", messages: ChatMessage[]) => void;
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const step = scenario.steps[currentStep];

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, feedbackVisible]);

  // Инициализация: добавляем первое сообщение гостя, если чат пустой
  useEffect(() => {
    if (initialMessages.length === 0) {
      setMessages([{ role: "guest", text: scenario.steps[0].guestMessage }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Сохраняем прогресс в sessionStorage
  useEffect(() => {
    saveSession({
      scenarioId: scenario.id,
      status: "playing",
      currentStep,
      messages,
    });
  }, [currentStep, messages, scenario.id]);

  const handleChoice = (choiceIndex: number) => {
    if (feedbackVisible) return;
    const choice = step.choices[choiceIndex];

    // Добавляем реплику игрока
    const playerMsg: ChatMessage = { role: "player", text: choice.text };
    const newMessages = [...messages, playerMsg];
    setMessages(newMessages);

    if (!choice.isCorrect) {
      // Проигрыш
      const loseMsg: ChatMessage = {
        role: "guest",
        text: "Это недопустимо! Я напишу плохой отзыв о вашем ресторане.",
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, loseMsg]);
        setTimeout(() => onComplete("lost", [...newMessages, loseMsg]), 1200);
      }, 600);
      return;
    }

    // Правильный ответ — показываем фидбэк
    setPendingFeedback(step.correctFeedback);
    setFeedbackVisible(true);

    // Добавляем следующую реплику гостя (или завершаем)
    const isLast = currentStep === scenario.steps.length - 1;
    if (step.isComplimentStep) {
      // Финальная победа
      const winMsg: ChatMessage = {
        role: "guest",
        text: "Знаете, вы действительно умеете работать с людьми. Спасибо, что не отмахнулись. Вернусь сюда снова!",
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, winMsg]);
        setTimeout(() => onComplete("won", [...newMessages, winMsg]), 1200);
      }, 600);
    } else if (!isLast) {
      const nextGuestMsg: ChatMessage = {
        role: "guest",
        text: scenario.steps[currentStep + 1].guestMessage,
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, nextGuestMsg]);
        setFeedbackVisible(false);
        setCurrentStep((s) => s + 1);
      }, 1200);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Прогресс */}
      <div className="py-3 flex items-center gap-2">
        {scenario.steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentStep
                ? "bg-bk-green"
                : i === currentStep
                ? "bg-bk-orange"
                : "bg-bk-cream"
            }`}
          />
        ))}
        <span className="text-xs text-bk-brown/50 shrink-0">
          {currentStep + 1}/{scenario.steps.length}
        </span>
      </div>

      {/* Чат */}
      <div className="flex-1 py-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}

        {/* Подсказка-фидбэк */}
        {feedbackVisible && (
          <div className="bg-bk-green/10 border border-bk-green/30 rounded-xl px-4 py-3 flex gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#198737" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-bk-green text-sm">{pendingFeedback}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Варианты ответов */}
      {!feedbackVisible && (
        <div className="py-4 border-t border-bk-cream/60">
          <p className="text-xs text-bk-brown/50 mb-3 font-medium">Выберите ответ:</p>
          <div className="space-y-2">
            {step.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-bk-cream hover:border-bk-orange/50 bg-white hover:bg-bk-cream/30 transition-all text-sm text-bk-brown leading-snug"
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Главный компонент страницы ──────────────────────────────────────────────

export default function TrainerPage() {
  const [view, setView] = useState<"menu" | "game" | "result">("menu");
  const [activeScenario, setActiveScenario] = useState<TrainerScenario | null>(null);
  const [gameStatus, setGameStatus] = useState<"won" | "lost" | null>(null);
  const [resumeStep, setResumeStep] = useState(0);
  const [resumeMessages, setResumeMessages] = useState<ChatMessage[]>([]);
  const [savedState, setSavedState] = useState<SessionState | null>(null);

  useEffect(() => {
    const s = loadSession();
    setSavedState(s);
  }, []);

  const handleStart = (scenarioId: string, resume: boolean) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setActiveScenario(scenario);

    if (resume && savedState) {
      setResumeStep(savedState.currentStep);
      setResumeMessages(savedState.messages);
    } else {
      clearSession();
      setResumeStep(0);
      setResumeMessages([]);
    }
    setView("game");
  };

  const handleComplete = (status: "won" | "lost") => {
    setGameStatus(status);
    clearSession();
    setView("result");
  };

  const handleRestart = () => {
    setView("menu");
    setActiveScenario(null);
    setGameStatus(null);
    const s = loadSession();
    setSavedState(s);
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        backHref="/"
        title="Чат-тренажёр"
        subtitle="Отработка сценариев работы с Гостем"
        accent="green"
      />

      {view === "menu" && (
        <ScenarioMenu onStart={handleStart} savedState={savedState} />
      )}

      {view === "game" && activeScenario && (
        <GameScreen
          key={`${activeScenario.id}-${resumeStep}`}
          scenario={activeScenario}
          initialStep={resumeStep}
          initialMessages={resumeMessages}
          onComplete={handleComplete}
        />
      )}

      {view === "result" && activeScenario && gameStatus && (
        <ResultScreen
          status={gameStatus}
          scenario={activeScenario}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
