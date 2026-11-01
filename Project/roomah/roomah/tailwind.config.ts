import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./pages/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--foreground))",

        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",

        link: "hsl(var(--link))",
        "link-foreground": "hsl(var(--link-foreground))",

        muted: "hsl(var(--surface-1))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        destructive: "hsl(var(--destructive))",

        sidebar: "hsl(var(--sidebar))",
        "sidebar-foreground": "hsl(var(--sidebar-foreground))",

        "chart-1": "hsl(var(--chart-1))",
        "chart-2": "hsl(var(--chart-2))",
        "chart-3": "hsl(var(--chart-3))",
        "chart-4": "hsl(var(--chart-4))",
        "chart-5": "hsl(var(--chart-5))",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, hsl(var(--hero-from)), hsl(var(--hero-to)))",
        "footer-gradient":
          "linear-gradient(180deg, hsl(var(--footer-from)), hsl(var(--footer-to)))",
      },
      borderColor: { DEFAULT: "hsl(var(--border))" },
      ringColor: { DEFAULT: "hsl(var(--ring))" },
    },
  },
  plugins: [],
} satisfies Config;
