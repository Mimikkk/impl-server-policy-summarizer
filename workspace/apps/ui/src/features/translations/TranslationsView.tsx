import { Card } from "@core/components/containers/card/Card.tsx";
import { ReviewModal } from "./ReviewModal.tsx";
import { TranslationsViewContext } from "./TranslationsView.context.tsx";
import { ControlPanel } from "./components/ControlPanel.tsx";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { PendingReviews } from "./components/PendingReviews.tsx";
import { TranslationsTable } from "./components/Table/boyslove/TranslationsTable.tsx";
import { TranslationsToolbar } from "./components/TranslationsToolbar.tsx";

const Content = () => {
  const {
    hasStorage,
    currentResult,
    handlePreviewAccept,
    handlePreviewReject,
  } = TranslationsViewContext.use((s) => ({
    hasStorage: !!s.storage,
    currentResult: s.currentResult,
    handlePreviewAccept: s.handlePreviewAccept,
    handlePreviewReject: s.handlePreviewReject,
  }));

  return (
    <Card className="flex flex-col gap-2">
      <TranslationsToolbar />
      {hasStorage && <TranslationsTable />}
      <div className="flex flex-col gap-2">
        <LanguageSelector />
        <ControlPanel />
      </div>
      <PendingReviews />
      <ReviewModal result={currentResult} onAccept={handlePreviewAccept} onReject={handlePreviewReject} />
    </Card>
  );
};

export const TranslationsView = () => (
  <TranslationsViewContext.Provider>
    <Content />
  </TranslationsViewContext.Provider>
);
