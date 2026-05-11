import HeroCard from './HeroCard';
import { Shield, Brain, Zap, Lock, Target, TriangleAlert } from 'lucide-react';

function Hero() {
  return (
    <section className="markup-layout pt-10 md:pt-15">
      <div className="flex items-center justify-center gap-1">
        <Shield className="h-7 w-7 md:h-10 md:w-10" />
        <h1 className="text-2xl font-bold uppercase md:text-5xl">Антимошенник</h1>
      </div>

      <p className="text-center text-sm font-semibold md:text-3xl">Проверка сообщений на мошенничество</p>

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

export default Hero;
