import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { SelectControl } from "../../../shared/keycloak-ui-shared";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { convertAttributeNameToForm } from "../../util";
import { FormFields } from "../ClientDetails";
import { TimeSelector } from "../../components/time-selector/TimeSelector";
import { Label } from "@merge/ui/components/label";
import { HelpItem } from "../../../shared/keycloak-ui-shared";

type SignedJWTProps = {
    clientAuthenticatorType: string;
};

export const SignedJWT = ({ clientAuthenticatorType }: SignedJWTProps) => {
    const { cryptoInfo } = useServerInfo();
    const providers =
        clientAuthenticatorType === "client-jwt"
            ? (cryptoInfo?.clientSignatureAsymmetricAlgorithms ?? [])
            : (cryptoInfo?.clientSignatureSymmetricAlgorithms ?? []);

    const { t } = useTranslation();
    const { control } = useFormContext<FormFields>();

    return (
        <>
            <SelectControl
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.token.endpoint.auth.signing.alg"
                )}
                label={t("signatureAlgorithm")}
                labelIcon={t("signatureAlgorithmHelp")}
                controller={{
                    defaultValue: ""
                }}
                maxMenuHeight="200px"
                options={[
                    { key: "", value: t("anyAlgorithm") },
                    ...providers.map(option => ({ key: option, value: option }))
                ]}
            />
            <div className="space-y-2 my-4">
                <div className="flex items-center gap-2">
                    <Label>{t("signatureMaxExp")}</Label>
                    <HelpItem
                        helpText={t("signatureMaxExpHelp")}
                        fieldLabelId="signatureMaxExp"
                    />
                </div>
                <Controller
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.token.endpoint.auth.signing.max.exp"
                    )}
                    defaultValue=""
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            value={field.value!}
                            onChange={field.onChange}
                            units={["second", "minute"]}
                            min="1"
                        />
                    )}
                />
            </div>
        </>
    );
};
