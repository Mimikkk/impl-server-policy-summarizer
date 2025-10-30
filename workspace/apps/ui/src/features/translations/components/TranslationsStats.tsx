import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Text } from "@core/components/typography/Text.tsx";
import { useTranslationsView } from "../TranslationsView.context.tsx";
import { useTableData } from "../hooks/useTableData.tsx";

export const TranslationsStats = () => {
  const {
    storage,
    showMissingTranslations,
    toggleShowMissingTranslations,
    showChangedTranslations,
    toggleShowChangedTranslations,
    isEditing,
    query,
    keyQuery,
    scrollContainerRef,
  } = useTranslationsView();

  const { table, filteredRows } = useTableData({
    storage,
    showMissingTranslations,
    query,
    keyQuery,
    scrollContainerRef,
  });

  return (
    <div className="flex items-center gap-1 col-span-full">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Text light>
            Filtered rows:
          </Text>
          <div className="flex items-center gap-1">
            <span>{filteredRows.length}</span>
            <span>/</span>
            <span>{table.rows.length}</span>
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
            <span>{filteredRows.length}</span>
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
                <span>{filteredRows.length}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
