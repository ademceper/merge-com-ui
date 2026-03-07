import { label } from "../../../shared/keycloak-ui-shared";
import { TFunction } from "@merge-rd/i18n";

type IFormatterValueType = string | number | boolean | null | undefined;
/** Compatible with KeycloakDataTable IFormatter (value: unknown) => unknown */
type IFormatter = (data: unknown) => string;

export const translationFormatter =
    (t: TFunction): IFormatter =>
    (data: unknown) => {
        const d = data as IFormatterValueType;
        return d ? label(t, d as string) || "—" : "—";
    };
