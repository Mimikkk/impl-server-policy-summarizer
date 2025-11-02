import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Text } from "@core/components/typography/Text.tsx";
import { TranslationsViewContext } from "../TranslationsView.context.tsx";

export const TranslationsStats = () => {
  const {
    showMissingTranslations,
    toggleShowMissingTranslations,
    showChangedTranslations,
    toggleShowChangedTranslations,
    isEditing,
    counts,
  } = TranslationsViewContext.use((s) => ({
    showMissingTranslations: s.showMissingTranslations,
    toggleShowMissingTranslations: s.toggleShowMissingTranslations,
    showChangedTranslations: s.showChangedTranslations,
    toggleShowChangedTranslations: s.toggleShowChangedTranslations,
    isEditing: s.isEditing,
    counts: {
      total: s.translationsTable.rows.all().length,
      filtered: s.translationsTable.rows.filtered().length,
    },
  }));

  return (
    <div className="flex items-center gap-1 col-span-full">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Text light>
            Filtered rows:
          </Text>
          <div className="flex items-center gap-1">
            <span>{counts.filtered}</span>
            <span>/</span>
            <span>{counts.total}</span>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-1">
          <Text light className="flex items-center gap-1">
            <IconButton
              name={showMissingTranslations ? "EyeOff" : "Eye"}
              variant="solid"
              color={showMissingTranslations ? "info" : "primary"}
              onClick={toggleShowMissingTranslations}
            />
            Missing rows:
          </Text>
          <div className="flex items-center gap-1">
            <span>{counts.total}</span>
          </div>
          {isEditing && (
            <>
              <Text light className="flex items-center gap-1">
                <IconButton
                  name={showChangedTranslations ? "EyeOff" : "Eye"}
                  variant="solid"
                  color={showChangedTranslations ? "info" : "primary"}
                  onClick={toggleShowChangedTranslations}
                />
                Changed rows:
              </Text>
              <div className="flex items-center gap-1">
                <span>{counts.filtered}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
