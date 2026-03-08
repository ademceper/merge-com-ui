export const prettyPrintJSON = (value: unknown) => JSON.stringify(value, null, 2);

export const addTrailingSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`);

export const localeToDisplayName = (locale: string, displayLocale: string) => {
    try {
        return new Intl.DisplayNames([displayLocale], { type: "language" }).of(
            locale === "zh-CN" ? "zh-HANS" : locale === "zh-TW" ? "zh-HANT" : locale
        );
    } catch {
        return locale;
    }
};
