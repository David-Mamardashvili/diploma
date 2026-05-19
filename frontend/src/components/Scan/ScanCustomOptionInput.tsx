import { ArrowRight } from 'lucide-react';

type ScanCustomInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

function ScanCustomOptionInput({ value, onChange, onSubmit }: ScanCustomInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && value.trim()) {
            onSubmit();
          }
        }}
        placeholder="Свой вариант ответа"
        className="w-full rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)] py-4 pr-14 pl-4 transition-colors duration-300 outline-none placeholder:text-sm focus:border-[var(--main-color)] focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none md:placeholder:text-base"
      />

      <button
        type="button"
        aria-label="Продолжить"
        disabled={!value.trim()}
        onClick={onSubmit}
        className={`group absolute top-1/2 right-4 -translate-y-1/2 focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none ${
          !value.trim() ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
        }`}
      >
        <ArrowRight
          className={`h-5 w-5 ${
            !value.trim() ? '' : 'transition-transform duration-300 ease-out group-hover:translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default ScanCustomOptionInput;
