import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { memo, useEffect, useMemo } from "react";

export interface DisplayPDFProps {
  className?: string;
  url: string;
}

export const DisplayPDF = memo(function DisplayPDF({ className, url }: DisplayPDFProps) {
  const { data: blob, isLoading, isError, error } = useQuery({
    queryKey: ["pdf", url],
    queryFn: async () => await ky.get(url).blob(),
  });

  const pdfUrl = useMemo(() => {
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }, [blob]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className || ""}`}>
        <div className="text-lg">Loading PDF...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`flex items-center justify-center h-96 ${className || ""}`}>
        <div className="text-red-500 text-lg">{error.message}</div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className={`flex items-center justify-center h-96 ${className || ""}`}>
        <div className="text-lg">No PDF available</div>
      </div>
    );
  }

  return (
    <iframe
      src={pdfUrl}
      width="100%"
      height="600px"
      className={className}
      title={`PDF Document - ${url}`}
    />
  );
});
