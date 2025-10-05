import type { Nil } from "@utilities/common.ts";
import { memo } from "react";
import { CardCode } from "./CardCode.tsx";

export interface CardJSONProps {
  className?: string;
  content: Nil<object>;
}

export const CardJSON = memo(function CardJSON({ content, ...props }: CardJSONProps) {
  return <CardCode {...props} content={JSON.stringify(content, null, 2)} language="JSON" />;
});
