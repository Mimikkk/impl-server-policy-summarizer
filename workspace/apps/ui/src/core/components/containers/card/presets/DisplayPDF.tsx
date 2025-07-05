import { useBlobUrl } from "@hooks/useBlobUrl.ts";
import type { Nil } from "@utilities/common.ts";
import { AlertCircle } from "lucide-react";
import { memo } from "react";
import { Icon } from "../../../badges/Icon.tsx";
import { StatusBarrier } from "../../../utility/StatusBarrier.tsx";
import { Card } from "../Card.tsx";

export interface CardPDFProps {
  className?: string;
  url: Nil<string>;
}

export const CardPDF = memo(function CardPDF({ className, url }: CardPDFProps) {
  const { data: pdfUrl, status } = useBlobUrl(url);

  return (
    <Card className={className} center>
      <StatusBarrier
        status={status}
        error={
          <div className="flex items-center gap-2 !text-danger-5">
            <Icon icon={AlertCircle} className="!text-danger-5" />
            Failed to load PDF.
          </div>
        }
      >
        <iframe
          src={pdfUrl!}
          width="100%"
          height="100%"
          title={`PDF Document - ${url}`}
        />
      </StatusBarrier>
    </Card>
  );
});
