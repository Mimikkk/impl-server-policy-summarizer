import { CardHTML } from "@components/containers/card/presets/CardHTML.tsx";
import { CardJSON } from "@components/containers/card/presets/CardJSON.tsx";
import { CardPDF } from "@components/containers/card/presets/DisplayPDF.tsx";
import { ActForm } from "@features/eli/components/ActForm.tsx";
import { EliClient } from "@features/eli/EliClient.ts";
import { useEliAct, useEliActHTMLString } from "@features/eli/hooks/eli.hooks.ts";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/eli/")({ component: RouteComponent });

function RouteComponent() {
  const [actParams, setActParams] = useState<EliClient.ActParams>({
    publisher: "DU",
    year: 2021,
    position: 1,
  });

  const { data: actDetails } = useEliAct(actParams);
  const { data: actHtml } = useEliActHTMLString(actParams);
  const pdfUrl = EliClient.pdfUrl(actParams);

  return (
    <div className="flex flex-col gap-2 items-center">
      <ActForm onSubmit={setActParams} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 container items-center w-full">
        <CardPDF className="h-[600px] col-span-1 md:col-span-2 lg:col-span-2 container" url={pdfUrl} />
        <CardJSON className="h-[400px] container" content={actDetails} />
        <CardHTML className="h-[400px] container" content={actHtml} />
      </div>
    </div>
  );
}
