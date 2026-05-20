import { Upload } from 'lucide-react';

const MAX_SCREENSHOT_SIZE = 50 * 1024 * 1024;

type ScanScreenshotInputProps = {
  screenshots: File[];
  setScreenshots: React.Dispatch<React.SetStateAction<File[]>>;
  isLoading: boolean;
};

function ScanScreenshotInput({ screenshots, setScreenshots, isLoading }: ScanScreenshotInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className={`flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[var(--main-color-20)] bg-[var(--element-background-color)] p-4 ${
          isLoading
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer transition-colors duration-300 hover:bg-[var(--element-hover-color)]'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={isLoading}
          className="hidden"
          onChange={(event) => {
            const newFiles = Array.from(event.target.files || []);

            const hasLargeFile = newFiles.some((file) => file.size > MAX_SCREENSHOT_SIZE);

            if (hasLargeFile) {
              alert('Размер изображения не должен превышать 50 MB');
              event.target.value = '';

              return;
            }

            setScreenshots((currentScreenshots) => {
              const uniqueNewFiles = newFiles.filter(
                (newFile) =>
                  !currentScreenshots.some(
                    (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size,
                  ),
              );

              return [...currentScreenshots, ...uniqueNewFiles].slice(-3);
            });

            event.target.value = '';
          }}
        />

        {screenshots.length === 0 ? (
          <span className="text-sm md:text-base">Добавить скриншоты (до 3)</span>
        ) : (
          <div className="truncate text-base text-[var(--main-color-60)]">
            {screenshots.map((screenshot) => screenshot.name).join(', ')}
          </div>
        )}

        <div className="flex items-center gap-3">
          {screenshots.length > 0 && (
            <button
              type="button"
              disabled={isLoading}
              onClick={(event) => {
                event.preventDefault();
                setScreenshots([]);
              }}
              className={`text-sm ${
                isLoading
                  ? 'cursor-not-allowed opacity-40'
                  : 'cursor-pointer transition-colors duration-300 hover:text-[var(--text-hover-color)]'
              }`}
            >
              Очистить
            </button>
          )}

          {screenshots.length === 0 && <Upload size={20} />}
        </div>
      </label>
    </div>
  );
}

export default ScanScreenshotInput;
