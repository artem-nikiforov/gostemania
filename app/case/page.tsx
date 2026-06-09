"use client";

import { useState, useMemo } from "react";
import PageHeader from "../components/PageHeader";
import {
  gameCases,
  type GameCase,
  type CaseDoc,
  type ReviewRow,
} from "../data/case";

// ─── Типы слайдов ─────────────────────────────────────────────────────────────

type Slide =
  | { type: "intro" }
  | { type: "study" }
  | { type: "doc"; docIdx: number; phase: "pre" | "mid" }
  | { type: "mid-reveal" }
  | { type: "question"; qIdx: number; phase: "pre" | "mid" }
  | { type: "checklistQ" }
  | { type: "checklist" }
  | { type: "result" };

function computeSlides(gc: GameCase): Slide[] {
  const s: Slide[] = [
    { type: "intro" },
    { type: "study" },
    ...gc.preDocs.map((_, i) => ({ type: "doc" as const, docIdx: i, phase: "pre" as const })),
    ...gc.preQuestions.map((_, i) => ({ type: "question" as const, qIdx: i, phase: "pre" as const })),
  ];
  if (gc.midDocs && gc.midDocs.length > 0) {
    s.push({ type: "mid-reveal" });
    gc.midDocs.forEach((_, i) => s.push({ type: "doc", docIdx: i, phase: "mid" }));
  }
  if (gc.midQuestions) {
    gc.midQuestions.forEach((_, i) => s.push({ type: "question", qIdx: i, phase: "mid" }));
  }
  s.push({ type: "checklistQ" });
  s.push({ type: "checklist" });
  s.push({ type: "result" });
  return s;
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

// ─── Таблица отзывов ──────────────────────────────────────────────────────────

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
      <p className="text-[11px] text-bk-brown/40 mt-1.5 leading-relaxed">
        {ATTRS.map((a) => `${a.short} = ${a.full}`).join(" · ")}
      </p>
    </div>
  );
}

// ─── Документы ────────────────────────────────────────────────────────────────

function DocView({ doc }: { doc: CaseDoc }) {
  return (
    <div>
      <h3 className="font-flame font-bold text-xl sm:text-2xl text-bk-brown mb-4">{doc.title}</h3>

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

function CaseGame({ gameCase, onBack }: { gameCase: GameCase; onBack: () => void }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const slides = useMemo(() => computeSlides(gameCase), [gameCase]);
  const slide = slides[slideIndex];
  const progress = ((slideIndex + 1) / slides.length) * 100;

  const advance = () => {
    setSlideIndex((s) => s + 1);
    setShowHint(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalItems = gameCase.checklist.length;
  const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  function renderSlide() {
    // ── Вступление ────────────────────────────────────────────────────────────
    if (slide.type === "intro") {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${gameCase.badgeColor}`}>
              {gameCase.badge}
            </span>
            <span className="text-xs text-bk-brown/40">Кейс {gameCase.number}</span>
          </div>
          <h2 className="font-flame font-bold text-2xl sm:text-3xl text-bk-brown mb-5 leading-snug">
            {gameCase.title}
          </h2>
          <div className="bg-bk-cream/60 border border-bk-cream rounded-2xl p-5 mb-8">
            <p className="text-xs font-semibold text-bk-orange uppercase tracking-wide mb-2">ТУ говорит:</p>
            <p className="text-bk-brown/85 text-sm sm:text-base leading-relaxed">{gameCase.intro}</p>
          </div>
          <button
            onClick={advance}
            className="w-full py-3.5 rounded-xl bg-bk-orange text-white font-flame font-bold text-lg hover:bg-bk-orange/80 transition-colors"
          >
            Начать →
          </button>
        </div>
      );
    }

    // ── Изучи материалы ───────────────────────────────────────────────────────
    if (slide.type === "study") {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <h3 className="font-flame font-bold text-2xl text-bk-brown mb-3">Изучи материалы</h3>
          <p className="text-bk-brown/60 text-sm mb-5">ТУ передаёт директору следующие отчёты:</p>
          <div className="space-y-3 mb-8">
            {gameCase.studyItems.map((item, i) => (
              <div key={i} className="flex gap-3 items-start bg-white border border-bk-brown/15 rounded-xl px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-bk-brown/10 text-bk-brown text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-bk-brown/80">{item}</span>
              </div>
            ))}
          </div>
          <NextBtn onClick={advance} label="Перейти к материалам →" />
        </div>
      );
    }

    // ── Документ ─────────────────────────────────────────────────────────────
    if (slide.type === "doc") {
      const docs = slide.phase === "pre" ? gameCase.preDocs : (gameCase.midDocs ?? []);
      const doc = docs[slide.docIdx];
      if (!doc) return null;
      return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <DocView doc={doc} />
          </div>
          <NextBtn onClick={advance} />
        </div>
      );
    }

    // ── Промежуточное раскрытие ───────────────────────────────────────────────
    if (slide.type === "mid-reveal") {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bk-yellow/20 mx-auto mb-5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#502314" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h3 className="font-flame font-bold text-2xl text-bk-brown mb-3">
            Результаты после визита ТУ
          </h3>
          <p className="text-bk-brown/60 text-sm mb-8 leading-relaxed">
            ТУ посетил ресторан, помог директору составить план и отработал с командой.<br />Посмотрим, что изменилось.
          </p>
          <button
            onClick={advance}
            className="w-full py-3.5 rounded-xl bg-bk-yellow text-bk-brown font-flame font-bold text-lg hover:bg-bk-yellow/80 transition-colors"
          >
            Посмотреть результаты →
          </button>
        </div>
      );
    }

    // ── Вопрос ───────────────────────────────────────────────────────────────
    if (slide.type === "question") {
      const questions = slide.phase === "pre" ? gameCase.preQuestions : (gameCase.midQuestions ?? []);
      const q = questions[slide.qIdx];
      if (!q) return null;
      const qNum = slide.phase === "pre"
        ? slide.qIdx + 1
        : gameCase.preQuestions.length + slide.qIdx + 1;

      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs font-semibold text-bk-brown/40 mb-3">Вопрос {qNum}</p>
          <div className="bg-bk-cream/60 border border-bk-cream rounded-2xl p-5 mb-5">
            <p className="text-xs font-semibold text-bk-orange uppercase tracking-wide mb-2">ТУ спрашивает:</p>
            <p className="text-bk-brown text-sm sm:text-base leading-relaxed">{q.facilitatorText}</p>
          </div>

          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="w-full py-3 rounded-xl bg-white border-2 border-bk-brown/15 text-bk-brown/65 font-semibold hover:bg-bk-cream/50 transition-colors mb-4"
            >
              💡 Показать правильный ответ
            </button>
          ) : (
            <>
              <div className="bg-bk-green/10 border border-bk-green/25 rounded-2xl p-5 mb-5">
                <p className="text-xs font-semibold text-bk-green uppercase tracking-wide mb-2">Правильный ответ:</p>
                <p className="text-bk-brown/85 text-sm leading-relaxed">{q.hint}</p>
              </div>
              <button
                onClick={advance}
                className="w-full py-3 rounded-xl bg-bk-green text-white font-semibold hover:bg-bk-green/80 transition-colors"
              >
                Далее →
              </button>
            </>
          )}
        </div>
      );
    }

    // ── Вопрос перед чеклистом ────────────────────────────────────────────────
    if (slide.type === "checklistQ") {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <h3 className="font-flame font-bold text-2xl text-bk-brown mb-4">Подводим итоги</h3>
          <div className="bg-bk-cream/60 border border-bk-cream rounded-2xl p-5 mb-5">
            <p className="text-xs font-semibold text-bk-orange uppercase tracking-wide mb-2">ТУ просит:</p>
            <p className="text-bk-brown text-sm sm:text-base leading-relaxed">{gameCase.checklistQuestion}</p>
          </div>
          <p className="text-bk-brown/50 text-sm mb-6">
            Выслушай ответ директора, затем отметь в чеклисте то, что он правильно назвал.
          </p>
          <button
            onClick={advance}
            className="w-full py-3 rounded-xl bg-bk-orange text-white font-semibold hover:bg-bk-orange/80 transition-colors"
          >
            Перейти к чеклисту →
          </button>
        </div>
      );
    }

    // ── Чеклист ───────────────────────────────────────────────────────────────
    if (slide.type === "checklist") {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <h3 className="font-flame font-bold text-2xl text-bk-brown mb-2">Чеклист ТУ</h3>
          <p className="text-bk-brown/50 text-sm mb-5">Отметь пункты, которые директор назвал правильно.</p>
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

          {/* Прогресс */}
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="flex-1 h-1.5 bg-bk-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-bk-green rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
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
              onClick={() => {
                setSlideIndex(0);
                setShowHint(false);
                setChecklist({});
                window.scrollTo({ top: 0 });
              }}
              className="flex-1 py-3 rounded-xl bg-white border-2 border-bk-brown/20 text-bk-brown/65 font-semibold hover:bg-bk-cream/50 transition-colors"
            >
              🔁 Начать заново
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl bg-bk-orange text-white font-semibold hover:bg-bk-orange/80 transition-colors"
            >
              📋 Другой кейс
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
              onClick={onBack}
              className="text-bk-brown/45 hover:text-bk-brown transition-colors"
              aria-label="Назад"
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

      {/* Контент */}
      {renderSlide()}
    </div>
  );
}

// ─── Выбор кейса ─────────────────────────────────────────────────────────────

function CaseSelector({ onSelect }: { onSelect: (gc: GameCase) => void }) {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        backHref="/"
        title="Кейс с ТУ"
        subtitle="Ролевая игра для ТУ и директора ресторана"
        accent="yellow"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-flame font-bold text-2xl sm:text-3xl text-bk-brown mb-2">Выбери кейс</h2>
        <p className="text-bk-brown/55 text-sm mb-7">
          ТУ проводит разбор реальной ситуации с директором ресторана. Изучите вместе отзывы, план и ответьте на вопросы.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {gameCases.map((gc) => {
            const docCount = gc.preDocs.length + (gc.midDocs?.length ?? 0);
            const qCount = gc.preQuestions.length + (gc.midQuestions?.length ?? 0);
            return (
              <button
                key={gc.id}
                onClick={() => onSelect(gc)}
                className="w-full text-left bg-white border-2 border-bk-cream hover:border-bk-yellow/50 rounded-2xl p-5 transition-all hover:shadow-md group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-4xl font-flame font-bold text-bk-brown/12 leading-none">
                    {gc.number < 10 ? `0${gc.number}` : gc.number}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${gc.badgeColor}`}>
                    {gc.badge}
                  </span>
                </div>
                <h3 className="font-flame font-bold text-lg text-bk-brown group-hover:text-bk-brown/75 leading-snug mb-1 transition-colors">
                  {gc.title}
                </h3>
                <p className="text-xs text-bk-brown/35">
                  {docCount} {docCount === 1 ? "документ" : "документа"} · {qCount} {qCount === 1 ? "вопрос" : "вопроса"} · {gc.checklist.length} пунктов чеклиста
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Страница ─────────────────────────────────────────────────────────────────

export default function CasePage() {
  const [selectedCase, setSelectedCase] = useState<GameCase | null>(null);

  if (selectedCase) {
    return <CaseGame gameCase={selectedCase} onBack={() => setSelectedCase(null)} />;
  }

  return <CaseSelector onSelect={setSelectedCase} />;
}
