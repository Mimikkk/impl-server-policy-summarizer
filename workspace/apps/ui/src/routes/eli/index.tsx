import { Button } from "@components/actions/Button.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { CardHTML } from "@components/containers/card/presets/CardHTML.tsx";
import { CardJSON } from "@components/containers/card/presets/CardJSON.tsx";
import { CardPDF } from "@components/containers/card/presets/DisplayPDF.tsx";
import { SelectField } from "@components/forms/selects/SelectField.tsx";
import { Text } from "@components/typography/Text.tsx";
import { EliActService } from "@features/eli/EliActService.ts";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Nil } from "@utilities/common.ts";
import { type FormEvent, useCallback, useMemo, useState } from "react";

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

const createEliPublishersOptions = () =>
  queryOptions({
    queryKey: ["eli", "publishers"],
    queryFn: EliActService.publishers,
  });

const useEliPublishers = () => useQuery(createEliPublishersOptions());

const createEliPublisherOptions = (publisherId: Nil<string>) =>
  queryOptions({
    queryKey: ["eli", publisherId, "years"],
    queryFn: () => EliActService.publisher({ publisher: publisherId! }),
    enabled: !!publisherId,
  });

const useEliPublisher = (publisherId: Nil<string>) => useQuery(createEliPublisherOptions(publisherId));

const createEliYearOptions = (publisherId: Nil<string>, year: Nil<number>) =>
  queryOptions({
    queryKey: ["eli", "publisher", publisherId, "year", year, "acts"],
    queryFn: () => EliActService.year({ publisher: publisherId!, year: year! }),
    enabled: !!publisherId && !!year,
  });

const useEliYear = (publisherId: Nil<string>, year: Nil<number>) => useQuery(createEliYearOptions(publisherId, year));

const useEliPublishersOptions = () => {
  const { data: publishers, isSuccess, isLoading } = useEliPublishers();

  const options = useMemo(() =>
    publishers?.map((publisher) => ({
      value: publisher.code,
      label: `${publisher.code}: ${publisher.name} (acts: ${publisher.actsCount})`,
    })) ?? [], [publishers]);

  return { publishers, options, isSuccess, isLoading };
};

const useEliPublisherYearOptions = (publisherId: Nil<string>) => {
  const { data: publisher, isSuccess, isLoading } = useEliPublisher(publisherId);

  const options = useMemo(() =>
    publisher?.years.sort((a, b) => b - a).map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })) ?? [], [publisher]);

  return { publisher, options, isSuccess, isLoading };
};

const useEliYearActsOptions = (publisherId: Nil<string>, yearId: Nil<number>) => {
  const { data: year, isSuccess, isLoading } = useEliYear(publisherId, yearId);

  const options = useMemo(() =>
    year?.items.sort((a, b) => b.pos - a.pos).map((item) => ({
      value: item.pos.toString(),
      label: `${item.pos}: ${item.title}`,
    })) ?? [], [year]);

  return { year, options, isSuccess, isLoading };
};

function ActForm({ onSubmit }: { onSubmit: (params: EliActService.ActParameters) => void }) {
  const [publisherStr, setPublisher] = useState<string | null>(null);
  const [yearStr, setYear] = useState<string | null>(null);
  const [positionStr, setPosition] = useState<string | null>(null);

  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    if (!publisherStr || !yearStr || !positionStr) return;

    onSubmit({ publisher: publisherStr, year: +yearStr, position: +positionStr });
  }, [publisherStr, yearStr, positionStr, onSubmit]);

  const { publishers, options: publisherOptions, isSuccess: isPublishersSuccess, isLoading: isPublishersLoading } =
    useEliPublishersOptions();

  const { publisher, options: yearOptions, isSuccess: isYearSuccess, isLoading: isYearLoading } =
    useEliPublisherYearOptions(
      publisherStr,
    );

  const { year, options: actOptions, isSuccess: isActSuccess, isLoading: isActLoading } = useEliYearActsOptions(
    publisherStr,
    yearStr ? +yearStr : null,
  );

  const isYearDisabled = useMemo(() => !isYearSuccess || isYearLoading, [isYearSuccess, isYearLoading]);

  const isPositionDisabled = useMemo(() => !isActSuccess || isActLoading, [isActSuccess, isActLoading]);

  return (
    <Card label="Act form" className="grid grid-cols-3 gap-2 container">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          id="publisher"
          label="Publisher"
          options={publisherOptions}
          value={publisherStr}
          onValueChange={setPublisher}
          disabled={!isPublishersSuccess || isPublishersLoading}
        />
        <SelectField
          id="year"
          label="Year"
          options={yearOptions}
          value={yearStr}
          onValueChange={setYear}
          disabled={isYearDisabled}
        />
        <SelectField
          id="position"
          label="Position"
          options={actOptions}
          value={positionStr}
          onValueChange={setPosition}
          disabled={isPositionDisabled}
        />
        <Button type="submit" className="h-8">
          Load act
        </Button>
      </form>
      <div className="flex flex-col gap-1 col-span-2">
        <Text>
          Available publishers: {publishers?.map((publisher) => publisher.code).join(", ")}
        </Text>
        <Text>
          Available years: {publisher?.years.map((year) => year).join(", ")}
        </Text>
      </div>
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
        <CardPDF className="h-[600px] col-span-1 md:col-span-2 lg:col-span-2 container" url={actPdfUrl} />
        <CardJSON className="h-[400px] container" content={actDetails} />
        <CardHTML className="h-[400px] container" content={actHtml} />
      </div>
    </div>
  );
}
