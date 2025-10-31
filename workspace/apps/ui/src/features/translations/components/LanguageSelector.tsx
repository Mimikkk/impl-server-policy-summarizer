import { IconButton } from "@core/components/actions/IconButton.tsx";
import { TranslationsViewContext } from "../TranslationsView.context.tsx";

export const LanguageSelector = () => {
  const { sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage } = TranslationsViewContext.use((s) => ({
    sourceLanguage: s.sourceLanguage,
    setSourceLanguage: s.setSourceLanguage,
    targetLanguage: s.targetLanguage,
    setTargetLanguage: s.setTargetLanguage,
  }));

  return (
    <div>
      <IconButton
        name={sourceLanguage ? "Check" : "TriangleAlert"}
        onClick={() => setSourceLanguage("")}
        className="flex items-center gap-1 min-w-52 justify-start"
        color={sourceLanguage ? "success" : "warning"}
      >
        {sourceLanguage
          ? (
            <>
              <span className="font-bold">source language:</span>
              <span>{sourceLanguage}</span>
            </>
          )
          : <span className="font-bold">Select source language...</span>}
      </IconButton>
      <IconButton
        name={targetLanguage ? "Check" : "TriangleAlert"}
        onClick={() => setTargetLanguage("")}
        className="flex items-center gap-1 min-w-52 justify-start"
        color={targetLanguage ? "info" : "warning"}
      >
        {targetLanguage
          ? (
            <>
              <span className="font-bold">target language:</span>
              <span>{targetLanguage}</span>
            </>
          )
          : <span className="font-bold">Select target language...</span>}
      </IconButton>
    </div>
  );
};
