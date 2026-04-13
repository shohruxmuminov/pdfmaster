import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
export type ColorTheme = 
  | "blue" | "red" | "green" | "yellow" | "purple" | "orange" 
  | "pink" | "teal" | "cyan" | "indigo" | "rose" | "fuchsia" 
  | "emerald" | "amber" | "lime" | "sky" | "violet" | "zinc" 
  | "slate" | "stone" | "neutral" | "gray" | "crimson" | "mint";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColor?: ColorTheme;
  storageKey?: string;
  colorStorageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (color: ColorTheme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  colorTheme: "blue",
  setColorTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const colorMap: Record<ColorTheme, string> = {
  blue: "hsl(221.2 83.2% 53.3%)",
  red: "hsl(0 84.2% 60.2%)",
  green: "hsl(142.1 76.2% 36.3%)",
  yellow: "hsl(47.9 95.8% 53.1%)",
  purple: "hsl(262.1 83.3% 57.8%)",
  orange: "hsl(24.6 95% 53.1%)",
  pink: "hsl(330.4 81.2% 47.3%)",
  teal: "hsl(173.4 80.4% 40%)",
  cyan: "hsl(189 94% 43%)",
  indigo: "hsl(239 84% 67%)",
  rose: "hsl(346.8 77.2% 49.8%)",
  fuchsia: "hsl(292 84% 61%)",
  emerald: "hsl(141 79% 46%)",
  amber: "hsl(38 92% 50%)",
  lime: "hsl(84 81% 44%)",
  sky: "hsl(199 89% 48%)",
  violet: "hsl(258 90% 66%)",
  zinc: "hsl(240 5% 65%)",
  slate: "hsl(215 14% 34%)",
  stone: "hsl(28 14% 34%)",
  neutral: "hsl(0 0% 45%)",
  gray: "hsl(220 9% 46%)",
  crimson: "hsl(348 83% 47%)",
  mint: "hsl(160 84% 39%)"
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColor = "blue",
  storageKey = "vite-ui-theme",
  colorStorageKey = "vite-ui-color",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [colorTheme, setColorTheme] = useState<ColorTheme>(
    () => (localStorage.getItem(colorStorageKey) as ColorTheme) || defaultColor
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const colorValue = colorMap[colorTheme];
    root.style.setProperty("--primary", colorValue);
    root.style.setProperty("--ring", colorValue);
    
    if (["yellow", "amber", "lime"].includes(colorTheme)) {
      root.style.setProperty("--primary-foreground", "oklch(0.145 0 0)");
    } else {
      root.style.setProperty("--primary-foreground", "oklch(0.985 0 0)");
    }
    
    root.setAttribute("data-theme", colorTheme);
  }, [colorTheme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    colorTheme,
    setColorTheme: (color: ColorTheme) => {
      localStorage.setItem(colorStorageKey, color);
      setColorTheme(color);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
