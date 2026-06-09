import BackButton from "./BackButton";

interface PageHeaderProps {
  backHref: string;
  backLabel?: string;
  title: string;
  subtitle?: string;
  accent?: string; // цвет акцента: "orange" | "green" | "yellow" | "red"
}

const accentClasses: Record<string, string> = {
  orange: "bg-bk-orange",
  green: "bg-bk-green",
  yellow: "bg-bk-yellow",
  red: "bg-bk-red",
};

export default function PageHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  accent = "orange",
}: PageHeaderProps) {
  return (
    <header className="bg-white border-b border-bk-cream sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <BackButton href={backHref} label={backLabel} />
        <div className="mt-3 flex items-center gap-3">
          <div className={`w-1 h-9 rounded-full ${accentClasses[accent] ?? accentClasses.orange}`} />
          <div>
            <h1 className="font-flame text-2xl sm:text-3xl font-bold text-bk-brown leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-bk-brown/60 text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
