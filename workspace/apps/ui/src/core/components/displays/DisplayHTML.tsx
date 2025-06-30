import type { Nil } from "@utilities/common.ts";
import { memo } from "react";
import { DisplayCode } from "./DisplayCode.tsx";

export interface DisplayHTMLProps {
  className?: string;
  content: Nil<string>;
}

export const DisplayHTML = memo(function DisplayHTML(props: DisplayHTMLProps) {
  return <DisplayCode {...props} language="HTML" />;
});
