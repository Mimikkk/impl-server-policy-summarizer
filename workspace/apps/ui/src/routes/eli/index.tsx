import { DisplayHTML } from "@components/displays/DisplayHTML.tsx";
import { DisplayJSON } from "@components/displays/DisplayJSON.tsx";
import { DisplayPDF } from "@components/displays/DisplayPDF.tsx";
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

const createEliActHTMLOptions = ({
  publisher,
  year,
  position,
}: EliActService.ActParameters) =>
  queryOptions({
    queryKey: ["eli", publisher, year, position, "html"],
    queryFn: () => EliActService.html({ publisher, year, position }).then((file) => file.text()),
  });

const createEliActPDFOptions = ({
  publisher,
  year,
  position,
}: EliActService.ActParameters) =>
  queryOptions({
    queryKey: ["eli", publisher, year, position, "pdf"],
    queryFn: () => EliActService.pdfUrl({ publisher, year, position }),
  });

const DU20210001: EliActService.ActParameters = { publisher: "DU", year: 2021, position: 1 };

function RouteComponent() {
  const { data: act } = useQuery(createEliActOptions(DU20210001));
  const { data: actHTML } = useQuery(createEliActHTMLOptions(DU20210001));
  const { data: actPdfUrl } = useQuery(createEliActPDFOptions(DU20210001));

  return (
    <div className="flex flex-col gap-4">
      <DisplayJSON className="h-[200px] container" content={act} />
      <DisplayHTML className="h-[200px] container" content={actHTML} />
      <DisplayPDF className="h-[200px] container" url={actPdfUrl} />
    </div>
  );
}
