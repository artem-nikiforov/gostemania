"use client";

import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { speechTemplate, speechExamples, type SpeechExample } from "../data/speeches";

// ─── Компонент «Аккордеон» для шаблона речи ────────────────────────────────
function AccordionItem({
  title,
  description,
  example,
  isOpen,
  onToggle,
}: {
  title: string;
  description: string;
  example: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-bk-cream rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bk-cream/40 transition-colors"
      >
        <span className="font-flame font-bold text-bk-brown text-base sm:text-lg">{title}</span>
        <span
          className={`text-bk-orange transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-bk-cream">
          <p className="text-bk-brown/70 text-sm mt-3 mb-3 leading-relaxed">{description}</p>
          <div className="bg-bk-cream/60 rounded-lg px-4 py-3">
            <p className="text-xs text-bk-brown/50 uppercase font-semibold tracking-wide mb-1.5">Пример формулировки</p>
            <p className="text-bk-brown text-sm italic leading-relaxed">{example}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Компонент карточки-кнопки ───────────────────────────────────────────────
function SpeechCard({
  speech,
  onClick,
}: {
  speech: SpeechExample;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border-2 border-bk-cream hover:border-bk-orange/40 rounded-xl p-5 transition-all hover:shadow-md group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="font-flame font-bold text-bk-brown text-base leading-snug group-hover:text-bk-orange transition-colors">
          {speech.topic}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bk-orange/50 group-hover:text-bk-orange transition-colors shrink-0 mt-0.5">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
        </svg>
      </div>
      <span className="text-xs text-bk-brown/50">{speech.duration}</span>
    </button>
  );
}

// ─── Компонент полноэкранного модала со Speech ──────────────────────────────
function SpeechModal({
  speech,
  onClose,
}: {
  speech: SpeechExample;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl mb-8">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-bk-cream sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <p className="text-xs text-bk-orange font-semibold uppercase tracking-wide">Готовая речь</p>
            <h2 className="font-flame font-bold text-xl text-bk-brown mt-0.5">{speech.topic}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-bk-cream/80 hover:bg-bk-cream flex items-center justify-center text-bk-brown/60 hover:text-bk-brown transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-6">
          <div className="flex items-center gap-2 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bk-brown/40">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs text-bk-brown/50">Примерная длительность: {speech.duration}</span>
          </div>
          <div className="prose prose-sm max-w-none">
            {speech.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-bk-brown leading-relaxed mb-4 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-bk-cream">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-bk-brown text-white rounded-xl text-sm font-medium hover:bg-bk-brown/80 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Главный компонент страницы ──────────────────────────────────────────────
export default function SpeechesPage() {
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);
  const [selectedSpeech, setSelectedSpeech] = useState<SpeechExample | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordionIndex(openAccordionIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        backHref="/"
        title="Речи директора"
        subtitle="Шаблоны и готовые примеры для работы с командой"
        accent="orange"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Раздел 1.1 — Шаблон речи */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-bk-orange/10 flex items-center justify-center">
              <span className="text-bk-orange text-xs font-bold">1</span>
            </div>
            <h2 className="font-flame font-bold text-xl text-bk-brown">Шаблон речи</h2>
          </div>
          <p className="text-bk-brown/60 text-sm mb-5 leading-relaxed">
            Используй эту структуру для подготовки любой речи перед командой. Раскрывай каждый блок по очереди.
          </p>
          <div className="space-y-2">
            {speechTemplate.map((item, index) => (
              <AccordionItem
                key={index}
                title={item.title}
                description={item.description}
                example={item.example}
                isOpen={openAccordionIndex === index}
                onToggle={() => toggleAccordion(index)}
              />
            ))}
          </div>
        </section>

        {/* Раздел 1.2 — Готовые примеры */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-bk-orange/10 flex items-center justify-center">
              <span className="text-bk-orange text-xs font-bold">2</span>
            </div>
            <h2 className="font-flame font-bold text-xl text-bk-brown">Готовые примеры речей</h2>
          </div>
          <p className="text-bk-brown/60 text-sm mb-5 leading-relaxed">
            Нажми на карточку, чтобы открыть полный текст речи. Используй как основу и адаптируй под свою ситуацию.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {speechExamples.map((speech) => (
              <SpeechCard
                key={speech.id}
                speech={speech}
                onClick={() => setSelectedSpeech(speech)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Полноэкранный модал */}
      {selectedSpeech && (
        <SpeechModal
          speech={selectedSpeech}
          onClose={() => setSelectedSpeech(null)}
        />
      )}
    </div>
  );
}
