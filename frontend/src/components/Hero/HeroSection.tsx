import HeroCard from './HeroCard';
import { Shield, Brain, Zap, Lock, Target, TriangleAlert } from 'lucide-react';

function HeroSection() {
  return (
    <section className="markup-layout section-spacing">
      <div className="md: flex flex-col items-center justify-center gap-1 md:flex-row">
        <Shield className="h-10 w-10 md:h-12 md:w-12" />
        <h1 className="text-3xl font-bold uppercase md:text-6xl">Антимошенник</h1>
      </div>

      <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-gray-300 md:text-lg">
        AI-сервис для анализа подозрительных сообщений и выявления признаков мошенничества
      </p>

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 pt-5 md:grid-cols-4 md:gap-4">
        <HeroCard icon={<Brain className="h-5 w-5 md:h-8 md:w-8" />} title="AI-Анализ" description="Умная система" />
        <HeroCard icon={<Zap className="h-5 w-5 md:h-8 md:w-8" />} title="За 30 секунд" description="Быстро" />
        <HeroCard icon={<Lock className="h-5 w-5 md:h-8 md:w-8" />} title="Без регистрации" description="Анонимно" />
        <HeroCard icon={<Target className="h-5 w-5 md:h-8 md:w-8" />} title="Точность" description="Нейросеть" />
      </div>

      <div className="pt-5 text-center">
        <div className="inline-flex flex-col items-center justify-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-1 py-1 md:flex-row md:gap-2 md:rounded-full md:px-4 md:py-2">
          <TriangleAlert className="h-4 w-4 text-red-400" />
          <p className="text-xs text-red-400 md:text-sm">
            В 2025 году мошенники похитили у россиян более 200 млрд рублей
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
