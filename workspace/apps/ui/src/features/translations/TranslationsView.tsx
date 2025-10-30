import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { TranslationPreviewModal } from "./TranslationPreviewModal.tsx";
import { TranslationsViewProvider, useTranslationsView } from "./TranslationsView.context.tsx";
import { ActionButtons } from "./components/ActionButtons.tsx";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { PendingReviews } from "./components/PendingReviews.tsx";
import { TranslationsStats } from "./components/TranslationsStats.tsx";
import { TranslationsTable } from "./components/TranslationsTable.tsx";
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
  } = useTranslationsView();

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
        <ActionButtons />
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
  <TranslationsViewProvider>
    <Content />
  </TranslationsViewProvider>
);
