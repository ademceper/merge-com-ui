import { createI18n, joinPath, type LanguageDetectorModule } from "@merge-rd/i18n";
import { environment } from "./environment";

const keycloakLanguageDetector: LanguageDetectorModule = {
	type: "languageDetector",
	detect() {
		return environment.locale;
	},
};

export const i18n = createI18n({
	loadPath: joinPath(
		environment.serverBaseUrl,
		`resources/${environment.realm}/account/{{lng}}`,
	),
	languageDetector: keycloakLanguageDetector,
});
