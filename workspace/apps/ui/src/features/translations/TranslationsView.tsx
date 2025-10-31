import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { TranslationPreviewModal } from "./TranslationPreviewModal.tsx";
import { TranslationsViewContext } from "./TranslationsView.context.tsx";
import { ControlPanel } from "./components/ControlPanel.tsx";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { PendingReviews } from "./components/PendingReviews.tsx";
import { TranslationsTable } from "./components/Table/TranslationsTable.tsx";
import { TranslationsStats } from "./components/TranslationsStats.tsx";
import { TranslationsToolbar } from "./components/TranslationsToolbar.tsx";

const Content = () => {
  const {
    storage,
    isEditing,
    toggleEdit,
    handleCancel,
    handleSave,
    handleAddKey,
    currentResult,
    handlePreviewAccept,
    handlePreviewReject,
  } = TranslationsViewContext.use();

  return (
    <Card className="flex flex-col gap-2">
      <TranslationsToolbar />
      {storage && (
        <>
          <TranslationsTable />
          <div className="col-span-full flex items-center gap-2 w-full justify-end">
            {isEditing && (
              <IconButton
                name="Plus"
                variant="solid"
                className="w-full max-h-7"
                title="Add key"
                square={false}
                onClick={handleAddKey}
              />
            )}
            {!isEditing && (
              <IconButton name="FilePen" variant="solid" className="" onClick={toggleEdit}>
                Toggle edit
              </IconButton>
            )}
            {isEditing && <IconButton color="error" title="Cancel" name="X" variant="solid" onClick={handleCancel} />}
            {isEditing && <IconButton color="success" name="Check" title="Save" variant="solid" onClick={handleSave} />}
          </div>
          <TranslationsStats />
        </>
      )}
      <div className="flex flex-col gap-2">
        <LanguageSelector />
        <ControlPanel />
      </div>
      <PendingReviews />
      <TranslationPreviewModal
        result={currentResult}
        onAccept={handlePreviewAccept}
        onReject={handlePreviewReject}
      />
    </Card>
  );
};

export const TranslationsView = () => (
  <TranslationsViewContext.Provider>
    <Content />
  </TranslationsViewContext.Provider>
);
