import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { TranslationsViewContext } from "../TranslationsView.context.tsx";

export const TranslationsToolbar = () => {
  const { isEditing, storage, handleLoadCsv, handleDownloadCsv } = TranslationsViewContext.use((
    s,
  ) => ({
    isEditing: s.isEditing,
    storage: s.storage,
    handleLoadCsv: s.loadCsv,
    handleDownloadCsv: s.downloadCsv,
  }));

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
                <IconButton
                  color="success"
                  name="Download"
                  variant="solid"
                  onClick={handleDownloadCsv}
                  disabled={isEditing}
                  title={isEditing ? "Save changes first" : "Download CSV"}
                />
              </div>
            )
            : <div className="text-center text-primary-10">No selected file.</div>}
        </Card>
      </div>
    </div>
  );
};
