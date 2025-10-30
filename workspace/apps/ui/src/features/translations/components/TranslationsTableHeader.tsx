import { IconButton } from "@core/components/actions/IconButton.tsx";
import { InputField } from "@core/components/forms/inputs/InputField.tsx";
import clsx from "clsx";
import { useTranslationsView } from "../TranslationsView.context.tsx";
import { HeaderCell } from "./HeaderCell.tsx";

export const TranslationsTableHeader = () => {
  const {
    isEditing,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    handleRemoveLanguage,
    keyQuery,
    setKeyQuery,
    tableData: { table },
  } = useTranslationsView();

  return (
    <thead className="z-10 sticky top-0 left-0 bg-primary-6 text-left">
      <tr className="flex w-full divide-x divide-primary-6 border-b border-primary-5 shadow shadow-primary-5">
        {table.columns.map((column: any) => {
          const isSelectable = column.id !== "key";
          const isSourceLanguage = sourceLanguage === column.id;
          const isTargetLanguage = targetLanguage === column.id;

          if (isSelectable) {
            return (
              <th
                className={clsx(
                  "flex-1",
                  isSourceLanguage && "bg-success-7",
                  isTargetLanguage && "bg-info-7",
                  !isSourceLanguage && !isTargetLanguage && "bg-primary-7",
                )}
                key={column.id}
                data-source={isSourceLanguage}
                data-target={isTargetLanguage}
              >
                <div className="flex flex-col items-center">
                  <div className="flex justify-between w-full items-center h-7">
                    {isEditing
                      ? (
                        <>
                          <HeaderCell column={column} />
                          <IconButton
                            color="error"
                            name="Trash"
                            variant="solid"
                            onClick={() => handleRemoveLanguage(column.id)}
                          />
                        </>
                      )
                      : <span className="px-3">{column.label}</span>}
                  </div>
                  <div className="flex w-full bg-primary-4">
                    <IconButton
                      className="flex-1 justify-start"
                      name={isSourceLanguage ? "BadgeCheck" : "Badge"}
                      color={isSourceLanguage ? "success" : "primary"}
                      active={isSourceLanguage}
                      onClick={() => {
                        if (isTargetLanguage) setTargetLanguage("");
                        return setSourceLanguage(column.id);
                      }}
                    >
                      source language
                    </IconButton>
                    <IconButton
                      className="flex-1 justify-start"
                      name={isTargetLanguage ? "BadgeCheck" : "Badge"}
                      color={isTargetLanguage ? "info" : "primary"}
                      active={isTargetLanguage}
                      onClick={() => {
                        if (isSourceLanguage) setSourceLanguage("");
                        return setTargetLanguage(column.id);
                      }}
                    >
                      target language
                    </IconButton>
                  </div>
                </div>
              </th>
            );
          }

          return (
            <th className="flex-1 h-auto" key={column.id}>
              <div className="flex flex-col items-center">
                <div className="flex justify-between w-full items-center h-7">
                  <span className="px-3">{column.label}</span>
                </div>
                <div className="flex justify-between w-full items-center h-7">
                  <InputField
                    compact
                    value={keyQuery}
                    onValueChange={setKeyQuery}
                    className="h-full w-full"
                  />
                  <IconButton name="Search" variant="solid" />
                </div>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
