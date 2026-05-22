import Link from "next/link";

const sections = [
  {
    href: "/speeches",
    number: "01",
    title: "Речи директора",
    description:
      "Шаблоны и готовые примеры вдохновляющих речей для работы с командой на все случаи жизни.",
    color: "orange",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    tag: "Для директора",
    tagColor: "bg-bk-orange/10 text-bk-orange",
    border: "border-bk-orange/20 hover:border-bk-orange/60",
    accent: "bg-bk-orange",
  },
  {
    href: "/trainer",
    number: "02",
    title: "Чат-тренажёр",
    description:
      "Отработай сценарии работы с недовольным Гостем в интерактивном чате. Выбери правильные ответы и доведи Гостя до улыбки.",
    color: "green",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    tag: "Для сотрудника",
    tagColor: "bg-bk-green/10 text-bk-green",
    border: "border-bk-green/20 hover:border-bk-green/60",
    accent: "bg-bk-green",
  },
  {
    href: "/case",
    number: "03",
    title: "Кейс с ТУ",
    description:
      "Ролевая игра для территориального управляющего и директора ресторана. Разбор реальной ситуации с Индексом Гостемании.",
    color: "yellow",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    tag: "Для ТУ и директора",
    tagColor: "bg-bk-yellow/20 text-bk-brown",
    border: "border-bk-yellow/30 hover:border-bk-yellow/80",
    accent: "bg-bk-yellow",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-bk-cream/50 border-b border-bk-cream pt-14 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-bk-orange flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-bk-orange font-semibold text-sm tracking-wide uppercase">Burger King</span>
          </div>
          <h1 className="font-flame text-4xl sm:text-5xl font-bold text-bk-brown leading-tight mb-4">
            Гостемания
          </h1>
          <p className="text-bk-brown/70 text-lg max-w-xl leading-relaxed">
            Интерактивная платформа для отработки навыков работы с Гостем и командой. Три раздела — три задачи.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-5 sm:gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`group relative bg-white border-2 ${section.border} rounded-2xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg flex flex-col sm:flex-row sm:items-center gap-5`}
            >
              {/* Accent line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${section.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />

              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white ${section.accent}`}>
                {section.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-bk-brown/40 text-xs font-mono font-bold">{section.number}</span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${section.tagColor}`}>
                    {section.tag}
                  </span>
                </div>
                <h2 className="font-flame text-xl sm:text-2xl font-bold text-bk-brown mb-1.5">
                  {section.title}
                </h2>
                <p className="text-bk-brown/65 text-sm sm:text-base leading-relaxed">
                  {section.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="text-bk-brown/30 group-hover:text-bk-brown/70 transition-colors shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bk-cream py-6 px-4 text-center text-bk-brown/40 text-sm">
        Burger King · Платформа обучения команды
      </footer>
    </div>
  );
}
