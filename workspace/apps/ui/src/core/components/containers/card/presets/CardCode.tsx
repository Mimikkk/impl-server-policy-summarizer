import { Button } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { StatusBarrier } from "@components/utility/StatusBarrier.tsx";
import { useTheme } from "@features/ux/theme/ThemeProvider.tsx";
import { Transition } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import type { Nil } from "@utilities/common.ts";
import cx from "clsx";
import { Clipboard, Download } from "lucide-react";
import prettier from "prettier";
import html from "prettier/plugins/html";
import { type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { codeToHtml } from "shiki";
import { saveToFile } from "../../../../utilities/saveToFile.tsx";
import { Text } from "../../../typography/Text.tsx";
import { Card } from "../Card.tsx";

const createCodeQueryOptions = (content: string, theme: "dark" | "light", language: "HTML" | "JSON") => ({
  queryKey: ["code", theme, content],
  queryFn: async () => {
    if (language === "HTML") {
      return codeToHtml(
        await prettier.format(content, { parser: "html", plugins: [html], printWidth: 120, tabWidth: 2 }),
        { lang: "html", theme: theme === "dark" ? "vitesse-dark" : "vitesse-light" },
      );
    }

    return codeToHtml(content, { lang: "json", theme: theme === "dark" ? "vitesse-dark" : "vitesse-light" });
  },
});

export interface CardCodeProps {
  className?: string;
  content: Nil<string>;
  language: "HTML" | "JSON";
}

export const CardCode = ({ className, content, language }: CardCodeProps) => {
  const { theme } = useTheme();
  const asString = useMemo(() => content ?? "", [content]);
  const { data: code = "", status } = useQuery(createCodeQueryOptions(asString, theme, language));
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  let timeoutId: Nil<number> = null;
  const handleCopy = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    navigator.clipboard.writeText(asString).then(() => {
      setShowCopiedTooltip(true);

      timeoutId = setTimeout(() => setShowCopiedTooltip(false), 1000);
    });
  }, [asString]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [timeoutId]);

  const handleSave = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    saveToFile(asString, language.toLowerCase());
  }, [asString, language]);

  return (
    <Card compact className={cx("relative", className)}>
      <StatusBarrier
        status={status}
        error={<Text color="error">Failed to display code</Text>}
      >
        <div className="max-h-full overflow-auto rounded-sm">
          <div
            className=" [&_.shiki]:overflow-auto [&_.shiki]:whitespace-pre-wrap [&_.shiki]:break-words"
            dangerouslySetInnerHTML={{ __html: code ?? "" }}
          />
        </div>
      </StatusBarrier>
      <div className="absolute top-3 right-3 flex gap-2 items-center">
        <Button
          variant="text"
          className="h-6 w-6 opacity-50 hover:opacity-100"
          onClick={handleSave}
          title="Save to file"
          aria-label="Save to file"
        >
          <Icon className="w-4 h-4" icon={Download} />
        </Button>
        <div className="relative">
          <Button
            variant="text"
            className="h-6 w-6 opacity-50 hover:opacity-100"
            onClick={handleCopy}
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
          >
            <Icon className="w-4 h-4" icon={Clipboard} />
          </Button>
          <Transition
            show={showCopiedTooltip}
            enter="transition-all duration-300 ease-out"
            enterFrom="opacity-0 scale-75"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-200 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-75"
          >
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-secondary-2 border border-secondary-3 text-xs px-2 py-0.5 rounded whitespace-nowrap">
              Copied!
            </div>
          </Transition>
        </div>
      </div>
    </Card>
  );
};
