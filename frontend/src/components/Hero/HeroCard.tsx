type HeroCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function HeroCard({ icon, title, description }: HeroCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)] py-3 transition-colors transition-transform duration-300 hover:scale-105 hover:bg-transparent md:py-4">
      {icon}
      <p className="text-sm font-semibold whitespace-nowrap md:text-base">{title}</p>
      <p className="text-xs whitespace-nowrap md:text-sm">{description}</p>
    </div>
  );
}

export default HeroCard;
