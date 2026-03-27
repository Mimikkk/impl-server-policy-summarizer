import type { Nil } from "@utilities/common.ts";
import { saveToFile } from "@utilities/saveToFile.ts";
import clsx from "clsx";
import { type MouseEvent, useCallback, useMemo } from "react";
import { IconButton } from "../../../actions/IconButton.tsx";
import { Icon } from "../../../badges/Icon.tsx";
import { Text } from "../../../typography/Text.tsx";
import { type Status, StatusBarrier } from "../../../utility/StatusBarrier.tsx";
import { Card } from "../Card.tsx";

export interface CardTextProps {
  className?: string;
  content: Nil<string>;
  status?: Nil<Status>;
}

export const CardText = ({ className, content, status }: CardTextProps) => {
  const asString = useMemo(() => content ?? "", [content]);
  const lines = useMemo(() => asString.split("\n"), [asString]);

  const handleCopy = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      navigator.clipboard.writeText(asString);
    },
    [asString],
  );

  const handleSave = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      saveToFile(asString, "txt");
    },
    [asString],
  );

  return (
    <Card
      compact
      className={clsx(className, "h-full")}
      maxizable
      slots={useMemo(
        () => ({
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
        }),
        [handleSave, handleCopy],
      )}
    >
      <StatusBarrier
        status={status}
        error={
          <div className="!text-danger-5 flex items-center gap-2">
            <Icon name="TriangleAlert" className="!text-danger-5" />
            Failed to load the text.
          </div>
        }
      >
        <div className="absolute h-full w-full">
          <div className="relative h-full w-full overflow-auto bg-primary-3 px-2 py-1">
            {lines.map((line, index) => (
              <Text key={index} className="block break-words whitespace-pre-wrap">
                {line}
              </Text>
            ))}
          </div>
        </div>
      </StatusBarrier>
    </Card>
  );
};
