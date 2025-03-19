import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export const useDarkMode = () => {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "system"
  );

  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const setThemeClass = (currentTheme: Theme) => {
    const isDark =
      currentTheme === "dark" || (currentTheme === "system" && prefersDarkMode);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    setThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        setThemeClass("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setSystemTheme = () => {
    setTheme("system");
    localStorage.setItem("theme", "system");
  };

  return { theme, isDark: theme === "dark", toggleTheme, setSystemTheme };
};
