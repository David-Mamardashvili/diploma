type ScanOptionButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

function ScanOptionButton({ children, onClick }: ScanOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--element-background)] py-4 transition-colors duration-300 hover:bg-[var(--hover)] focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
    >
      <span className="text-sm md:text-base">{children}</span>
    </button>
  );
}

export default ScanOptionButton;
