import { label } from "../../shared/keycloak-ui-shared";
import { TFunction } from "i18next";

type IFormatterValueType = string | number | boolean | null | undefined;
/** Compatible with KeycloakDataTable IFormatter (value: unknown) => unknown */
export type IFormatter = (data: unknown) => string;

export const translationFormatter =
    (t: TFunction): IFormatter =>
    (data: unknown) => {
        const d = data as IFormatterValueType;
        return d ? label(t, d as string) || "—" : "—";
    };
