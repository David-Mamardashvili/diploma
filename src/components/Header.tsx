function Header() {
  const navItems = ['Как работает', 'Преимущества', 'FAQ'];

  return (
    <header className="markup-layout pt-[15px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--element-background)] px-4 py-3 md:px-6">
        <span className="text-xs font-semibold tracking-wide md:text-sm">Diploma Project</span>

        <nav className="hidden md:flex md:gap-2 md:text-sm">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="rounded-2xl px-3 py-2 transition-colors duration-300 hover:bg-[var(--hover)] focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="cursor-pointer rounded-2xl bg-blue-600/50 px-3 py-2 text-xs font-semibold tracking-wide text-white transition-transform duration-300 hover:scale-103 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none md:px-4 md:text-sm"
        >
          Начать проверку
        </button>
      </div>
    </header>
  );
}

export default Header;
