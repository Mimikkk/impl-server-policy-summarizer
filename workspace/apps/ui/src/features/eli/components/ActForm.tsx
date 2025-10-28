import type { EliClient } from "@clients/eli/EliClient.ts";
import type { PublisherResource } from "@clients/eli/resources/PublisherResource.ts";
import type { YearItemResource } from "@clients/eli/resources/YearResource.ts";
import { Button } from "@components/actions/Button.tsx";
import { SelectField } from "@components/forms/selects/SelectField.tsx";
import { IconButton } from "@core/components/actions/IconButton.tsx";
import type { Nil } from "@utilities/common.ts";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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

  const nextYear = useMemo(() => {
    if (!publisherId) return undefined;
    return publisher?.years.find((year) => year > +value!);
  }, [publisherId, value, publisher?.years]);

  const previousYear = useMemo(() => {
    if (!publisherId) return undefined;
    return publisher?.years.find((year) => year < +value!);
  }, [publisherId, value, publisher?.years]);

  const handleNextYear = useCallback(() => {
    if (!nextYear) return;

    onValueChange(nextYear.toString());
  }, [onValueChange, nextYear]);

  const handlePreviousYear = useCallback(() => {
    if (!previousYear) return;

    onValueChange(previousYear.toString());
  }, [onValueChange, previousYear]);

  return (
    <div className="flex items-center gap-2">
      <IconButton
        className="shrink-0"
        color="secondary"
        variant="solid"
        name="ChevronLeft"
        onClick={handlePreviousYear}
        disabled={!isPublisherSuccess || isPublisherLoading || !previousYear}
      />
      <SelectField
        className="flex-1 h-7"
        id="year"
        label="Year"
        options={yearOptions}
        value={value}
        onValueChange={onValueChange}
        disabled={!isPublisherSuccess || isPublisherLoading}
      />
      <IconButton
        className="shrink-0"
        color="secondary"
        variant="solid"
        name="ChevronRight"
        onClick={handleNextYear}
        disabled={!isPublisherSuccess || isPublisherLoading || !nextYear}
      />
    </div>
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

  const nextPosition = useMemo(() => {
    if (!yearId) return undefined;
    return year?.items.find((item) => item.pos > +value!);
  }, [yearId, value, year?.items]);

  const previousPosition = useMemo(() => {
    if (!yearId) return undefined;
    return year?.items.find((item) => item.pos < +value!);
  }, [yearId, value, year?.items]);

  const handlePreviousPosition = useCallback(() => {
    if (!previousPosition) return;

    onValueChange(previousPosition.pos.toString());
  }, [onValueChange, previousPosition]);

  const handleNextPosition = useCallback(() => {
    if (!nextPosition) return;

    onValueChange(nextPosition.pos.toString());
  }, [onValueChange, nextPosition]);

  return (
    <div className="flex items-center gap-2">
      <IconButton
        className="shrink-0"
        color="secondary"
        variant="solid"
        name="ChevronLeft"
        onClick={handlePreviousPosition}
        disabled={!isYearSuccess || isYearLoading || !previousPosition}
      />
      <SelectField
        className="flex-1 h-7"
        id="position"
        label="Position"
        options={positionOptions}
        value={value}
        onValueChange={onValueChange}
        disabled={!isYearSuccess || isYearLoading}
      />
      <IconButton
        className="shrink-0"
        color="secondary"
        variant="solid"
        name="ChevronRight"
        onClick={handleNextPosition}
        disabled={!isYearSuccess || isYearLoading || !nextPosition}
      />
    </div>
  );
};

export function ActForm(
  { values, onSubmit }: { values: Nil<EliClient.ActParams>; onSubmit: (params: EliClient.ActParams) => void },
) {
  const [publisherId, setPublisherId] = useState<string | null>(values?.publisher ?? null);
  const [yearId, setYearId] = useState<string | null>(values?.year.toString() ?? null);
  const [positionId, setPositionId] = useState<string | null>(values?.position.toString() ?? null);

  const handlePublisherChange = useCallback((value: string | null) => {
    setPublisherId(value);
    setYearId(null);
    setPositionId(null);
  }, []);

  const handleYearChange = useCallback((value: string | null) => {
    setYearId(value);
    setPositionId(null);
  }, []);

  const handlePositionChange = useCallback((value: string | null) => {
    setPositionId(value);
  }, []);

  useEffect(() => {
    if (values?.publisher !== publisherId) {
      setPublisherId(values?.publisher ?? null);
    }
    if (values?.year !== +yearId!) {
      setYearId(values?.year.toString() ?? null);
    }
    if (values?.position !== +positionId!) {
      setPositionId(values?.position.toString() ?? null);
    }
  }, [values]);

  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    if (!publisherId || !yearId || !positionId) return;

    onSubmit({ publisher: publisherId, year: +yearId, position: +positionId });
  }, [publisherId, yearId, positionId, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <PublisherSelect value={publisherId} onValueChange={handlePublisherChange} />
      <YearSelect publisherId={publisherId} value={yearId} onValueChange={handleYearChange} />
      <ActSelect publisherId={publisherId} yearId={yearId} value={positionId} onValueChange={handlePositionChange} />
      <Button type="submit" className="w-full">
        Load act
      </Button>
    </form>
  );
}
