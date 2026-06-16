"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import PageHeader from "../components/PageHeader";
import {
  gameCases,
  type GameCase,
  type CaseDoc,
  type ReviewRow,
} from "../data/case";

// Примерное время прохождения (для «бирки» на стартовой плашке)
const ESTIMATED_TIME = "≈ 10 минут";

// Инструкция для ТУ (показывается в начале каждого кейса)
const INSTRUCTION_STEPS = [
  "Показываешь ДР кейс.",
  "Задаёшь вопросы ДР из кнопки «Задай вопрос».",
  "Если ДР отвечает правильно — идёшь дальше. Если нет — направляешь директора на верный ответ. Для тебя будет «Подсказка» — верный вариант ответа.",
  "В конце проходишь по «Чек-листу для ТУ» и отмечаешь выполненные пункты.",
];

// ─── Типы слайдов ─────────────────────────────────────────────────────────────

type Slide =
  | { type: "instruction" }
  | { type: "materials" }
  | { type: "question"; qIdx: number }
  | { type: "summary" }
  | { type: "result" };

function computeSlides(gc: GameCase): Slide[] {
  const totalQuestions =
    gc.preQuestions.length + (gc.midQuestions?.length ?? 0);
  return [
    { type: "instruction" },
    { type: "materials" },
    ...Array.from({ length: totalQuestions }, (_, i) => ({
      type: "question" as const,
      qIdx: i,
    })),
    { type: "summary" },
    { type: "result" },
  ];
}

// ─── Рейтинг ─────────────────────────────────────────────────────────────────

function RatingDot({ r }: { r: 1 | 2 | 3 }) {
  const cls = {
    1: "bg-red-100 text-red-600",
    2: "bg-orange-100 text-orange-500",
    3: "bg-green-100 text-green-600",
  }[r];
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${cls}`}>
      {r}
    </span>
  );
}

// ─── Таблица отзывов (легенда ПЕРЕД таблицей) ────────────────────────────────

const ATTRS: { key: keyof ReviewRow; short: string; full: string }[] = [
  { key: "taste",       short: "Вк", full: "Вкус блюд" },
  { key: "atmosphere",  short: "Чт", full: "Чистота" },
  { key: "staff",       short: "Об", full: "Общение" },
  { key: "speed",       short: "Ск", full: "Скорость" },
  { key: "temperature", short: "Тп", full: "Температура" },
  { key: "accuracy",    short: "Тч", full: "Точность" },
];

function ReviewTable({ rows }: { rows: ReviewRow[] }) {
  return (
    <div>
      <p className="text-[11px] text-bk-brown/45 mb-2 leading-relaxed">
        {ATTRS.map((a) => `${a.short} = ${a.full}`).join(" · ")}
      </p>
      <div className="overflow-x-auto rounded-xl border border-bk-brown/20">
        <table className="w-full text-xs bg-white border-collapse" style={{ minWidth: 520 }}>
          <thead>
            <tr className="bg-bk-cream/60">
              <th className="border border-bk-brown/15 px-2.5 py-2.5 text-left font-semibold text-bk-brown/60 whitespace-nowrap">Дата</th>
              <th className="border border-bk-brown/15 px-2 py-2.5 text-center font-semibold text-bk-brown/60">★</th>
              <th className="border border-bk-brown/15 px-2.5 py-2.5 text-left font-semibold text-bk-brown/60">Отзыв</th>
              {ATTRS.map((a) => (
                <th key={a.key} title={a.full} className="border border-bk-brown/15 px-1.5 py-2.5 text-center font-semibold text-bk-brown/60">
                  {a.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-bk-cream/25"}>
                <td className="border border-bk-brown/10 px-2.5 py-2 text-bk-brown/60 whitespace-nowrap">{row.date}</td>
                <td className="border border-bk-brown/10 px-2 py-2 text-center">
                  <RatingDot r={row.rating} />
                </td>
                <td className="border border-bk-brown/10 px-2.5 py-2 text-bk-brown/80 leading-snug" style={{ maxWidth: 200 }}>
                  {row.text || <span className="text-bk-brown/25">—</span>}
                </td>
                {ATTRS.map((a) => (
                  <td key={a.key} className="border border-bk-brown/10 px-1.5 py-2 text-center">
                    {row[a.key]
                      ? <span className="font-semibold text-bk-brown">✓</span>
                      : <span className="text-bk-brown/20">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Документы ────────────────────────────────────────────────────────────────

function DocView({ doc, showTitle = true }: { doc: CaseDoc; showTitle?: boolean }) {
  return (
    <div>
      {showTitle && (
        <h3 className="font-flame font-bold text-xl sm:text-2xl text-bk-brown mb-4">{doc.title}</h3>
      )}

      {doc.type === "reviews" && <ReviewTable rows={doc.rows} />}

      {doc.type === "plan" && (
        <div className="space-y-3">
          {doc.header && (
            <div className="bg-bk-orange/8 border border-bk-orange/20 rounded-xl px-4 py-3 text-center">
              <p className="font-semibold text-bk-brown text-sm">{doc.header}</p>
            </div>
          )}
          {doc.sections.map((sec, i) => (
            <div key={i} className="bg-white border border-bk-brown/15 rounded-xl p-4">
              <div className="flex flex-wrap gap-2 items-start mb-2.5">
                <span className="font-semibold text-bk-brown text-sm leading-snug">{sec.goal}</span>
                <span className="text-xs bg-bk-green/10 text-bk-green px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                  {sec.focus}
                </span>
              </div>
              <ul className="space-y-1.5">
                {sec.actions.map((action, j) => (
                  <li key={j} className="flex gap-2 text-sm text-bk-brown/75">
                    <span className="text-bk-brown/30 shrink-0 mt-0.5">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {doc.type === "plan-empty" && (
        <div className="border-2 border-dashed border-bk-brown/20 rounded-xl p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-bk-brown/8 mx-auto mb-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#502314" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="12" y2="15"/>
            </svg>
          </div>
          <p className="text-bk-brown/50 text-sm font-medium leading-relaxed">{doc.note}</p>
        </div>
      )}

      {doc.type === "plan-text" && (
        <div className="space-y-3">
          {doc.items.map((item, i) => (
            <div key={i} className="bg-white border border-bk-brown/15 rounded-xl p-4">
              <p className="text-xs font-semibold text-bk-green uppercase tracking-wide mb-1.5">{item.attribute}</p>
              <p className="text-sm text-bk-brown/80 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}

      {doc.type === "plan-simple" && (
        <div className="overflow-x-auto rounded-xl border border-bk-brown/20">
          <table className="w-full text-sm bg-white border-collapse">
            <thead>
              <tr className="bg-bk-cream/60">
                <th className="border border-bk-brown/15 px-3 py-2.5 text-left font-semibold text-bk-brown/60 whitespace-nowrap w-28">Дата</th>
                <th className="border border-bk-brown/15 px-3 py-2.5 text-left font-semibold text-bk-brown/60">Действие</th>
              </tr>
            </thead>
            <tbody>
              {doc.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-bk-cream/25"}>
                  <td className="border border-bk-brown/10 px-3 py-2.5 text-bk-brown/60 whitespace-nowrap align-top">{row.date}</td>
                  <td className="border border-bk-brown/10 px-3 py-2.5 text-bk-brown/80 leading-snug">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {doc.type === "complements" && (
        <div className="overflow-x-auto rounded-xl border border-bk-brown/20">
          <table className="w-full text-sm bg-white border-collapse">
            <thead>
              <tr className="bg-bk-cream/60">
                {["Месяц", "Лимит", "Использовано", "Остаток", "ДОБРО"].map((h) => (
                  <th key={h} className="border border-bk-brown/15 px-3 py-2.5 text-left font-semibold text-bk-brown/60 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doc.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-bk-cream/25"}>
                  <td className="border border-bk-brown/10 px-3 py-2.5">{row.month}</td>
                  <td className="border border-bk-brown/10 px-3 py-2.5 text-center">{row.limit}</td>
                  <td className="border border-bk-brown/10 px-3 py-2.5 text-center">
                    <span className={row.used === 0 ? "text-red-500 font-semibold" : ""}>{row.used}</span>
                  </td>
                  <td className="border border-bk-brown/10 px-3 py-2.5 text-center">{row.remaining}</td>
                  <td className="border border-bk-brown/10 px-3 py-2.5 text-center">{row.dobroUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Модальное окно с отчётом ────────────────────────────────────────────────

function DocModal({ doc, onClose }: { doc: CaseDoc; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-bk-cream sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-flame font-bold text-lg text-bk-brown leading-tight pr-2">{doc.title}</h3>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-full bg-bk-cream/70 hover:bg-bk-cream text-bk-brown flex items-center justify-center shrink-0 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-5">
          <DocView doc={doc} showTitle={false} />
        </div>
      </div>
    </div>
  );
}

// ─── Кнопка «Далее» ───────────────────────────────────────────────────────────

function NextBtn({ onClick, label = "Далее →" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-xl bg-white border-2 border-bk-brown/20 text-bk-brown font-semibold hover:bg-bk-cream/50 transition-colors"
    >
      {label}
    </button>
  );
}

// ─── Игровой экран ────────────────────────────────────────────────────────────

function CaseGame({ gameCase, onExit, onAnother }: {
  gameCase: GameCase;
  onExit: () => void;
  onAnother: () => void;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSummaryHint, setShowSummaryHint] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [modalDoc, setModalDoc] = useState<CaseDoc | null>(null);

  const allDocs = useMemo(
    () => [...gameCase.preDocs, ...(gameCase.midDocs ?? [])],
    [gameCase]
  );
  const allQuestions = useMemo(
    () => [...gameCase.preQuestions, ...(gameCase.midQuestions ?? [])],
    [gameCase]
  );
  const slides = useMemo(() => computeSlides(gameCase), [gameCase]);
  const slide = slides[slideIndex];
  const progress = ((slideIndex + 1) / slides.length) * 100;

  const startDocs = allDocs.filter((d) => d.unlockAt === undefined);

  const advance = () => {
    setSlideIndex((s) => s + 1);
    setShowHint(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setSlideIndex(0);
    setShowHint(false);
    setShowSummaryHint(false);
    setChecklist({});
    setModalDoc(null);
    window.scrollTo({ top: 0 });
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalItems = gameCase.checklist.length;
  const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  function renderSlide() {
    // ── Инструкция ────────────────────────────────────────────────────────────
    if (slide.type === "instruction") {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-semibold text-bk-brown/40 mb-3">Кейс {gameCase.number}</p>
          <h2 className="font-flame font-bold text-2xl sm:text-3xl text-bk-brown mb-5 leading-snug">
            {gameCase.title}
          </h2>

          <div className="bg-bk-cream/60 border border-bk-cream rounded-2xl p-5 mb-5">
            <p className="text-bk-brown/85 text-sm sm:text-base leading-relaxed">
              Ты проводишь ролевую игру с Директором ресторана. Твоя задача — не давать
              готовых ответов, а направлять его к самостоятельным решениям.
            </p>
          </div>

          <p className="font-flame font-bold text-bk-brown mb-3">Порядок действий:</p>
          <div className="space-y-3 mb-8">
            {INSTRUCTION_STEPS.map((step, i) => (
              <div key={i} className="flex gap-3 items-start bg-white border border-bk-brown/15 rounded-xl px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-bk-orange/15 text-bk-orange text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-bk-brown/80 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          <button
            onClick={advance}
            className="w-full py-3.5 rounded-xl bg-bk-orange text-white font-flame font-bold text-lg hover:bg-bk-orange/80 transition-colors"
          >
            Далее →
          </button>
        </div>
      );
    }

    // ── Изучи материалы (всё на одной странице) ───────────────────────────────
    if (slide.type === "materials") {
      return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h3 className="font-flame font-bold text-2xl sm:text-3xl text-bk-brown mb-2">Изучи материалы</h3>
          <p className="text-bk-brown/60 text-sm mb-6">
            Покажи материалы директору. Пролистайте вниз и изучите всё, затем переходите к вопросам.
          </p>

          <div className="space-y-8 mb-8">
            {startDocs.map((doc, i) => (
              <div key={i}>
                <DocView doc={doc} />
              </div>
            ))}
          </div>

          <NextBtn onClick={advance} label="Перейти к вопросам →" />
        </div>
      );
    }

    // ── Вопрос ───────────────────────────────────────────────────────────────
    if (slide.type === "question") {
      const q = allQuestions[slide.qIdx];
      if (!q) return null;

      // Материалы, которые открываются только изнутри подсказки на этом вопросе
      const hintDocs = allDocs.filter(
        (d) => d.revealInHint && d.unlockAt === slide.qIdx
      );
      // Отчёты в общем списке: уже «открытые» к этому вопросу
      // (материалы с revealInHint появляются здесь только со следующего вопроса)
      const availableDocs = allDocs.filter(
        (d) =>
          d.unlockAt === undefined ||
          d.unlockAt < slide.qIdx ||
          (d.unlockAt === slide.qIdx && !d.revealInHint)
      );
      // На вопросе с «отчётом из подсказки» кнопка «Далее» появляется после подсказки
      const showNext = hintDocs.length === 0 || showHint;

      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs font-semibold text-bk-brown/40 mb-3">
            Вопрос {slide.qIdx + 1} из {allQuestions.length}
          </p>

          <div className="bg-bk-cream/60 border border-bk-cream rounded-2xl p-5 mb-5">
            <p className="text-xs font-semibold text-bk-orange uppercase tracking-wide mb-2">ТУ спрашивает:</p>
            <p className="text-bk-brown text-sm sm:text-base leading-relaxed">{q.facilitatorText}</p>
          </div>

          {/* Кнопки открытия отчётов */}
          {availableDocs.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-bk-brown/45 uppercase tracking-wide mb-2">Отчёты</p>
              <div className="flex flex-wrap gap-2">
                {availableDocs.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setModalDoc(d)}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-white border border-bk-brown/20 text-bk-brown/80 hover:border-bk-orange/50 hover:text-bk-brown transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {d.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Подсказка — нажимать необязательно */}
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="w-full py-3 rounded-xl bg-white border-2 border-bk-brown/15 text-bk-brown/65 font-semibold hover:bg-bk-cream/50 transition-colors mb-3"
            >
              💡 Подсказка
            </button>
          ) : (
            <div className="bg-bk-green/10 border border-bk-green/25 rounded-2xl p-5 mb-3">
              <p className="text-xs font-semibold text-bk-green uppercase tracking-wide mb-2">Подсказка — верный ответ:</p>
              <p className="text-bk-brown/85 text-sm leading-relaxed">{q.hint}</p>
              {hintDocs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-bk-green/20">
                  {hintDocs.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setModalDoc(d)}
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-white border border-bk-green/40 text-bk-brown/80 hover:border-bk-green transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      Открыть: {d.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showNext && (
            <button
              onClick={advance}
              className="w-full py-3 rounded-xl bg-bk-green text-white font-semibold hover:bg-bk-green/80 transition-colors"
            >
              Далее →
            </button>
          )}
        </div>
      );
    }

    // ── Подводим итоги (ТУ просит + подсказка + чек-лист + завершить) ─────────
    if (slide.type === "summary") {
      const availableDocs = allDocs.filter(
        (d) => d.unlockAt === undefined || d.unlockAt <= allQuestions.length
      );
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <h3 className="font-flame font-bold text-2xl sm:text-3xl text-bk-brown mb-4">Подводим итоги</h3>

          <div className="bg-bk-cream/60 border border-bk-cream rounded-2xl p-5 mb-4">
            <p className="text-xs font-semibold text-bk-orange uppercase tracking-wide mb-2">ТУ просит:</p>
            <p className="text-bk-brown text-sm sm:text-base leading-relaxed">{gameCase.checklistQuestion}</p>
          </div>

          {availableDocs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {availableDocs.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setModalDoc(d)}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-white border border-bk-brown/20 text-bk-brown/80 hover:border-bk-orange/50 hover:text-bk-brown transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {d.title}
                </button>
              ))}
            </div>
          )}

          {!showSummaryHint ? (
            <button
              onClick={() => setShowSummaryHint(true)}
              className="w-full py-3 rounded-xl bg-white border-2 border-bk-brown/15 text-bk-brown/65 font-semibold hover:bg-bk-cream/50 transition-colors mb-6"
            >
              💡 Подсказка
            </button>
          ) : (
            <div className="bg-bk-green/10 border border-bk-green/25 rounded-2xl p-5 mb-6">
              <p className="text-xs font-semibold text-bk-green uppercase tracking-wide mb-2">Подсказка — верный ответ:</p>
              <p className="text-bk-brown/85 text-sm leading-relaxed">{gameCase.checklistHint}</p>
            </div>
          )}

          {/* Чек-лист прямо здесь */}
          <h4 className="font-flame font-bold text-lg text-bk-brown mb-1">Чек-лист для ТУ</h4>
          <p className="text-bk-brown/50 text-sm mb-4">Отметь пункты, которые директор назвал правильно.</p>
          <div className="space-y-2.5 mb-5">
            {gameCase.checklist.map((item) => {
              const on = !!checklist[item.id];
              return (
                <label
                  key={item.id}
                  className={`flex gap-3 items-start p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                    on ? "border-bk-green/40 bg-bk-green/8" : "border-bk-cream bg-white hover:border-bk-green/25"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={(e) =>
                      setChecklist((prev) => ({ ...prev, [item.id]: e.target.checked }))
                    }
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    on ? "border-bk-green bg-bk-green" : "border-bk-brown/25"
                  }`}>
                    {on && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm leading-relaxed ${on ? "text-bk-brown" : "text-bk-brown/70"}`}>
                    {item.text}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="flex-1 h-1.5 bg-bk-cream rounded-full overflow-hidden">
              <div className="h-full bg-bk-green rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-bk-brown/60 whitespace-nowrap">
              {checkedCount} / {totalItems}
            </span>
          </div>

          <button
            onClick={advance}
            className="w-full py-3 rounded-xl bg-bk-green text-white font-semibold hover:bg-bk-green/80 transition-colors"
          >
            Завершить →
          </button>
        </div>
      );
    }

    // ── Результат ─────────────────────────────────────────────────────────────
    if (slide.type === "result") {
      const scoreColor =
        pct >= 80 ? "text-bk-green border-bk-green/30 bg-bk-green/8" :
        pct >= 50 ? "text-bk-orange border-bk-orange/30 bg-bk-orange/8" :
        "text-bk-red border-bk-red/25 bg-bk-red/8";
      const msg =
        pct >= 80 ? "Отлично! Директор уверенно разобрался в ситуации." :
        pct >= 50 ? "Хорошо, но есть пробелы — обсудите отмеченные пункты подробнее." :
        "Нужна доработка. Вернитесь к материалам и разберите ситуацию ещё раз.";

      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
          <div className={`w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl font-flame font-bold border-4 ${scoreColor}`}>
            {pct}%
          </div>
          <h3 className="font-flame font-bold text-2xl text-bk-brown mb-2">
            {checkedCount} из {totalItems} пунктов
          </h3>
          <p className="text-bk-brown/60 text-sm leading-relaxed mb-8">{msg}</p>

          <div className="space-y-2 text-left mb-8">
            {gameCase.checklist.map((item) => {
              const on = !!checklist[item.id];
              return (
                <div
                  key={item.id}
                  className={`flex gap-2.5 items-start px-4 py-2.5 rounded-xl text-sm ${
                    on ? "bg-bk-green/8 text-bk-brown" : "bg-bk-cream/60 text-bk-brown/45"
                  }`}
                >
                  <span className={on ? "text-bk-green" : "text-bk-brown/25"}>{on ? "✓" : "—"}</span>
                  {item.text}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={restart}
              className="flex-1 py-3 rounded-xl bg-white border-2 border-bk-brown/20 text-bk-brown/65 font-semibold hover:bg-bk-cream/50 transition-colors"
            >
              🔁 Этот кейс заново
            </button>
            <button
              onClick={onAnother}
              className="flex-1 py-3 rounded-xl bg-bk-orange text-white font-semibold hover:bg-bk-orange/80 transition-colors"
            >
              🎲 Другой кейс
            </button>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Шапка с прогрессом */}
      <div className="bg-white border-b border-bk-cream sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="text-bk-brown/45 hover:text-bk-brown transition-colors"
              aria-label="На главную"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-bk-brown/40 font-medium">Кейс {gameCase.number}</p>
              <p className="text-sm font-flame font-bold text-bk-brown truncate leading-tight">{gameCase.title}</p>
            </div>
            <span className="text-xs text-bk-brown/35 shrink-0 font-mono">
              {slideIndex + 1}/{slides.length}
            </span>
          </div>
          <div className="mt-2 h-1 bg-bk-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-bk-orange rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {renderSlide()}

      {modalDoc && <DocModal doc={modalDoc} onClose={() => setModalDoc(null)} />}
    </div>
  );
}

// ─── Стартовый экран (только кнопка «Начать» → случайный кейс) ────────────────

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        backHref="/"
        title="Кейс с ТУ"
        subtitle="Ролевая игра для ТУ и директора ресторана"
        accent="yellow"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-flame font-bold text-2xl sm:text-3xl text-bk-brown mb-3">Разбор кейса с директором</h2>
        <p className="text-bk-brown/60 text-sm sm:text-base mb-8 leading-relaxed">
          ТУ проводит ролевую игру с директором ресторана: вместе изучаете отзывы Гостей и план
          действий, отвечаете на вопросы и подводите итоги по чек-листу.
        </p>

        <button
          onClick={onStart}
          className="group w-full bg-bk-yellow hover:bg-bk-yellow/85 rounded-3xl p-7 sm:p-9 transition-colors text-left"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-bk-brown/70 bg-white/60 px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {ESTIMATED_TIME}
            </span>
            <span className="text-bk-brown/40 group-hover:text-bk-brown/70 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
          <p className="font-flame font-bold text-3xl sm:text-4xl text-bk-brown mb-1">Начать</p>
          <p className="text-bk-brown/70 text-sm sm:text-base">Открыть случайный кейс</p>
        </button>
      </div>
    </div>
  );
}

// ─── Страница ─────────────────────────────────────────────────────────────────

// Перемешивание (Фишер–Йейтс)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CasePage() {
  const [activeCase, setActiveCase] = useState<GameCase | null>(null);
  // «Мешок» из перемешанных кейсов: каждый кейс выпадает ровно один раз
  // за цикл — это даёт всем кейсам одинаковую вероятность и без повторов подряд.
  const bagRef = useRef<GameCase[]>([]);

  const drawCase = (exclude?: GameCase): GameCase => {
    if (bagRef.current.length === 0) {
      const bag = shuffle(gameCases);
      // не повторяем тот же кейс сразу после предыдущего на стыке циклов
      if (exclude && bag.length > 1 && bag[0].id === exclude.id) {
        [bag[0], bag[1]] = [bag[1], bag[0]];
      }
      bagRef.current = bag;
    }
    return bagRef.current.shift()!;
  };

  if (activeCase) {
    return (
      <CaseGame
        key={activeCase.id}
        gameCase={activeCase}
        onExit={() => setActiveCase(null)}
        onAnother={() => setActiveCase(drawCase(activeCase))}
      />
    );
  }

  return <StartScreen onStart={() => setActiveCase(drawCase())} />;
}
