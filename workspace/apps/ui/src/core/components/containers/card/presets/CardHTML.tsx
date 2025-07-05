import type { Nil } from "@utilities/common.ts";
import { memo } from "react";
import { CardCode } from "./CardCode.tsx";

export interface CardHTMLProps {
  className?: string;
  content: Nil<string>;
}

export const CardHTML = memo(function CardHTML(props: CardHTMLProps) {
  return <CardCode {...props} language="HTML" />;
});
