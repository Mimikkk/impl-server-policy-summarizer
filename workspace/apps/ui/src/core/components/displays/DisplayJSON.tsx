import type { Nil } from "@utilities/common.ts";
import { memo } from "react";
import { DisplayCode } from "./DisplayCode.tsx";

export interface DisplayJSONProps {
  className?: string;
  content: Nil<object>;
}
export const DisplayJSON = memo(function DisplayJSON({ className, content }: DisplayJSONProps) {
  return <DisplayCode className={className} content={JSON.stringify(content, null, 2)} language="JSON" />;
});
