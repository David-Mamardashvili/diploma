import { useState } from 'react';
import { channels, senders, senderScenarios, defaultSenderScenario } from './scanQuestions';
import ScanOptionButton from './ScanOptionButton';
import ScanBackButton from './ScanBackButton';
import ScanCustomOptionInput from './ScanCustomOptionInput';
import ScanScreenshotInput from './ScanScreenshotInput';

type ScanSituationText = {
  channel: {
    question: string;
    answer: string;
  };
  sender: {
    question: string;
    answer: string;
  };
  senderScenario: {
    question: string;
    answer: string;
  };
  message: string;
};

type ScanSituationResult = {
  riskLevel: string;
  riskPercentage: number;
  fraudScheme: string;
  riskSigns: string[];
  recommendations: string[];
  flaggedLinks: string[];
  unflaggedLinks: string[];
};

type ScanSituationHistoryItem = {
  id: string;
  channel: string;
  sender: string;
  senderScenario: string;
  message: string;
  result: ScanSituationResult;
  createdAt: string;
};

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
          channel: {
            question: channels.question,
            answer: channel,
          },

          sender: {
            question: senders.question,
            answer: sender,
          },

          senderScenario: {
            question: (senderScenarios[sender] || defaultSenderScenario).question,
            answer: senderScenario,
          },

          message,
        },
        screenshots,
      );

      setResult(result);

      const scanSituationHistoryItem: ScanSituationHistoryItem = {
        id: crypto.randomUUID(),
        channel,
        sender,
        senderScenario,
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
  const [channel, setChannel] = useState('');
  const [customChannel, setCustomChannel] = useState('');
  const [sender, setSender] = useState('');
  const [customSender, setCustomSender] = useState('');
  const [senderScenario, setSenderScenario] = useState('');
  const [customSenderScenario, setCustomSenderScenario] = useState('');
  const [message, setMessage] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [result, setResult] = useState<ScanSituationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openedHistoryItemId, setOpenedHistoryItemId] = useState<string | null>(null);

  const resetForm = () => {
    setChannel('');
    setCustomChannel('');

    setSender('');
    setCustomSender('');

    setSenderScenario('');
    setCustomSenderScenario('');

    setMessage('');
    setScreenshots([]);
    setResult(null);
  };

  return (
    <section id="scan" className="markup-layout section-spacing">
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

      {!channel && (
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
            {channels.options.map((channel) => (
              <ScanOptionButton key={channel} onClick={() => setChannel(channel)}>
                {channel}
              </ScanOptionButton>
            ))}
            <ScanCustomOptionInput
              value={customChannel}
              onChange={setCustomChannel}
              onSubmit={() => {
                setChannel(customChannel.trim());
                setCustomChannel('');
              }}
            />
          </div>
        </div>
      )}

      {channel && !sender && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton
            onClick={() => {
              setChannel('');
              setCustomChannel('');
            }}
          />

          <p className="pt-2 font-semibold md:text-xl">От кого вы получили это сообщение?</p>

          <div className="flex flex-col gap-3 pt-2">
            {senders.options.map((sender) => (
              <ScanOptionButton key={sender} onClick={() => setSender(sender)}>
                {sender}
              </ScanOptionButton>
            ))}
            <ScanCustomOptionInput
              value={customSender}
              onChange={setCustomSender}
              onSubmit={() => {
                setSender(customSender.trim());
                setCustomSender('');
              }}
            />
          </div>
        </div>
      )}

      {channel && sender && !senderScenario && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton
            onClick={() => {
              setSender('');
              setCustomSender('');
              setSenderScenario('');
              setCustomSenderScenario('');
            }}
          />

          <p className="pt-2 font-semibold md:text-xl">{(senderScenarios[sender] || defaultSenderScenario).question}</p>

          <div className="flex flex-col gap-3 pt-2">
            {(senderScenarios[sender] || defaultSenderScenario).options.map((option) => (
              <ScanOptionButton key={option} onClick={() => setSenderScenario(option)}>
                {option}
              </ScanOptionButton>
            ))}

            <ScanCustomOptionInput
              value={customSenderScenario}
              onChange={setCustomSenderScenario}
              onSubmit={() => {
                setSenderScenario(customSenderScenario.trim());
                setCustomSenderScenario('');
              }}
            />
          </div>
        </div>
      )}

      {channel && sender && senderScenario && !result && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton
            disabled={isLoading}
            onClick={() => {
              setSenderScenario('');
              setCustomSenderScenario('');
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
            <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)] p-4">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold md:text-xl">{result.riskLevel}</span>
                  <span className="text-2xl font-bold md:text-5xl">{result.riskPercentage}%</span>
                </div>

                <div className="w-full rounded-full border border-[var(--main-color-20)]">
                  <div
                    className={`h-4 rounded-full ${
                      result.riskLevel === 'Высокий риск'
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

            <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
              <div className="border-b border-[var(--main-color-10)] px-4 py-3">
                <h3 className="font-semibold md:text-xl">Предполагаемая схема</h3>
              </div>

              <div className="px-4 py-4">
                <p className="text-sm leading-relaxed sm:text-base">{result.fraudScheme}</p>
              </div>
            </div>

            {(result.flaggedLinks.length > 0 || result.unflaggedLinks.length > 0) && (
              <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
                <div className="border-b border-[var(--main-color-10)] px-4 py-3">
                  <h3 className="font-semibold md:text-xl">Найденные ссылки</h3>
                </div>

                <div className="flex flex-col divide-y divide-[var(--main-color-10)]">
                  {result.flaggedLinks.map((link) => (
                    <div key={link} className="px-4 py-4">
                      <p className="text-sm leading-relaxed break-all text-red-500 sm:text-base">{link}</p>

                      <p className="pt-2 text-xs text-red-500 sm:text-sm">Выявлена угроза</p>
                    </div>
                  ))}

                  {result.unflaggedLinks.map((link) => (
                    <div key={link} className="px-4 py-4">
                      <p className="text-xs sm:text-sm">Проверка не выявила угроз</p>

                      <p className="pt-2 text-sm leading-relaxed break-all sm:text-base">{link}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
              <div className="border-b border-[var(--main-color-10)] px-4 py-3">
                <h3 className="font-semibold md:text-xl">Обнаруженные признаки</h3>
              </div>

              <div className="flex flex-col divide-y divide-[var(--main-color-10)]">
                {result.riskSigns.map((riskFactor) => (
                  <div key={riskFactor} className="px-4 py-4">
                    <p className="text-sm leading-relaxed sm:text-base">{riskFactor}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)]">
              <div className="border-b border-[var(--main-color-10)] px-4 py-3">
                <h3 className="font-semibold md:text-xl">Итоговая рекомендация</h3>
              </div>

              <div className="flex flex-col divide-y divide-[var(--main-color-10)]">
                {result.recommendations.map((recommendation) => (
                  <div key={recommendation} className="px-4 py-4">
                    <p className="text-sm leading-relaxed sm:text-base">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

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

                        <p className="max-w-[147px] pt-1 text-sm leading-relaxed text-[var(--main-color-60)] md:max-w-none">
                          {scanSituationHistoryItem.channel} · {scanSituationHistoryItem.sender} ·{' '}
                          {scanSituationHistoryItem.senderScenario}
                        </p>
                      </div>

                      <span className="text-lg">{scanSituationHistoryItem.result.riskPercentage}%</span>
                    </button>

                    {isOpened && (
                      <div className="px-4">
                        <div className="border-t border-[var(--main-color-10)]" />

                        <div className="flex flex-col gap-4 py-4">
                          <div>
                            <p className="text-sm font-semibold">Сообщение</p>

                            <p className="pt-2 text-sm leading-relaxed text-[var(--main-color-60)]">
                              {scanSituationHistoryItem.message}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold">Предполагаемая схема</p>

                            <p className="pt-2 text-sm leading-relaxed text-[var(--main-color-60)]">
                              {scanSituationHistoryItem.result.fraudScheme}
                            </p>
                          </div>

                          {(scanSituationHistoryItem.result.flaggedLinks.length > 0 ||
                            scanSituationHistoryItem.result.unflaggedLinks.length > 0) && (
                            <div>
                              <p className="text-sm font-semibold">Ссылки в сообщении</p>

                              <div className="flex flex-col gap-3 pt-2">
                                {scanSituationHistoryItem.result.flaggedLinks.map((link) => (
                                  <div key={link}>
                                    <p className="text-xs font-semibold text-red-500">Выявлена угроза</p>

                                    <p className="pt-1 text-sm leading-relaxed break-all text-red-500">{link}</p>
                                  </div>
                                ))}

                                {scanSituationHistoryItem.result.unflaggedLinks.map((link) => (
                                  <div key={link}>
                                    <p className="text-xs font-semibold">Проверка не выявила угроз</p>

                                    <p className="pt-1 text-sm leading-relaxed break-all text-[var(--main-color-60)]">
                                      {link}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-semibold">Обнаруженные признаки</p>

                            <div className="flex flex-col gap-2 pt-2">
                              {scanSituationHistoryItem.result.riskSigns.map((riskFactor) => (
                                <p key={riskFactor} className="text-sm leading-relaxed text-[var(--main-color-60)]">
                                  {riskFactor}
                                </p>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold">Рекомендации</p>

                            <div className="flex flex-col gap-2 pt-2">
                              {scanSituationHistoryItem.result.recommendations.map((recommendation) => (
                                <p key={recommendation} className="text-sm leading-relaxed text-[var(--main-color-60)]">
                                  {recommendation}
                                </p>
                              ))}
                            </div>
                          </div>
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
