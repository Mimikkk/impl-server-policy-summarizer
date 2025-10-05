import { Button } from "@components/actions/Button.tsx";
import { IconButton } from "@components/actions/IconButton.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { CardHTML } from "@components/containers/card/presets/CardHTML.tsx";
import { CardJSON } from "@components/containers/card/presets/CardJSON.tsx";
import { CardPDF } from "@components/containers/card/presets/CardPDF.tsx";
import { Text } from "@components/typography/Text.tsx";
import { ActForm } from "@features/eli/components/ActForm.tsx";
import { EliClient } from "@features/eli/EliClient.ts";
import { useEliAct, useEliActHTMLString } from "@features/eli/hooks/eli.hooks.ts";
import { createFileRoute } from "@tanstack/react-router";
import { memo, useState } from "react";

const RouteComponent = memo(() => {
  const [actParams, setActParams] = useState<EliClient.ActParams>({
    publisher: "DU",
    year: 2021,
    position: 1,
  });

  const { data: actDetails } = useEliAct(actParams);
  const { data: actHtml } = useEliActHTMLString(actParams);
  const pdfUrl = EliClient.pdfUrl(actParams);

  return (
    <div className="flex flex-col gap-2 items-center h-full">
      <Card label="Act form" className="grid grid-cols-3 gap-2 container">
        <ActForm onSubmit={setActParams} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Button className="gap-1 w-full flex !justify-between">
              <Text ellipsis>
                <Text className="font-semibold not-md:hidden">Aktywnie wybrane:{" "}</Text>
                <Text>{actParams.publisher} {actParams.year} {actParams.position}</Text>
              </Text>
              <IconButton color="primary" compact name="Pin" as="span" />
            </Button>
            <span>
              {Object.entries(actDetails?.references ?? {}).map(([key, value]) =>
                `${key}: ${value.map((v) => v.id).join(", ")}`
              ).join(", ")}
            </span>
            <span>Keywords</span>
          </div>
          <div>Przypięte</div>
        </div>
        <div className="flex flex-col gap-2 justify-between">
          <div>Ostatnio wybrane</div>
          <IconButton name="History" className="gap-1 h-8">Historia przeglądanych</IconButton>
        </div>
      </Card>
      <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 container items-center w-full">
        <CardPDF url={pdfUrl} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2" />
        <CardJSON content={actDetails} />
        <CardHTML content={actHtml} />
      </div>
    </div>
  );
});

export const Route = createFileRoute("/eli/")({ component: RouteComponent });
