import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { Text } from "@core/components/typography/Text.tsx";
import { TranslationsViewContext } from "../TranslationsView.context.tsx";

export const PendingReviews = () => {
  const { resultsQueue, selectedResultIndex, handleSelectResult } = TranslationsViewContext.use((s) => ({
    resultsQueue: s.resultsQueue,
    selectedResultIndex: s.selectedResultIndex,
    handleSelectResult: s.handleSelectResult,
  }));
  if (resultsQueue.length === 0) return null;

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Text light className="font-bold">Pending Reviews:</Text>
        <Text>{resultsQueue.length} {resultsQueue.length === 1 ? "result" : "results"}</Text>
      </div>
      <div className="flex flex-wrap gap-2">
        {resultsQueue.slice(0, 6).map((result, idx) => {
          const icon = result.type === "translate"
            ? "WandSparkles"
            : result.type === "regenerate"
            ? "RotateCcw"
            : "BrainCircuit";
          const color = result.type === "translate" ? "success" : result.type === "regenerate" ? "warning" : "info";
          const label = result.type === "translate"
            ? "Translate"
            : result.type === "regenerate"
            ? "Regenerate"
            : "Verify";

          return (
            <IconButton
              key={idx}
              name={icon}
              variant="solid"
              color={color}
              className={selectedResultIndex === idx ? "ring-2 ring-offset-2 ring-info-7" : ""}
              title={`${label} for row ${result.rowId}, column ${result.columnId}`}
              onClick={() => handleSelectResult(idx)}
            >
              {label}
            </IconButton>
          );
        })}
        {resultsQueue.length > 6 && (
          <IconButton
            name="Plus"
            variant="solid"
            color="secondary"
            title={`${resultsQueue.length - 6} more results`}
          >
            +{resultsQueue.length - 6}
          </IconButton>
        )}
      </div>
    </Card>
  );
};
