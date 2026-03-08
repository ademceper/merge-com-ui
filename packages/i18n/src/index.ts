import { createInstance } from "i18next";
import type { i18n, LanguageDetectorModule } from "i18next";
import FetchBackend from "i18next-fetch-backend";
import { initReactI18next } from "react-i18next";

// Re-exports
export { createInstance, type i18n as I18nInstance } from "i18next";
export type { TFunction, LanguageDetectorModule } from "i18next";
export { default as FetchBackend } from "i18next-fetch-backend";
export {
	initReactI18next,
	useTranslation,
	Trans,
	I18nextProvider,
} from "react-i18next";
export type { UseTranslationResponse } from "react-i18next";

export type TFuncKey = any;
export type KeyValue = { key: string; value: string };

export const DEFAULT_LOCALE = "en";
export const KEY_SEPARATOR = ".";

export function joinPath(...paths: string[]) {
	const PATH_SEPARATOR = "/";
	const normalizedPaths = paths.map((path, index) => {
		const isFirst = index === 0;
		const isLast = index === paths.length - 1;
		if (!isFirst && path.startsWith(PATH_SEPARATOR)) {
			path = path.slice(1);
		}
		if (!isLast && path.endsWith(PATH_SEPARATOR)) {
			path = path.slice(0, -1);
		}
		return path;
	}, []);
	return normalizedPaths.join(PATH_SEPARATOR);
}

export function parseKeyValueMessages(data: string): Record<string, string> {
	const messages: KeyValue[] = JSON.parse(data);
	return Object.fromEntries(messages.map(({ key, value }) => [key, value]));
}

export interface CreateI18nOptions {
	loadPath: string;
	ns?: string[];
	defaultNS?: string[];
	keySeparator?: string | false;
	languageDetector?: LanguageDetectorModule;
}

export function createI18n(options: CreateI18nOptions): i18n {
	const instance = createInstance({
		fallbackLng: DEFAULT_LOCALE,
		keySeparator: options.keySeparator ?? false,
		nsSeparator: false,
		interpolation: {
			escapeValue: false,
		},
		...(options.ns != null && { ns: options.ns }),
		...(options.defaultNS != null && { defaultNS: options.defaultNS }),
		backend: {
			loadPath: options.loadPath,
			parse: parseKeyValueMessages,
		},
	});

	instance.use(FetchBackend);

	if (options.languageDetector) {
		instance.use(options.languageDetector);
	}

	instance.use(initReactI18next);

	return instance;
}
