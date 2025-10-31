import { IconButton } from "@core/components/actions/IconButton.tsx";
import { useTranslationsView } from "../TranslationsView.context.tsx";

export const ControlPanel = () => {
  const {
    showMissingTranslations,
    toggleShowMissingTranslations,
    showChangedTranslations,
    toggleShowChangedTranslations,
  } = useTranslationsView();

  return (
    <>
      <div className="flex gap-2">
        <IconButton name="WandSparkles" variant="solid">
          Fill in missing translations
        </IconButton>
        <IconButton name="BrainCircuit" variant="solid">
          Check grammar & syntax
        </IconButton>
        <IconButton name="RotateCcw" variant="solid">
          Regenerate translations
        </IconButton>
      </div>
      <div className="flex flex-col gap-2 max-w-80">
        <IconButton
          name={showMissingTranslations ? "EyeOff" : "Eye"}
          variant="solid"
          onClick={toggleShowMissingTranslations}
          className="w-full"
          color={showMissingTranslations ? "info" : "primary"}
        >
          {showMissingTranslations ? "Clear show missing translations" : "Show missing translations"}
        </IconButton>
        <IconButton
          name={showChangedTranslations ? "EyeOff" : "Eye"}
          variant="solid"
          onClick={toggleShowChangedTranslations}
          className="w-full"
          color={showChangedTranslations ? "info" : "primary"}
        >
          {showChangedTranslations ? "Clear show changed translations" : "Show changed translations"}
        </IconButton>
      </div>
    </>
  );
};
