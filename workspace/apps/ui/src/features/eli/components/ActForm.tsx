import { Button } from "@components/actions/Button.tsx";
import { SelectField } from "@components/forms/selects/SelectField.tsx";
import type { EliClient } from "@features/eli/EliClient.ts";
import type { PublisherResource } from "@features/eli/resources/PublisherResource.ts";
import type { YearItemResource } from "@features/eli/resources/YearResource.ts";
import type { Nil } from "@utilities/common.ts";
import { type FormEvent, useCallback, useState } from "react";
import { defineUseOptions, useEliPublisher, useEliPublishers, useEliYear } from "../hooks/eli.hooks.ts";

const usePublisherOptions = defineUseOptions<PublisherResource>({
  valueBy: (publisher) => publisher.code,
  labelBy: (publisher) => `${publisher.code}: ${publisher.name} (acts: ${publisher.actsCount})`,
});

const PublisherSelect = ({
  value,
  onValueChange,
}: {
  value: string | null;
  onValueChange: (value: string | null) => void;
}) => {
  const { data: publishers, isSuccess: isPublishersSuccess, isLoading: isPublishersLoading } = useEliPublishers();
  const publisherOptions = usePublisherOptions(publishers);

  return (
    <SelectField
      id="publisher"
      label="Publisher"
      options={publisherOptions}
      value={value}
      onValueChange={onValueChange}
      disabled={!isPublishersSuccess || isPublishersLoading}
    />
  );
};

const useYearOptions = defineUseOptions<number>({
  valueBy: (year) => `${year}`,
  labelBy: (year) => `${year}`,
  sortBy: (a, b) => b - a,
});

const YearSelect = (
  { publisherId, value, onValueChange }: {
    publisherId: Nil<string>;
    value: string | null;
    onValueChange: (value: string | null) => void;
  },
) => {
  const { data: publisher, isSuccess: isPublisherSuccess, isLoading: isPublisherLoading } = useEliPublisher(
    publisherId,
  );
  const yearOptions = useYearOptions(publisher?.years);

  return (
    <SelectField
      id="year"
      label="Year"
      options={yearOptions}
      value={value}
      onValueChange={onValueChange}
      disabled={!isPublisherSuccess || isPublisherLoading}
    />
  );
};

const useActOptions = defineUseOptions<YearItemResource>({
  valueBy: (item) => `${item.pos}`,
  labelBy: (item) => `${item.promulgation} - ${item.pos}: ${item.title}`,
  sortBy: (a, b) => b.pos - a.pos,
});

const ActSelect = ({
  publisherId,
  yearId,
  value,
  onValueChange,
}: {
  publisherId: string | null;
  yearId: string | null;
  value: string | null;
  onValueChange: (value: string | null) => void;
}) => {
  const { data: year, isSuccess: isYearSuccess, isLoading: isYearLoading } = useEliYear(
    publisherId,
    yearId ? +yearId : null,
  );
  const positionOptions = useActOptions(year?.items);

  return (
    <SelectField
      id="position"
      label="Position"
      options={positionOptions}
      value={value}
      onValueChange={onValueChange}
      disabled={!isYearSuccess || isYearLoading}
    />
  );
};

export function ActForm({ onSubmit }: { onSubmit: (params: EliClient.ActParams) => void }) {
  const [publisherId, setPublisherId] = useState<string | null>(null);
  const [yearId, setYearId] = useState<string | null>(null);
  const [positionId, setPositionId] = useState<string | null>(null);

  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    if (!publisherId || !yearId || !positionId) return;

    onSubmit({ publisher: publisherId, year: +yearId, position: +positionId });
  }, [publisherId, yearId, positionId, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <PublisherSelect value={publisherId} onValueChange={setPublisherId} />
      <YearSelect publisherId={publisherId} value={yearId} onValueChange={setYearId} />
      <ActSelect publisherId={publisherId} yearId={yearId} value={positionId} onValueChange={setPositionId} />
      <Button type="submit">
        Load act
      </Button>
    </form>
  );
}
