import type { Nil } from "@utilities/common.ts";
import { saveToFile } from "@utilities/saveToFile.tsx";
import clsx from "clsx";
import { type MouseEvent, useCallback, useMemo } from "react";
import { IconButton } from "../../../actions/IconButton.tsx";
import { Text } from "../../../typography/Text.tsx";
import { Card } from "../Card.tsx";

export interface CardTextProps {
  className?: string;
  content: Nil<string>;
}

export const CardText = ({ className, content }: CardTextProps) => {
  const asString = useMemo(() => content ?? "", [content]);
  const lines = useMemo(() => asString.split("\n"), [asString]);

  const handleCopy = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    navigator.clipboard.writeText(asString);
  }, [asString]);

  const handleSave = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    saveToFile(asString, "txt");
  }, [asString]);

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
      <div className="absolute h-full w-full">
        <div className="relative h-full w-full overflow-auto px-2 py-1 bg-primary-3">
          {lines.map((line, index) => (
            <Text key={index} className="block whitespace-pre-wrap break-words">
              {line}
            </Text>
          ))}
        </div>
      </div>
    </Card>
  );
};
