import { ThemeButton } from "@components/actions/ThemeButton.tsx";
import { StatusBarrier } from "@components/utility/StatusBarrier.tsx";
import { useQuery } from "@tanstack/react-query";
import { type Nil } from "@utilities/common.ts";
import cx from "clsx";
import { codeToHtml } from "shiki";
import { DisplayError } from "../../core/components/typography/DisplayError.tsx";
import { DisplayText } from "../../core/components/typography/DisplayText.tsx";
import { ThemeProvider, useTheme } from "../ux/theme/ThemeProvider.tsx";

export interface DisplayJSONProps {
  className?: string;
  content: Nil<object>;
}

export const DisplayJSON = (props: DisplayJSONProps) => (
  <ThemeProvider storage="json-theme">
    <Content {...props} />
  </ThemeProvider>
);

const createJSONQueryOptions = (content: Nil<object>, theme: "dark" | "light") => ({
  queryKey: ["html", theme, content],
  queryFn: () =>
    codeToHtml(
      JSON.stringify(content, null, 2),
      { lang: "json", theme: theme === "dark" ? "vitesse-dark" : "vitesse-light" },
    ),
});

const Content = ({ className, content }: DisplayJSONProps) => {
  const { mode, theme, setNextMode } = useTheme();
  const { data: html = "", status } = useQuery(createJSONQueryOptions(content, theme));

  console.log(status);

  return (
    <div
      className={cx(
        "relative rounded-sm border border-accent-5 active:border-accent-4 hover:border-accent-4 overflow-auto",
        theme === "dark" ? "bg-neutral-light" : "bg-primary-dark",
        className,
      )}
    >
      <StatusBarrier
        status={status}
        error={<DisplayError theme={theme}>Failed to display JSON</DisplayError>}
        loading={<DisplayText theme={theme}>Loading...</DisplayText>}
      >
        <div className="overflow-auto">
          <div
            className=" [&_.shiki]:overflow-auto [&_.shiki]:whitespace-pre-wrap [&_.shiki]:break-words"
            dangerouslySetInnerHTML={{ __html: html ?? "" }}
          />
        </div>
      </StatusBarrier>
      <ThemeButton
        variant={theme === "dark" ? "text" : "text-light"}
        className="absolute top-0 right-0"
        theme={theme}
        mode={mode}
        onClick={setNextMode}
      />
    </div>
  );
};
