export type Theme = 'light' | 'dark' | 'system';


export function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
    return savedTheme;
  }

  return 'system';
}

export function getActiveTheme(): 'light' | 'dark' {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

export function applyTheme(theme: Theme) {
  const activeTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
      : theme;

  document.documentElement.classList.remove(activeTheme === 'light' ? 'dark' : 'light');
  document.documentElement.classList.add(activeTheme);
  localStorage.setItem('theme', theme);
}