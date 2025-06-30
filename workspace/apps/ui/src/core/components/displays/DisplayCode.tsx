import { Button } from "@components/actions/Button.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { StatusBarrier } from "@components/utility/StatusBarrier.tsx";
import { useTheme } from "@features/ux/theme/ThemeProvider.tsx";
import { useQuery } from "@tanstack/react-query";
import type { Nil } from "@utilities/common.ts";
import cx from "clsx";
import { Clipboard } from "lucide-react";
import prettier from "prettier";
import html from "prettier/plugins/html";
import { type MouseEvent, useCallback, useMemo } from "react";
import { codeToHtml } from "shiki";
import { Card } from "../containers/Card.tsx";
import { DisplayError } from "../typography/DisplayError.tsx";

export interface DisplayCodeProps {
  className?: string;
  content: Nil<string>;
  language: "HTML" | "JSON";
}

const createCodeQueryOptions = (content: string, theme: "dark" | "light", language: "HTML" | "JSON") => ({
  queryKey: ["code", theme, content],
  queryFn: async () => {
    if (language === "HTML") {
      return codeToHtml(
        await prettier.format(content, { parser: "html", plugins: [html] }),
        { lang: "html", theme: theme === "dark" ? "vitesse-dark" : "vitesse-light" },
      );
    }

    return codeToHtml(content, { lang: "json", theme: theme === "dark" ? "vitesse-dark" : "vitesse-light" });
  },
});

export const DisplayCode = ({ className, content, language }: DisplayCodeProps) => {
  const { theme } = useTheme();
  const asString = useMemo(() => content ?? "", [content]);
  const { data: code = "", status } = useQuery(createCodeQueryOptions(asString, theme, language));

  const handleCopy = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    return navigator.clipboard.writeText(asString);
  }, [asString]);

  return (
    <Card className={cx("relative", className)}>
      <StatusBarrier
        status={status}
        error={<DisplayError theme={theme}>Failed to display code</DisplayError>}
      >
        <div className="max-h-full overflow-auto rounded-sm">
          <div
            className=" [&_.shiki]:overflow-auto [&_.shiki]:whitespace-pre-wrap [&_.shiki]:break-words"
            dangerouslySetInnerHTML={{ __html: code ?? "" }}
          />
        </div>
      </StatusBarrier>
      <Button
        variant="text"
        className="absolute top-3 right-3 h-6 w-6 opacity-50 hover:opacity-100"
        onClick={handleCopy}
        title="Copy to clipboard"
        aria-label="Copy to clipboard"
      >
        <Icon className="w-4 h-4" icon={Clipboard} />
      </Button>
    </Card>
  );
};
