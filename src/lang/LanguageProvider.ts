import { english } from "./en.js";
import { ILanguage } from "./ILanguage.js";

const Languages: Record<string, ILanguage> = {
    en: english,
} as const;

export class LanguageProvider {
    private static instance: LanguageProvider;
    public language: ILanguage = Languages.en;
    public static getInstance(): LanguageProvider {
        if (!LanguageProvider.instance) {
            LanguageProvider.instance = new LanguageProvider();
        }
        return LanguageProvider.instance;
    }

    public setLanguage(langKey: string) {
        if (Languages.hasOwnProperty(langKey)) {
            this.language = Languages[langKey];
        } else {
            this.language = Languages.en;
        }
    }

    public translate(
        langKey: keyof ILanguage,
        replacers?: Record<string, string>
    ): string {
        if (!this.language.hasOwnProperty(langKey)) {
            // return a fallback translation string, basically just returning the ID
            return langKey;
        }
        // obtain the translation string
        let outString = this.language[langKey];
        for (const [key, value] of Object.entries(replacers)) {
            outString = outString.replace(`$${key}`, value);
        }
        return outString;
    }
}

export const Lang = LanguageProvider.getInstance().translate;
