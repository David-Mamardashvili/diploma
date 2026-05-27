import { useState } from 'react';
import {
  question1Config,
  question2Config,
  question2DefaultConfig,
  question3Config,
  question3DefaultConfig,
  question4Config,
  question4DefaultConfig,
} from './scanQuestions';
import ScanOptionButton from './ScanOptionButton';
import ScanBackButton from './ScanBackButton';
import ScanCustomOptionInput from './ScanCustomOptionInput';
import ScanScreenshotInput from './ScanScreenshotInput';

type QuizAnswer = {
  question: string;
  answer: string;
};

type ScanSituationText = {
  question1: QuizAnswer;
  question2: QuizAnswer;
  question3: QuizAnswer;
  question4: QuizAnswer;
  message: string;
};

type ScanSituationResult = {
  riskLevel: string;
  riskPercentage: number;
  warningSigns: string[];
  psychologicalManipulations: string[];
  fraudScheme: {
    title: string;
    description: string;
  };
  recommendations: string[];
  flaggedLinks: string[];
};

type ScanSituationHistoryItem = {
  id: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  message: string;
  result: ScanSituationResult;
  createdAt: string;
};

function formatScanCheckDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ScanSection() {
  async function scanSituation(text: ScanSituationText, files: File[]): Promise<ScanSituationResult> {
    const formData = new FormData();

    formData.append('text', JSON.stringify(text));

    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch('http://localhost:3001/scan-situation', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error();
    }

    return response.json();
  }

  async function handleScanSituation() {
    try {
      setIsLoading(true);

      setError('');

      const result = await scanSituation(
        {
          question1: {
            question: question1Config.question,
            answer: question1,
          },

          question2: {
            question: (question2Config[question1] ?? question2DefaultConfig).question,
            answer: question2,
          },

          question3: {
            question: (question3Config[question2] ?? question3DefaultConfig).question,
            answer: question3,
          },

          question4: {
            question: (question4Config[question2]?.[question3] ?? question4DefaultConfig).question,
            answer: question4,
          },

          message,
        },
        screenshots,
      );

      setResult(result);

      const scanSituationHistoryItem: ScanSituationHistoryItem = {
        id: crypto.randomUUID(),
        question1,
        question2,
        question3,
        question4,
        message,
        result,
        createdAt: new Date().toISOString(),
      };

      setScanSituationHistoryItems((currentScanSituationHistoryItems) => {
        localStorage.setItem(
          'scan-situation-history-items',
          JSON.stringify([scanSituationHistoryItem, ...currentScanSituationHistoryItems]),
        );

        return [scanSituationHistoryItem, ...currentScanSituationHistoryItems];
      });
    } catch (error) {
      console.error(error);

      setError('Не удалось выполнить анализ. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }

  function clearScanSituationHistoryItems() {
    localStorage.removeItem('scan-situation-history-items');
    setScanSituationHistoryItems([]);
  }

  const [scanSituationHistoryItems, setScanSituationHistoryItems] = useState<ScanSituationHistoryItem[]>(() => {
    return JSON.parse(localStorage.getItem('scan-situation-history-items') || '[]');
  });
  const [question1, setQuestion1] = useState('');
  const [customQuestion1, setCustomQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [customQuestion2, setCustomQuestion2] = useState('');
  const [question3, setQuestion3] = useState('');
  const [customQuestion3, setCustomQuestion3] = useState('');
  const [question4, setQuestion4] = useState('');
  const [customQuestion4, setCustomQuestion4] = useState('');
  const [message, setMessage] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [result, setResult] = useState<ScanSituationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openedHistoryItemId, setOpenedHistoryItemId] = useState<string | null>(null);

  const resetForm = () => {
    setQuestion1('');
    setCustomQuestion1('');

    setQuestion2('');
    setCustomQuestion2('');

    setQuestion3('');
    setCustomQuestion3('');

    setQuestion4('');
    setCustomQuestion4('');

    setMessage('');
    setScreenshots([]);
    setResult(null);
  };

  return (
    <section id="scan" className="markup-layout section-spacing scroll-mt-[-20px] md:scroll-mt-[-35px]">
      <h2 className="text-center text-3xl font-bold md:text-6xl">
        Проверьте сообщение
        <br />
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--heading-gradient-from), var(--heading-gradient-via), var(--heading-gradient-to))',
          }}
        >
          на мошенничество
        </span>
        <br />с помощью AI
      </h2>

      {!question1 && (
        <div className="mx-auto max-w-xl pt-5">
          <div className="flex flex-col gap-[14px]">
            <div
              className="mx-auto h-[2px] w-40"
              style={{
                background: 'linear-gradient(to right, transparent, var(--divider-gradient-color), transparent)',
              }}
            />

            <div
              className="mx-auto h-[2px] w-40"
              style={{
                background: 'linear-gradient(to right, transparent, var(--divider-gradient-color), transparent)',
              }}
            />

            <div
              className="mx-auto h-[2px] w-40"
              style={{
                background: 'linear-gradient(to right, transparent, var(--divider-gradient-color), transparent)',
              }}
            />
          </div>

          <p className="pt-5 font-semibold md:text-xl">Откуда вы получили это сообщение?</p>

          <div className="flex flex-col gap-3 pt-2">
            {question1Config.options.map((option) => (
              <ScanOptionButton key={option} onClick={() => setQuestion1(option)}>
                {option}
              </ScanOptionButton>
            ))}
            <ScanCustomOptionInput
              value={customQuestion1}
              onChange={setCustomQuestion1}
              onSubmit={() => {
                setQuestion1(customQuestion1.trim());
                setCustomQuestion1('');
              }}
            />
          </div>
        </div>
      )}

      {question1 && !question2 && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton
            onClick={() => {
              setQuestion1('');
              setCustomQuestion1('');
            }}
          />

          <p className="pt-2 font-semibold md:text-xl">
            {(question2Config[question1] ?? question2DefaultConfig).question}
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {(question2Config[question1] ?? question2DefaultConfig).options.map((option) => (
              <ScanOptionButton key={option} onClick={() => setQuestion2(option)}>
                {option}
              </ScanOptionButton>
            ))}
            <ScanCustomOptionInput
              value={customQuestion2}
              onChange={setCustomQuestion2}
              onSubmit={() => {
                setQuestion2(customQuestion2.trim());
                setCustomQuestion2('');
              }}
            />
          </div>
        </div>
      )}

      {question1 && question2 && !question3 && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton
            onClick={() => {
              setQuestion2('');
              setCustomQuestion2('');
              setQuestion3('');
              setCustomQuestion3('');
              setQuestion4('');
              setCustomQuestion4('');
            }}
          />

          <p className="pt-2 font-semibold md:text-xl">
            {(question3Config[question2] ?? question3DefaultConfig).question}
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {(question3Config[question2] ?? question3DefaultConfig).options.map((option) => (
              <ScanOptionButton key={option} onClick={() => setQuestion3(option)}>
                {option}
              </ScanOptionButton>
            ))}

            <ScanCustomOptionInput
              value={customQuestion3}
              onChange={setCustomQuestion3}
              onSubmit={() => {
                setQuestion3(customQuestion3.trim());
                setCustomQuestion3('');
              }}
            />
          </div>
        </div>
      )}

      {question1 && question2 && question3 && !question4 && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton
            onClick={() => {
              setQuestion3('');
              setCustomQuestion3('');
              setQuestion4('');
              setCustomQuestion4('');
            }}
          />

          <p className="pt-2 font-semibold md:text-xl">
            {(question4Config[question2]?.[question3] ?? question4DefaultConfig).question}
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {(question4Config[question2]?.[question3] ?? question4DefaultConfig).options.map((option) => (
              <ScanOptionButton key={option} onClick={() => setQuestion4(option)}>
                {option}
              </ScanOptionButton>
            ))}

            <ScanCustomOptionInput
              value={customQuestion4}
              onChange={setCustomQuestion4}
              onSubmit={() => {
                setQuestion4(customQuestion4.trim());
                setCustomQuestion4('');
              }}
            />
          </div>
        </div>
      )}

      {question1 && question2 && question3 && question4 && !result && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton
            disabled={isLoading}
            onClick={() => {
              setQuestion4('');
              setCustomQuestion4('');
              setMessage('');
            }}
          />

          <p className="pt-2 font-semibold md:text-xl">Вставьте текст подозрительного сообщения</p>

          <div className="flex flex-col gap-3 pt-2">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();

                  if (message.trim() && !isLoading) {
                    handleScanSituation();
                  }
                }
              }}
              placeholder="Например: Ваша карта заблокирована. Срочно перейдите по ссылке..."
              className="min-h-40 resize-none rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)] p-4 transition-colors duration-300 outline-none placeholder:text-sm focus:border-[var(--main-color)] focus-visible:outline-none md:placeholder:text-base"
            />

            <ScanScreenshotInput screenshots={screenshots} setScreenshots={setScreenshots} isLoading={isLoading} />
          </div>

          <button
            type="button"
            disabled={!(message.trim() || screenshots.length > 0) || isLoading}
            onClick={handleScanSituation}
            className={`mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)] py-4 focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none ${
              !(message.trim() || screenshots.length > 0) || isLoading
                ? 'cursor-not-allowed opacity-40'
                : 'cursor-pointer transition-colors duration-300 hover:bg-[var(--element-hover-color)]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--main-color-20)] border-t-[var(--main-color)]" />

                <span className="text-sm md:text-base">Проверяем...</span>
              </>
            ) : (
              <span className="text-sm md:text-base">Проверить сообщение</span>
            )}
          </button>
          {error && <p className="pt-3 text-center text-sm text-red-500">{error}</p>}
        </div>
      )}

      {result && !isLoading && (
        <div className="mx-auto max-w-xl pt-5">
          <div className="flex flex-col gap-3">
            {result.flaggedLinks.length > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10">
                <div className="border-b border-red-500/10 px-4 py-3">
                  <h3 className="font-semibold text-red-400 md:text-xl">
                    Google Safe Browsing обнаружил небезопасные ссылки
                  </h3>
                </div>

                <div className="flex flex-col divide-y divide-red-500/10">
                  {result.flaggedLinks.map((flaggedLink) => (
                    <div key={flaggedLink} className="px-4 py-4">
                      <p className="text-sm leading-relaxed break-all text-red-300 md:text-base">{flaggedLink}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.riskLevel && typeof result.riskPercentage === 'number' && (
              <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)] p-4">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold md:text-xl">{result.riskLevel}</span>

                    <span className="text-2xl font-bold md:text-5xl">{result.riskPercentage}%</span>
                  </div>

                  <div className="w-full rounded-full border border-[var(--main-color-20)]">
                    <div
                      className={`h-4 rounded-full ${
                        result.riskLevel === 'Критический риск'
                          ? 'bg-purple-600'
                          : result.riskLevel === 'Высокий риск'
                            ? 'bg-red-500'
                            : result.riskLevel === 'Средний риск'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                      }`}
                      style={{ width: `${result.riskPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {result.warningSigns.length > 0 && (
              <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
                <div className="border-b border-[var(--main-color-10)] px-4 py-3">
                  <h3 className="font-semibold md:text-xl">Тревожные признаки</h3>
                </div>

                <div className="flex flex-col divide-y divide-[var(--main-color-10)]">
                  {result.warningSigns.map((riskFactor) => (
                    <div key={riskFactor} className="px-4 py-4">
                      <p className="text-sm leading-relaxed sm:text-base">{riskFactor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.fraudScheme && (
              <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
                <div className="border-b border-[var(--main-color-10)] px-4 py-3">
                  <h3 className="font-semibold md:text-xl">Возможная схема мошенничества</h3>
                </div>

                <div className="px-4 py-4">
                  <div className="flex flex-col gap-3">
                    {result.fraudScheme.title && (
                      <h4 className="font-semibold sm:text-lg">{result.fraudScheme.title}</h4>
                    )}

                    {result.fraudScheme.description && (
                      <p className="text-sm leading-relaxed sm:text-base">{result.fraudScheme.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result.psychologicalManipulations.length > 0 && (
              <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
                <div className="border-b border-[var(--main-color-10)] px-4 py-3">
                  <h3 className="font-semibold md:text-xl">Психологические манипуляции</h3>
                </div>

                <div className="flex flex-col divide-y divide-[var(--main-color-10)]">
                  {result.psychologicalManipulations.map((manipulation) => (
                    <div key={manipulation} className="px-4 py-4">
                      <p className="text-sm leading-relaxed sm:text-base">{manipulation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
                <div className="border-b border-[var(--main-color-10)] px-4 py-3">
                  <h3 className="font-semibold md:text-xl">Рекомендации</h3>
                </div>

                <div className="flex flex-col divide-y divide-[var(--main-color-10)]">
                  {result.recommendations.map((recommendation, index) => (
                    <div key={recommendation} className="px-4 py-4">
                      <p className="text-sm leading-relaxed sm:text-base">
                        {index + 1}. {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={resetForm}
              className="cursor-pointer rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)] py-4 transition-colors duration-300 hover:bg-[var(--element-hover-color)] focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none"
            >
              <span className="text-sm md:text-base">Проверить другое сообщение</span>
            </button>
          </div>
        </div>
      )}

      {!result && scanSituationHistoryItems.length > 0 && (
        <div className="section-spacing mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--main-color-10)] px-4 py-3">
              <h2 className="font-semibold md:text-xl">История проверок</h2>

              <button
                type="button"
                disabled={isLoading}
                onClick={clearScanSituationHistoryItems}
                className={`text-sm focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none ${
                  isLoading
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer transition-colors duration-300 hover:text-[var(--text-hover-color)]'
                }`}
              >
                Очистить
              </button>
            </div>

            <div className="flex flex-col divide-y divide-[var(--main-color-10)]">
              {scanSituationHistoryItems.map((scanSituationHistoryItem) => {
                const isOpened = openedHistoryItemId === scanSituationHistoryItem.id;

                return (
                  <div key={scanSituationHistoryItem.id}>
                    <button
                      type="button"
                      onClick={() => setOpenedHistoryItemId(isOpened ? null : scanSituationHistoryItem.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-300 hover:bg-[var(--element-hover-color)] focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none"
                    >
                      <div>
                        <p className="font-semibold">{scanSituationHistoryItem.result.riskLevel}</p>

                        {scanSituationHistoryItem.createdAt && (
                          <p className="pt-1 text-sm text-[var(--main-color-60)]">
                            {formatScanCheckDate(scanSituationHistoryItem.createdAt)}
                          </p>
                        )}

                        <p className="max-w-[147px] pt-1 text-sm leading-relaxed text-[var(--main-color-60)] md:max-w-none">
                          {scanSituationHistoryItem.question1} · {scanSituationHistoryItem.question2} ·{' '}
                          {scanSituationHistoryItem.question3} · {scanSituationHistoryItem.question4}
                        </p>
                      </div>

                      <span className="text-lg">{scanSituationHistoryItem.result.riskPercentage}%</span>
                    </button>

                    {isOpened && (
                      <div className="px-4">
                        <div className="border-t border-[var(--main-color-10)]" />

                        <div className="flex flex-col gap-4 py-4">
                          {scanSituationHistoryItem.message && (
                            <div>
                              <p className="text-sm font-semibold">Сообщение</p>

                              <div className="pt-2">
                                <p className="text-sm leading-relaxed text-[var(--main-color-60)]">
                                  {scanSituationHistoryItem.message}
                                </p>
                              </div>
                            </div>
                          )}

                          {scanSituationHistoryItem.result.flaggedLinks.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold">Небезопасные ссылки</p>

                              <div className="flex flex-col gap-2 pt-2">
                                {scanSituationHistoryItem.result.flaggedLinks.map((flaggedLink) => (
                                  <p key={flaggedLink} className="text-sm leading-relaxed text-[var(--main-color-60)]">
                                    {flaggedLink}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {scanSituationHistoryItem.result.warningSigns.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold">Тревожные признаки</p>

                              <div className="flex flex-col gap-2 pt-2">
                                {scanSituationHistoryItem.result.warningSigns.map((riskFactor) => (
                                  <p key={riskFactor} className="text-sm leading-relaxed text-[var(--main-color-60)]">
                                    {riskFactor}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {scanSituationHistoryItem.result.fraudScheme && (
                            <div>
                              <p className="text-sm font-semibold">Возможная схема мошенничества</p>

                              <div className="flex flex-col gap-2 pt-2">
                                {scanSituationHistoryItem.result.fraudScheme.title && (
                                  <p className="text-sm leading-relaxed text-[var(--main-color-60)]">
                                    {scanSituationHistoryItem.result.fraudScheme.title}
                                  </p>
                                )}

                                {scanSituationHistoryItem.result.fraudScheme.description && (
                                  <p className="text-sm leading-relaxed text-[var(--main-color-60)]">
                                    {scanSituationHistoryItem.result.fraudScheme.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {scanSituationHistoryItem.result.psychologicalManipulations.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold">Психологические манипуляции</p>

                              <div className="flex flex-col gap-2 pt-2">
                                {scanSituationHistoryItem.result.psychologicalManipulations.map((manipulation) => (
                                  <p key={manipulation} className="text-sm leading-relaxed text-[var(--main-color-60)]">
                                    {manipulation}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {scanSituationHistoryItem.result.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold">Рекомендации</p>

                              <div className="flex flex-col gap-2 pt-2">
                                {scanSituationHistoryItem.result.recommendations.map((recommendation, index) => (
                                  <p
                                    key={recommendation}
                                    className="text-sm leading-relaxed text-[var(--main-color-60)]"
                                  >
                                    {index + 1}. {recommendation}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ScanSection;
