import { useState } from 'react';
import ScanOptionButton from './ScanOptionButton';
import ScanBackButton from './ScanBackButton';

function ScanSection() {
  type ScanSituationPayload = {
    channel: string;
    sender: string;
    message: string;
  };

  type ScanSituationResult = {
    riskLevel: string;
    riskPercentage: number;
    riskFactors: string[];
    recommendations: string[];
  };

  type ScanSituationHistoryItem = {
    id: string;
    channel: string;
    sender: string;
    message: string;
    result: ScanSituationResult;
    createdAt: string;
  };

  const channels = [
    'Мессенджер',
    'Социальная сеть',
    'Телефонный звонок',
    'SMS-сообщение',
    'Электронная почта',
    'Торговая площадка',
    'Другое',
  ];

  const senders = [
    'Знакомый человек',
    'Незнакомый человек',
    'Банк',
    'Госорган',
    'Служба поддержки',
    'Интернет-магазин',
    'Социальная сеть',
    'Курьерская служба',
    'Мобильный оператор',
    'Работодатель',
  ];

  async function scanSituation(payload: ScanSituationPayload): Promise<ScanSituationResult> {
    const response = await fetch('http://localhost:3001/scan-situation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Ошибка анализа');
    }

    return response.json();
  }

  async function handleScanSituation() {
    try {
      setIsLoading(true);

      const result = await scanSituation({
        channel,
        sender,
        message,
      });

      setResult(result);

      const scanSituationHistoryItem: ScanSituationHistoryItem = {
        id: crypto.randomUUID(),
        channel,
        sender,
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
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<ScanSituationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openedHistoryItemId, setOpenedHistoryItemId] = useState<string | null>(null);

  const resetForm = () => {
    setChannel('');
    setSender('');
    setMessage('');
    setResult(null);
  };

  return (
    <section id="scan" className="markup-layout section-spacing">
      <h2 className="text-center text-3xl font-bold md:text-6xl">
        Проверьте сообщение
        <br />
        <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-blue-600 bg-clip-text text-transparent">
          на мошенничество
        </span>
        <br />с помощью AI
      </h2>

      {!channel && (
        <div className="mx-auto max-w-xl pt-5">
          <div className="flex flex-col gap-[14px]">
            <div className="mx-auto h-[2px] w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="mx-auto h-[2px] w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="mx-auto h-[2px] w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <p className="pt-5 font-semibold md:text-xl">От кого вы получили это сообщение?</p>

          <div className="flex flex-col gap-3 pt-2">
            {channels.map((channel) => (
              <ScanOptionButton key={channel} onClick={() => setChannel(channel)}>
                {channel}
              </ScanOptionButton>
            ))}
          </div>
        </div>
      )}

      {channel && !sender && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton onClick={() => setChannel('')} />

          <p className="pt-2 font-semibold md:text-xl">От кого вы получили это сообщение?</p>

          <div className="flex flex-col gap-3 pt-2">
            {senders.map((sender) => (
              <ScanOptionButton key={sender} onClick={() => setSender(sender)}>
                {sender}
              </ScanOptionButton>
            ))}
          </div>
        </div>
      )}

      {channel && sender && !result && (
        <div className="mx-auto max-w-xl pt-5">
          <ScanBackButton
            disabled={isLoading}
            onClick={() => {
              setSender('');
              setMessage('');
            }}
          />

          <p className="pt-2 font-semibold md:text-xl">Вставьте текст подозрительного сообщения</p>

          <div className="flex flex-col gap-6 pt-2">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Например: Ваша карта заблокирована. Срочно перейдите по ссылке..."
              className="min-h-40 resize-none rounded-2xl border border-[var(--border)] bg-[var(--element-background)] p-4 transition-colors duration-300 outline-none placeholder:text-sm focus:border-white focus-visible:outline-none md:placeholder:text-base"
            />
            <button
              type="button"
              disabled={!message.trim() || isLoading}
              onClick={handleScanSituation}
              className={`flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--element-background)] py-4 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none ${
                !message.trim() || isLoading
                  ? 'cursor-not-allowed opacity-40'
                  : 'cursor-pointer transition-colors duration-300 hover:bg-[var(--hover)]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-white" />

                  <span className="text-sm md:text-base">Проверяем...</span>
                </>
              ) : (
                <span className="text-sm md:text-base">Проверить сообщение</span>
              )}
            </button>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <div className="mx-auto max-w-xl pt-5">
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--element-background)] p-4">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold md:text-xl">{result.riskLevel}</span>
                  <span className="text-2xl font-bold md:text-5xl">{result.riskPercentage}%</span>
                </div>

                <div className="w-full rounded-full border border-[var(--border)]">
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

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--element-background)]">
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="font-semibold md:text-xl">Обнаруженные признаки</h3>
              </div>

              <div className="flex flex-col divide-y divide-white/10">
                {result.riskFactors.map((riskFactor) => (
                  <div key={riskFactor} className="px-4 py-4">
                    <p className="text-sm leading-relaxed sm:text-base">{riskFactor}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--element-background)]">
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="font-semibold md:text-xl">Итоговая рекомендация</h3>
              </div>

              <div className="flex flex-col divide-y divide-white/10">
                {result.recommendations.map((recommendation) => (
                  <div key={recommendation} className="px-4 py-4">
                    <p className="text-sm leading-relaxed sm:text-base">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!message.trim() || isLoading}
              onClick={resetForm}
              className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--element-background)] py-4 transition-colors duration-300 hover:bg-[var(--hover)] focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
            >
              <span className="text-sm md:text-base">Проверить другое сообщение</span>
            </button>
          </div>
        </div>
      )}

      {!result && scanSituationHistoryItems.length > 0 && (
        <div className="section-spacing mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--element-background)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <h2 className="font-semibold md:text-xl">История проверок</h2>

              <button
                type="button"
                disabled={isLoading}
                onClick={clearScanSituationHistoryItems}
                className={`text-sm focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none ${
                  isLoading
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer transition-colors duration-300 hover:text-blue-600'
                }`}
              >
                Очистить
              </button>
            </div>

            <div className="flex flex-col divide-y divide-white/10">
              {scanSituationHistoryItems.map((scanSituationHistoryItem) => {
                const isOpened = openedHistoryItemId === scanSituationHistoryItem.id;

                return (
                  <div key={scanSituationHistoryItem.id}>
                    <button
                      type="button"
                      onClick={() => setOpenedHistoryItemId(isOpened ? null : scanSituationHistoryItem.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-300 hover:bg-[var(--hover)] focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
                    >
                      <div>
                        <p className="font-semibold">{scanSituationHistoryItem.result.riskLevel}</p>

                        <p className="max-w-[147px] pt-1 text-sm leading-relaxed text-white/60 md:max-w-none">
                          {scanSituationHistoryItem.channel} · {scanSituationHistoryItem.sender}
                        </p>
                      </div>

                      <span className="text-lg">{scanSituationHistoryItem.result.riskPercentage}%</span>
                    </button>

                    {isOpened && (
                      <div className="flex flex-col gap-4 border-t border-white/10 px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold">Сообщение</p>
                          <p className="pt-2 text-sm leading-relaxed text-white/60">
                            {scanSituationHistoryItem.message}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">Обнаруженные признаки</p>
                          <div className="flex flex-col gap-2 pt-2">
                            {scanSituationHistoryItem.result.riskFactors.map((riskFactor) => (
                              <p key={riskFactor} className="text-sm leading-relaxed text-white/60">
                                {riskFactor}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">Рекомендации</p>
                          <div className="flex flex-col gap-2 pt-2">
                            {scanSituationHistoryItem.result.recommendations.map((recommendation) => (
                              <p key={recommendation} className="text-sm leading-relaxed text-white/60">
                                {recommendation}
                              </p>
                            ))}
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
