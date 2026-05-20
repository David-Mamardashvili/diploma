import { useEffect, useState } from 'react';
import { getInitialTheme, getActiveTheme, applyTheme, type Theme } from '../../utils/theme';
import { Sun, Moon, Monitor } from 'lucide-react';

function Header() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  const [activeTheme, setActiveTheme] = useState(getActiveTheme());

  function toggleTheme() {
    const nextTheme = activeTheme === 'light' ? 'dark' : 'light';

    setTheme(nextTheme);
    setActiveTheme(nextTheme);
    applyTheme(nextTheme);
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');

    function handleSystemThemeChange() {
      if (theme === 'system') {
        applyTheme('system');
        setActiveTheme(getActiveTheme());
      }
    }

    media.addEventListener('change', handleSystemThemeChange);

    return () => {
      media.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  return (
    <header className="markup-layout pt-[15px]">
      <div className="flex items-start justify-between">
        <nav className="text-sm">
          <a
            href="#scan"
            className="transition-colors duration-300 hover:text-[var(--text-hover-color)] focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none"
          >
            Начать проверку
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className={`group cursor-pointer rounded-2xl border p-3 transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none ${
              theme !== 'system'
                ? 'border-[var(--text-hover-color)] bg-[var(--element-hover-color)]'
                : 'border-[var(--main-color-20)] bg-[var(--element-background-color)] hover:bg-[var(--element-hover-color)]'
            }`}
          >
            {activeTheme === 'light' ? (
              <Moon className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-rotate-12" />
            ) : (
              <Sun className="h-4 w-4 transition-transform duration-300 ease-out group-hover:rotate-12" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              applyTheme('system');
              setTheme('system');
              setActiveTheme(getActiveTheme());
            }}
            className={`rounded-2xl border p-3 transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-[var(--main-color)] focus-visible:outline-none ${
              theme === 'system'
                ? 'cursor-not-allowed border-[var(--text-hover-color)] bg-[var(--element-hover-color)]'
                : 'cursor-pointer border-[var(--main-color-20)] bg-[var(--element-background-color)] hover:bg-[var(--element-hover-color)]'
            }`}
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
