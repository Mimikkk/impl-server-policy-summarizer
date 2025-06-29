import { useEffect, useState } from "react";

export const DisplayPDF = (
  { className, url }: { className?: string; url: string },
) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        setPdfUrl(blobUrl);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setError("Failed to load PDF document");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    // Cleanup blob URL on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [url]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className || ""}`}>
        <div className="text-lg">Loading PDF...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className || ""}`}>
        <div className="text-red-500 text-lg">{error}</div>
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
};
