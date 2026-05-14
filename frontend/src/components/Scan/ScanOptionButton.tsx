type ScanOptionButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

function ScanOptionButton({ children, onClick }: ScanOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-[var(--main-color-20)] bg-[var(--element-background-color)] py-4 transition-colors duration-300 hover:bg-[var(--element-hover-color)] focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none"
    >
      <span className="text-sm md:text-base">{children}</span>
    </button>
  );
}

export default ScanOptionButton;
