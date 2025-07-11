import { Button } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { StatusBarrier } from "@components/utility/StatusBarrier.tsx";
import { useTheme } from "@features/ux/theme/ThemeProvider.tsx";
import { useQuery } from "@tanstack/react-query";
import type { Nil } from "@utilities/common.ts";
import cx from "clsx";
import prettier from "prettier";
import html from "prettier/plugins/html";
import { type MouseEvent, useCallback, useEffect, useMemo } from "react";
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
          <Icon name="Download" className="w-4 h-4" />
        </Button>
        <div className="relative">
          <Button
            variant="text"
            className="h-6 w-6 opacity-50 hover:opacity-100"
            onClick={handleCopy}
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
          >
            <Icon name="Clipboard" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
