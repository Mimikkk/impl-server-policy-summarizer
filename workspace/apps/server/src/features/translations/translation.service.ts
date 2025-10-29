import type { Container } from "@configs/container.ts";
import { TranslationRegenerator } from "./translation.regenerator.ts";
import { TranslationTranslator } from "./translation.translator.ts";
import { TranslationVerifier } from "./translation.verifier.ts";

export class TranslationService {
  static new({ llm, logger }: Pick<Container, "llm" | "logger">): TranslationService {
    return new TranslationService(llm, logger);
  }

  public readonly translate: typeof TranslationTranslator.prototype.translate;
  public readonly regenerate: typeof TranslationRegenerator.prototype.regenerate;
  public readonly verify: typeof TranslationVerifier.prototype.verify;
  private constructor(public readonly llm: Container["llm"], public readonly logger: Container["logger"]) {
    const context = { llm, logger };
    const translator = TranslationTranslator.new(context);
    const regenerator = TranslationRegenerator.new(context);
    const verifier = TranslationVerifier.new(context);

    this.translate = translator.translate.bind(translator);
    this.regenerate = regenerator.regenerate.bind(regenerator);
    this.verify = verifier.verify.bind(verifier);
  }
}
