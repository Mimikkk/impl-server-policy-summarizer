import type { Translation, Verification } from "@clients/server/resources/TranslationResource.ts";
import { IconButton } from "@core/components/actions/IconButton.tsx";
import { Card } from "@core/components/containers/card/Card.tsx";
import { Text } from "@core/components/typography/Text.tsx";
import { useState } from "react";

export type OperationType = "translate" | "regenerate" | "verify";

interface TranslationResult {
  type: "translate" | "regenerate";
  original: string;
  currentTranslation?: string;
  translations: Translation[];
  rowId: string;
  columnId: string;
}

interface VerificationResult {
  type: "verify";
  original: string;
  translation: string;
  verification: Verification;
  rowId: string;
  columnId: string;
}

export type PreviewResult = TranslationResult | VerificationResult;

interface Props {
  result: PreviewResult | null;
  onAccept: (selectedTranslation?: string) => void;
  onReject: () => void;
}

export const TranslationPreviewModal = ({ result, onAccept, onReject }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!result) return null;

  if (result.type === "verify") {
    const { original, translation, verification } = result;
    const scoreColor = verification.score >= 90
      ? "success"
      : verification.score >= 70
      ? "info"
      : verification.score >= 50
      ? "warning"
      : "error";

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
        <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Text className="text-xl font-bold">Translation Verification</Text>
            <IconButton name="X" variant="solid" onClick={onReject} />
          </div>

          <div className="flex flex-col gap-2">
            <Card label="Original" color="secondary">
              <Text>{original}</Text>
            </Card>
            <Card label="Translation" color="secondary">
              <Text>{translation}</Text>
            </Card>
          </div>

          <Card label="Verification Results" color={scoreColor}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Text light>Score:</Text>
                <Text className="text-lg font-bold">{verification.score}/100</Text>
                <IconButton
                  name={verification.isValid ? "Check" : "X"}
                  color={verification.isValid ? "success" : "error"}
                  variant="solid"
                >
                  {verification.isValid ? "Valid" : "Invalid"}
                </IconButton>
              </div>

              {verification.issues.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Text light className="font-bold">Issues:</Text>
                  {verification.issues.map((issue, idx) => (
                    <Card key={idx} color="error" className="pl-2">
                      <Text>{issue}</Text>
                    </Card>
                  ))}
                </div>
              )}

              {verification.suggestions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Text light className="font-bold">Suggestions:</Text>
                  {verification.suggestions.map((suggestion, idx) => (
                    <Card key={idx} color="info" className="pl-2">
                      <Text>{suggestion}</Text>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-2 justify-end">
            <IconButton name="X" variant="solid" color="error" onClick={onReject}>
              Close
            </IconButton>
          </div>
        </Card>
      </div>
    );
  }

  const { original, currentTranslation, translations } = result;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Text className="text-xl font-bold">
            {result.type === "translate" ? "Translation Preview" : "Regeneration Preview"}
          </Text>
          <IconButton name="X" variant="solid" onClick={onReject} />
        </div>

        <Card label="Original" color="secondary">
          <Text>{original}</Text>
        </Card>

        {currentTranslation && (
          <Card label="Current Translation" color="warning">
            <Text>{currentTranslation}</Text>
          </Card>
        )}

        {translations.length === 0
          ? (
            <Card label="Error" color="error">
              <Text>No translations were generated. Please try again.</Text>
            </Card>
          )
          : (
            <div className="flex flex-col gap-2">
              <Text light className="font-bold">
                {translations.length === 1 ? "Translation:" : "Select a translation:"}
              </Text>
              {translations.map((trans, idx) => (
                <Card
                  key={idx}
                  color={selectedIndex === idx ? "info" : "secondary"}
                  className="cursor-pointer hover:border-info-7 transition-colors"
                  onClick={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center gap-2">
                    <IconButton
                      name={selectedIndex === idx ? "CheckCheck" : "Circle"}
                      color={selectedIndex === idx ? "info" : "secondary"}
                      variant="solid"
                    />
                    <Text>{trans.translation}</Text>
                  </div>
                </Card>
              ))}
            </div>
          )}

        <div className="flex gap-2 justify-end">
          <IconButton name="X" variant="solid" color="error" onClick={onReject}>
            Cancel
          </IconButton>
          {translations.length > 0 && (
            <IconButton
              name="Check"
              variant="solid"
              color="success"
              onClick={() => onAccept(translations[selectedIndex].translation)}
            >
              Apply Translation
            </IconButton>
          )}
        </div>
      </Card>
    </div>
  );
};
