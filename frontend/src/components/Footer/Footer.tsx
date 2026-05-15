function Footer() {
  return (
    <footer className="section-spacing mt-auto">
      <div className="markup-layout flex flex-col gap-4 border-t border-[var(--main-color-10)] py-8">
        <p className="text-sm uppercase">© {new Date().getFullYear()} Антимошенник</p>
        <p className="max-w-3xl text-xs leading-relaxed text-[var(--secondary-text-color)]">
          Сервис носит рекомендательный характер и предназначен для предварительного анализа подозрительных сообщений с
          использованием технологий искусственного интеллекта.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
