import { DisplayJSON } from "@features/eli/DisplayJSON.tsx";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
  });

const DU20210001: EliActService.ActParameters = { publisher: "DU", year: 2021, position: 1 };

function RouteComponent() {
  const { data: act } = useQuery(createEliActOptions(DU20210001));

  return (
    <div>
      <DisplayJSON className="h-[200px] max-w-lg" content={act} />
    </div>
  );
}
