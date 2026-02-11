import { FormLabel } from "../../../shared/keycloak-ui-shared";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { get } from "lodash-es";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { sortProviders } from "../../util";
import { ClientIdSecret } from "../component/ClientIdSecret";
import { SwitchField } from "../component/SwitchField";
import { TextField } from "../component/TextField";

const clientAuthentications = [
    "client_secret_post",
    "client_secret_basic",
    "client_secret_basic_unencoded",
    "client_secret_jwt",
    "private_key_jwt"
];

export const OIDCAuthentication = ({ create = true }: { create?: boolean }) => {
    const providers = useServerInfo().providers!.clientSignature.providers;
    const { t } = useTranslation();

    const { control } = useFormContext();

    const clientAuthMethod = useWatch({
        control: control,
        name: "config.clientAuthMethod"
    });

    const { formState: { errors } } = useFormContext();
    return (
        <>
            <FormLabel name="config.clientAuthMethod" label={t("clientAuthentication")} labelIcon={t("clientAuthenticationHelp")} error={get(errors, "config.clientAuthMethod")}>
                <Controller
                    name="config.clientAuthMethod"
                    control={control}
                    defaultValue={clientAuthentications[0]}
                    render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger id="config.clientAuthMethod"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {clientAuthentications.map((auth) => (
                                    <SelectItem key={auth} value={auth}>{t(`clientAuthentications.${auth}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </FormLabel>
            <ClientIdSecret
                secretRequired={clientAuthMethod !== "private_key_jwt"}
                create={create}
            />
            <FormLabel name="config.clientAssertionSigningAlg" label={t("clientAssertionSigningAlg")} labelIcon={t("clientAssertionSigningAlgHelp")} error={get(errors, "config.clientAssertionSigningAlg")}>
                <Controller
                    name="config.clientAssertionSigningAlg"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger id="config.clientAssertionSigningAlg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">{t("algorithmNotSpecified")}</SelectItem>
                                {sortProviders(providers).map((p) => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </FormLabel>
            {(clientAuthMethod === "private_key_jwt" ||
                clientAuthMethod === "client_secret_jwt") && (
                <TextField
                    field="config.clientAssertionAudience"
                    label="clientAssertionAudience"
                />
            )}
            {clientAuthMethod === "private_key_jwt" && (
                <SwitchField
                    field="config.jwtX509HeadersEnabled"
                    label="jwtX509HeadersEnabled"
                />
            )}
        </>
    );
};
