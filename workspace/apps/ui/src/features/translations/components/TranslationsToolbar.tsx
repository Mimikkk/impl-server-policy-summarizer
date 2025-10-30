import { ServerClient } from "@clients/server/ServerClient.ts";
import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import { requestSaveFile } from "@utilities/requestFilePicker.ts";
import { useCallback } from "react";
import { useTranslationsView } from "../TranslationsView.context.tsx";

export const TranslationsToolbar = () => {
  const { storage, query, setQuery, handleLoadCsv, handleAddLanguage, handleAddKey } = useTranslationsView();

  const handleDownloadCsv = useCallback(async () => {
    if (!storage?.contents || storage.contents.length === 0) return;

    const headers = Object.fromEntries(Object.keys(storage.contents[0]).map((key) => [key, key]));
    const data = storage.contents;

    const file = await ServerClient.exportCsv({ headers, data });
    requestSaveFile(file);
  }, [storage?.contents]);

  return (
    <div className="flex justify-between gap-2">
      <div className="flex gap-2 content-start self-start">
        <IconButton name="Plus" variant="solid" className="min-w-40" onClick={handleAddLanguage}>
          New language
        </IconButton>
        <IconButton name="Plus" variant="solid" className="min-w-40" onClick={handleAddKey}>
          New key
        </IconButton>
      </div>
      <div className="flex flex-col">
        <div className="flex w-full gap-2">
          <IconButton variant="solid" name="Upload" className="min-w-20 shrink-0" onClick={handleLoadCsv}>
            Load CSV
          </IconButton>
          <div className="flex w-full">
            <InputField
              compact
              label="Search..."
              value={query}
              onValueChange={setQuery}
              className="w-full"
            />
            <IconButton className="shrink-0" name="Search" variant="solid" />
          </div>
        </div>
        <Card label="csv content" compact className="pl-2 pr-1 py-1" color={storage ? "info" : "error"}>
          {storage
            ? (
              <div className="flex items-center gap-2">
                <span>Version:</span>
                <span>{storage?.version && new Date(storage.version).toLocaleString()} - {storage?.filename}</span>
                <IconButton color="success" name="Download" variant="solid" onClick={handleDownloadCsv} />
              </div>
            )
            : <div className="text-center text-primary-10">No selected file.</div>}
        </Card>
      </div>
    </div>
  );
};
