function Header() {
  const navItems = [
    { label: 'Как работает', href: '#how-it-works' },
    { label: 'Преимущества', href: '#advantages' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Начать проверку', href: '#scan' },
  ];

  return (
    <header className="markup-layout pt-[15px]">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm md:justify-start">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="transition-colors duration-300 hover:text-blue-600 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Header;
