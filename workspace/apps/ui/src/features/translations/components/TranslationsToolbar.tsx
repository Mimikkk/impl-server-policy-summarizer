import { ServerClient } from "@clients/server/ServerClient.ts";
import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { requestSaveFile } from "@utilities/requestFilePicker.ts";
import { useCallback } from "react";
import { TranslationsViewContext } from "../TranslationsView.context.tsx";

export const TranslationsToolbar = () => {
  const { storage, handleLoadCsv } = TranslationsViewContext.use((
    s,
  ) => ({
    storage: s.storage,
    handleLoadCsv: s.handleLoadCsv,
  }));

  const handleDownloadCsv = useCallback(async () => {
    if (!storage?.contents || storage.contents.length === 0) return;

    const headers = Object.fromEntries(Object.keys(storage.contents[0]).map((key) => [key, key]));
    const data = storage.contents;

    const file = await ServerClient.exportCsv({ headers, data });
    requestSaveFile(file);
  }, [storage?.contents]);

  return (
    <div className="flex justify-between gap-2">
      <div className="ml-auto flex items-end gap-1">
        <IconButton variant="solid" name="Upload" className="min-w-20 h-9.5" onClick={handleLoadCsv}>
          Load CSV
        </IconButton>
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
