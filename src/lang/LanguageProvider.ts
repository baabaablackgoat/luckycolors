import { english } from "./en.js";
import { ILanguage, RandomizedTranslation } from "./ILanguage";

const Languages: Record<string, ILanguage> = {
    en: english,
} as const;

type Replacer = string | number;

export class LanguageProvider {
    private static instance: LanguageProvider;
    public language: ILanguage = Languages.en;
    public static getInstance(): LanguageProvider {
        if (!LanguageProvider.instance) {
            LanguageProvider.instance = new LanguageProvider();
            LanguageProvider.instance.language = Languages.en;
        }
        return LanguageProvider.instance;
    }

    // TODO: once this is called, we have to re-register all commands because these _will_ affect the names
    public setLanguage(langKey: string) {
        if (Languages.hasOwnProperty(langKey)) {
            this.language = Languages[langKey];
        } else {
            this.language = Languages.en;
        }
    }

    private chooseRandomTranslation(
        translation: RandomizedTranslation
    ): string {
        return translation[Math.floor(Math.random() * translation.length)];
    }

    public translate(
        langKey: keyof ILanguage,
        replacers?: Record<string, Replacer>
    ): string {
        if (!LanguageProvider.instance.language.hasOwnProperty(langKey)) {
            // return a fallback translation string, basically just returning the ID
            return langKey;
        }
        // obtain the translation string
        let foundTranslation = LanguageProvider.instance.language[langKey];
        let outString: string = Array.isArray(foundTranslation)
            ? LanguageProvider.instance.chooseRandomTranslation(
                  foundTranslation
              )
            : foundTranslation;
        if (replacers) {
            for (let [key, value] of Object.entries(replacers)) {
                if (typeof value == "number") value = value.toString();
                outString = outString.replace(`$${key}`, value);
            }
        }
        return outString;
    }
}

export const Lang = LanguageProvider.getInstance().translate;
