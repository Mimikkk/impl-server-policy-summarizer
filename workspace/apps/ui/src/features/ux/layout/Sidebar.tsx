import { IconButton } from "@components/actions/IconButton.tsx";
import { Text } from "@components/typography/Text.tsx";
import { Icon, type IconName } from "@core/components/badges/Icon.tsx";
import { Param } from "@hooks/useLocalStorage.ts";
import { Link, useRouterState } from "@tanstack/react-router";
import cx from "clsx";
import { memo, useCallback, useEffect, useState } from "react";

const sidebarOpenParam = Param.boolean({ key: "sidebar-open" });

interface NavLink {
  to: string;
  label: string;
  icon: IconName;
}

const links: NavLink[] = [
  { to: "/eli", label: "ELI", icon: "BookOpen" },
  { to: "/translations", label: "Translations", icon: "Languages" },
  { to: "/playground", label: "Playground", icon: "Wrench" },
];

export const Sidebar = memo(function Sidebar() {
  const [isOpen, setIsOpen] = sidebarOpenParam.use();
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const state = useRouterState();
  const currentPath = state.location.pathname;

  useEffect(() => {
    if (isOpen) {
      setInternalIsOpen(true);
    } else {
      const timer = setTimeout(() => {
        setInternalIsOpen(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleSidebar = useCallback(() => {
    setIsOpen((x) => !x);
  }, []);

  return (
    <div className="contents">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={cx(
          "@container fixed left-0 top-0 h-full bg-primary-2 border-r border-primary-6 shadow-lg z-50",
          "flex flex-col gap-4 py-4 transition-all duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isOpen ? "w-48" : "md:w-16 w-48",
        )}
      >
        <div
          className={cx(
            "flex items-center gap-2 px-3 pb-2 border-primary-6",
            isOpen ? "justify-between" : "justify-center",
          )}
        >
          {internalIsOpen && (
            <Text className="font-semibold text-primary-12 text-sm truncate @max-[65px]:hidden">
              Navigation
            </Text>
          )}
          <IconButton
            name={isOpen ? "PanelLeftClose" : "PanelLeftOpen"}
            onClick={toggleSidebar}
            title={isOpen ? "Close sidebar" : "Open sidebar"}
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            className="shrink-0"
          />
        </div>
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {links.map((item) => {
            const isActive = currentPath.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cx(
                  "flex items-center gap-2 px-3 py-2 rounded-sm",
                  "hover:bg-primary-4 active:bg-primary-5",
                  "border border-transparent",
                  isActive &&
                    "bg-primary-3 text-primary-11 border-primary-7 hover:bg-primary-4 active:bg-primary-5 shadow-sm",
                  !isActive && "text-primary-11 hover:text-primary-12",
                  !isOpen && "justify-center md:px-2",
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon name={item.icon} className="text-secondary-12 shrink-0" />
                {internalIsOpen && (
                  <span className="truncate font-medium text-sm @max-[65px]:hidden">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      {!isOpen && (
        <div className="fixed top-4 left-4 z-30 md:hidden">
          <IconButton
            name="Menu"
            onClick={toggleSidebar}
            title="Open sidebar"
            aria-label="Open sidebar"
            className="shadow-lg"
          />
        </div>
      )}
    </div>
  );
});
