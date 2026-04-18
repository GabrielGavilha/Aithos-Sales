"use client";

import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AppSidebar, Topbar } from "@/components/crm";
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, ToastStoreProvider, Toaster } from "@/components/ui";
import { LogoutButton } from "@/components/app/LogoutButton";

type AppShellProps = {
  children: ReactNode;
  userName: string;
  workspaceName?: string;
  unreadNotifications: number;
};

const THEME_STORAGE_KEY = "aithos-app-theme";

export const AppShell = ({ children, userName, workspaceName, unreadNotifications }: AppShellProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const appThemeRoot = document.querySelector(".app-theme");
    if (!appThemeRoot) {
      return;
    }

    appThemeRoot.classList.toggle("theme-dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ToastStoreProvider>
      <div className="relative min-h-screen px-4 pb-10 pt-6 sm:px-6 lg:px-10">
        <div className="mx-auto grid w-full max-w-[1540px] gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
          <div className="hidden lg:block">
            <AppSidebar workspaceName={workspaceName} />
          </div>

          <div className="min-w-0 space-y-4">
            <div className="flex items-center justify-between lg:hidden">
              <Button size="icon" variant="secondary" onClick={() => setMobileOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <LogoutButton />
            </div>

            <Topbar
              userName={userName}
              unreadNotifications={unreadNotifications}
              theme={theme}
              onThemeToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            />

            <div className="space-y-4">
              <div className="flex justify-end">
                <LogoutButton />
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <AppSidebar workspaceName={workspaceName} />
          </div>
        </SheetContent>
      </Sheet>

      <Toaster />
    </ToastStoreProvider>
  );
};
