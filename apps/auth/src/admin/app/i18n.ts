import { createI18n, joinPath, KEY_SEPARATOR } from "@merge-rd/i18n";
import { environment } from "./environment";

export const i18n = createI18n({
    loadPath: joinPath(environment.adminBaseUrl, `resources/{{ns}}/admin/{{lng}}`),
    ns: [environment.realm],
    defaultNS: [environment.realm],
    keySeparator: KEY_SEPARATOR
});
