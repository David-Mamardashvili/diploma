import { ArrowLeft } from 'lucide-react';

type ScanBackButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

function ScanBackButton({ onClick, disabled = false }: ScanBackButtonProps) {
  return (
    <button
      type="button"
      aria-label="Назад"
      onClick={onClick}
      disabled={disabled}
      className={`group rounded-2xl border border-[var(--border)] bg-[var(--element-background)] p-3 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none ${
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer transition-colors duration-300 hover:bg-[var(--hover)]'
      }`}
    >
      <ArrowLeft
        className={`h-5 w-5 ${
          disabled ? '' : 'transition-transform duration-300 ease-out group-hover:-translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default ScanBackButton;
