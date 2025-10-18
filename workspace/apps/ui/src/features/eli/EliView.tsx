import { Button } from "@components/actions/Button.tsx";
import { IconButton } from "@components/actions/IconButton.tsx";
import { Icon } from "@components/badges/Icon.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { CardHTML } from "@components/containers/card/presets/CardHTML.tsx";
import { CardJSON } from "@components/containers/card/presets/CardJSON.tsx";
import { CardPDF } from "@components/containers/card/presets/CardPDF.tsx";
import { CardText } from "@components/containers/card/presets/CardText.tsx";
import { Text } from "@components/typography/Text.tsx";
import { For } from "@components/utility/For.tsx";
import { stringifyPdfFile } from "@configs/pdf-js/pdfjs.ts";
import { ActForm } from "@features/eli/components/ActForm.tsx";
import { useEliAct, useEliActHTMLString } from "@features/eli/hooks/eli.hooks.ts";
import { useLocalStorage } from "@hooks/useLocalStorage.ts";
import { useQuery } from "@tanstack/react-query";
import { Fragment, memo, useEffect, useMemo } from "react";
import { EliClient } from "@clients/eli/EliClient.ts";

const isEqual = (a: EliClient.ActParams, b: EliClient.ActParams) =>
  a.publisher === b.publisher && a.year === b.year && a.position === b.position;

const useLocalStorageLatest = () =>
  useLocalStorage<EliClient.ActParams | null>({
    key: "eli-latest",
    deserialize: (value) => value ? JSON.parse(value) : null,
    serialize: (value) => JSON.stringify(value),
  });

const useLocalStorageHistory = () =>
  useLocalStorage<EliClient.ActParams[]>({
    key: "eli-history",
    deserialize: (value) => value ? JSON.parse(value) : [],
    serialize: (value) => JSON.stringify(value),
  });

export const EliView = memo(() => {
  const [history, setHistory] = useLocalStorageHistory();
  const [actParams, setActParams] = useLocalStorageLatest();

  useEffect(() => {
    if (!actParams) return;
    const next = history.filter((params) => !isEqual(params, actParams));
    next.unshift(actParams);

    setHistory(next);
  }, [actParams]);

  const { data: actDetails } = useEliAct(actParams);
  const { data: actHtml } = useEliActHTMLString(actParams);
  const pdfUrl = useMemo(() => actParams ? EliClient.pdfUrl(actParams) : null, [actParams]);

  const references = useMemo(() => Object.entries(actDetails?.references ?? {}), [actDetails?.references]);

  const { data: pdf, status: pdfStatus } = useQuery({
    queryKey: ["pdf", actParams],
    queryFn: async () => await stringifyPdfFile(await EliClient.pdf(actParams!)),
    enabled: !!actParams,
  });

  return (
    <div className="flex flex-col gap-2 items-center h-full">
      <div className="flex flex-col gap-0.5 w-full">
        <Card className="w-full flex items-center gap-1">
          <IconButton name="History" className="w-fit" disabled={history.length === 0}>
            <span className="not-md:hidden">
              {history.length > 0 ? "history" : "No history"}
            </span>
          </IconButton>
          <For each={history.slice(0, 10)} className="flex flex-wrap items-center gap-1 overflow-hidden">
            {(v) => (
              <Button
                color="primary"
                title={`${v.publisher}/${v.year}/${v.position}`}
                key={`${v.publisher}/${v.year}/${v.position}`}
                onClick={() => setActParams(v)}
              >
                <Text ellipsis>{`${v.publisher}/${v.year}/${v.position}`}</Text>
                <IconButton color="secondary" compact name="Pin" as="span" />
                <IconButton
                  color="secondary"
                  compact
                  name="X"
                  as="span"
                  onClick={() =>
                    setHistory(
                      history.filter((h) =>
                        v.publisher !== h.publisher || v.year !== h.year || v.position !== h.position
                      ),
                    )}
                />
              </Button>
            )}
          </For>
          {history.length > 10 && (
            <Button color="primary">
              +{history.length - 10}
              <Icon name="Expand" size="xs" />
            </Button>
          )}
          {actParams && (
            <Button className="ml-auto">
              <Text ellipsis className="gap-1">
                <Text className="font-semibold not-md:hidden">Selected:</Text>
                <Text>{actParams?.publisher}/{actParams?.year}/{actParams?.position}</Text>
              </Text>
              <IconButton color="primary" compact name="Pin" as="span" />
            </Button>
          )}
        </Card>
        <Card className="grid grid-cols-3 gap-2 container">
          <ActForm values={actParams} onSubmit={setActParams} />
          {actParams
            ? (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <span>Keywords:</span>
                    <For each={actDetails?.keywords.slice(0, 3)}>
                      {(keyword) => (
                        <Text
                          title={keyword}
                          ellipsis
                          className="border border-primary-6 rounded-sm px-1 py-0.5 bg-primary-3"
                          key={keyword}
                        >
                          {keyword}
                        </Text>
                      )}
                    </For>
                    {(actDetails?.keywords.length ?? 0) > 3 && (
                      <Button color="primary" compact>
                        +{actDetails!.keywords.length - 3}
                        <Icon name="Expand" size="xs" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span>References:</span>
                  <For
                    each={references}
                    as="dl"
                    className="grid grid-cols-[auto_1fr] gap-1"
                  >
                    {([name, reference]) => (
                      <Fragment key={name}>
                        <dt className="flex gap-1 overflow-hidden">
                          <Text ellipsis light className="grow">{name}</Text>
                          <Text>:</Text>
                        </dt>
                        <dd className="flex flex-wrap items-center gap-1">
                          {reference.slice(0, 3).map((v) => (
                            <Button
                              onClick={() => {
                                const [publisher, year, position] = v.id.split("/");
                                const actParams = { publisher, year: +year, position: +position };
                                setActParams(actParams);
                              }}
                              color="primary"
                              compact
                              key={v.id}
                            >
                              {v.id}
                            </Button>
                          ))}
                          {reference.length > 3 && (
                            <Button color="primary" compact>
                              +{reference.length - 3}
                              <Icon name="Expand" size="xs" />
                            </Button>
                          )}
                        </dd>
                      </Fragment>
                    )}
                  </For>
                </div>
              </>
            )
            : (
              <Text color="info" className="flex self-center gap-2">
                <Icon name="Info" /> No act selected
              </Text>
            )}
        </Card>
      </div>
      <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 container items-center w-full">
        <CardPDF url={pdfUrl} className="col-span-1 md:col-span-2 lg:col-span-3 row-span-2" />
        <CardJSON content={actDetails} />
        <CardHTML content={actHtml} />
        <CardText content={pdf} />
      </div>
    </div>
  );
});
