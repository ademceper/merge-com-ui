import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { HelpItem, SelectField } from "../../../../shared/keycloak-ui-shared";
import { useServerInfo } from "../../../app/providers/server-info/server-info-provider";
import { convertAttributeNameToForm } from "../../../shared/lib/util";
import { TimeSelector } from "../../../shared/ui/time-selector/time-selector";
import type { FormFields } from "../client-details";

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
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.token.endpoint.auth.signing.alg"
                )}
                label={t("signatureAlgorithm")}
                labelIcon={t("signatureAlgorithmHelp")}
                defaultValue=""
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
