import { Button } from "@components/actions/Button.tsx";
import { Card } from "@components/containers/Card.tsx";
import { DisplayHTML } from "@components/displays/DisplayHTML.tsx";
import { DisplayJSON } from "@components/displays/DisplayJSON.tsx";
import { DisplayPDF } from "@components/displays/DisplayPDF.tsx";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EliActService } from "../../features/eli/EliActService.ts";

export const Route = createFileRoute("/eli/")({
  component: RouteComponent,
});

const createEliActOptions = ({
  publisher,
  year,
  position,
}: EliActService.ActParameters) =>
  queryOptions({
    queryKey: ["eli", publisher, year, position],
    queryFn: () => EliActService.details({ publisher, year, position }),
    enabled: !!publisher && !!year && !!position,
  });

const createEliActHTMLOptions = ({
  publisher,
  year,
  position,
}: EliActService.ActParameters) =>
  queryOptions({
    queryKey: ["eli", publisher, year, position, "html"],
    queryFn: () => EliActService.html({ publisher, year, position }).then((file) => file.text()),
    enabled: !!publisher && !!year && !!position,
  });

const createEliActPDFOptions = ({
  publisher,
  year,
  position,
}: EliActService.ActParameters) =>
  queryOptions({
    queryKey: ["eli", publisher, year, position, "pdf"],
    queryFn: () => EliActService.pdfUrl({ publisher, year, position }),
    enabled: !!publisher && !!year && !!position,
  });

function ActForm({ onSubmit }: { onSubmit: (params: EliActService.ActParameters) => void }) {
  const [publisher, setPublisher] = useState<EliActService.Publisher>("DU");
  const [year, setYear] = useState<number>(2021);
  const [position, setPosition] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ publisher, year, position });
  };

  return (
    <Card className="p-8 container" label="Act Form">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative flex flex-col gap-2">
          <label
            htmlFor="publisher"
            className="absolute -top-2 left-2 text-xs text-primary-7 bg-secondary-light px-2 rounded-sm"
          >
            Publisher
          </label>
          <select
            id="publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value as EliActService.Publisher)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-secondary-light text-primary-dark"
          >
            <option value="DU" className="bg-secondary-light text-primary-dark">Dziennik Ustaw (DU)</option>
          </select>
        </div>

        <div className="relative flex flex-col gap-2">
          <label
            htmlFor="year"
            className="absolute -top-2 left-2 text-xs text-primary-7 bg-secondary-light px-2 py-0.5 rounded-sm"
          >
            Year
          </label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative flex flex-col gap-2">
          <label
            htmlFor="position"
            className="absolute -top-2 left-2 text-xs text-primary-7 bg-secondary-light px-2 py-0.5 rounded-sm"
          >
            Position
          </label>
          <input
            id="position"
            type="number"
            value={position}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value < 1) {
                setPosition(1);
              } else {
                setPosition(value);
              }
            }}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          type="submit"
          className="h-8"
        >
          Load Act
        </Button>
      </form>
    </Card>
  );
}

function RouteComponent() {
  const [actParams, setActParams] = useState<EliActService.ActParameters>({
    publisher: "DU",
    year: 2021,
    position: 1,
  });

  const { data: actDetails } = useQuery(createEliActOptions(actParams));
  const { data: actHtml } = useQuery(createEliActHTMLOptions(actParams));
  const { data: actPdfUrl } = useQuery(createEliActPDFOptions(actParams));

  return (
    <div className="flex flex-col gap-6 items-center py-4 min-h-screen">
      <ActForm onSubmit={setActParams} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 container items-center flex-1 w-full">
        <DisplayJSON className="h-[400px] container" content={actDetails} />
        <DisplayHTML className="h-[400px] container" content={actHtml} />
        <DisplayPDF className="h-[600px] col-span-1 md:col-span-2 lg:col-span-2 container" url={actPdfUrl} />
      </div>
    </div>
  );
}
