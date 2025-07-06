import { Button } from "@components/actions/Button.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { CardHTML } from "@components/containers/card/presets/CardHTML.tsx";
import { CardJSON } from "@components/containers/card/presets/CardJSON.tsx";
import { CardPDF } from "@components/containers/card/presets/DisplayPDF.tsx";
import { InputField } from "@components/forms/inputs/InputField.tsx";
import type { Option } from "@components/forms/selects/Option.tsx";
import { SelectField } from "@components/forms/selects/SelectField.tsx";
import { EliActService } from "@features/eli/EliActService.ts";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useCallback, useState } from "react";

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

  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    onSubmit({ publisher, year, position });
  }, [publisher, year, position, onSubmit]);

  const publisherOptions: Option<EliActService.Publisher>[] = [
    { label: "Dziennik Ustaw (DU)", value: "DU" },
  ];

  return (
    <Card label="Act form">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          id="publisher"
          label="Publisher"
          options={publisherOptions}
          value={publisher}
          onValueChange={(value) => setPublisher(value)}
        />
        <InputField
          type="number"
          id="year"
          label="Year"
          value={year}
          onValueChange={(value) => setYear(parseInt(value))}
        />
        <InputField
          type="number"
          id="position"
          label="Position"
          value={position}
          onValueChange={(value) => setPosition(parseInt(value))}
        />
        <Button type="submit" className="h-8">
          Load act
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
