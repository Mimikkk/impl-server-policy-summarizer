import { StatusBarrier } from "@components/utility/StatusBarrier.tsx";
import { useTheme } from "@features/ux/theme/ThemeProvider.tsx";
import { useQuery } from "@tanstack/react-query";
import type { Nil } from "@utilities/common.ts";
import { saveToFile } from "@utilities/saveToFile.tsx";
import clsx from "clsx";
import prettier from "prettier";
import html from "prettier/plugins/html";
import { type MouseEvent, useCallback, useEffect, useMemo } from "react";
import { codeToHtml } from "shiki";
import { IconButton } from "../../../actions/IconButton.tsx";
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

  let timeoutId: Nil<number> = null;
  const handleCopy = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    navigator.clipboard.writeText(asString);
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
    <Card
      compact
      className={clsx(className, "h-full")}
      maxizable
      slots={useMemo(() => ({
        icons: [
          <IconButton
            key="save"
            onClick={handleSave}
            title="Save to file"
            aria-label="Save to file"
            name="Download"
          />,
          <IconButton
            key="copy"
            onClick={handleCopy}
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
            name="Clipboard"
          />,
        ],
      }), [handleSave, handleCopy])}
    >
      <StatusBarrier status={status} error={<Text color="error">Failed to display code</Text>}>
        <div className="absolute h-full w-full">
          <div className="relative h-full w-full">
            <div
              className="contents [&>.shiki]:whitespace-pre-wrap [&>.shiki]:px-2 [&>.shiki]:py-1 [&>.shiki]:rounded-sm [&>.shiki]:wrap-break-word [&>.shiki]:h-full [&>.shiki]:overflow-auto"
              dangerouslySetInnerHTML={{ __html: code ?? "" }}
            />
          </div>
        </div>
      </StatusBarrier>
    </Card>
  );
};
