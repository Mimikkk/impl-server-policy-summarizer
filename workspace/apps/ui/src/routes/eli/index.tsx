import { Button } from "@components/actions/Button.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { CardPDF } from "@components/containers/card/presets/DisplayPDF.tsx";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { memo, useState } from "react";
import { CardHTML } from "../../core/components/containers/card/presets/CardHTML.tsx";
import { CardJSON } from "../../core/components/containers/card/presets/CardJSON.tsx";
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

const Field = memo(function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col gap-2">
      <label
        htmlFor={id}
        className="absolute -top-1.5 left-2 text-xs px-1 rounded-xs bg-primary-2 text-primary-11"
      >
        {label}
      </label>
      {children}
    </div>
  );
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
    <Card label="Act Form">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="publisher" label="Publisher">
          <select
            id="publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value as EliActService.Publisher)}
            className="
            px-3 py-2 border 
            bg-primary-2
            border-primary-6 focus-within:border-primary-7 active:border-primary-7 hover:border-primary-8
            rounded-xs
            disabled:opacity-50
            "
          >
            <option value="DU">Dziennik Ustaw (DU)</option>
          </select>
        </Field>

        <Field id="year" label="Year">
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            className="
            px-3 py-2 border 
            bg-primary-2
            border-primary-6 focus-within:border-primary-7 active:border-primary-7 hover:border-primary-8
            rounded-xs
            disabled:opacity-50
            "
          />
        </Field>

        <Field id="position" label="Position">
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
            className="
            px-3 py-2 border 
            bg-primary-2
            border-primary-6 focus-within:border-primary-7 active:border-primary-7 hover:border-primary-8
            rounded-xs
            disabled:opacity-50
            "
          />
        </Field>

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
        <CardJSON className="h-[400px] container" content={actDetails} />
        <CardHTML className="h-[400px] container" content={actHtml} />
        <CardPDF className="h-[600px] col-span-1 md:col-span-2 lg:col-span-2 container" url={actPdfUrl} />
      </div>
    </div>
  );
}
