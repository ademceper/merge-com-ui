import { useTranslation } from "@merge-rd/i18n";
import { useFormContext, useWatch } from "react-hook-form";
import { TextControl } from "@/shared/keycloak-ui-shared";
import type { IdentityProviderParams } from "@/admin/shared/lib/routes/identity-providers";
import { useParams } from "@/admin/shared/lib/use-params";
import { ClientIdSecret } from "../component/client-id-secret";
import { DisplayOrder } from "../component/display-order";
import { RedirectUrl } from "../component/redirect-url";

type GeneralSettingsProps = {
    id: string;
    create?: boolean;
};

export const GeneralSettings = ({ create = true, id }: GeneralSettingsProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();
    const alias = useWatch({ control, name: "alias" });
    const { tab } = useParams<IdentityProviderParams>();

    return (
        <>
            <RedirectUrl id={alias ? alias : id} />

            <TextControl
                name="alias"
                label={t("alias")}
                labelIcon={t("aliasHelp")}
                readOnly={tab === "settings"}
                rules={{
                    required: t("required")
                }}
            />

            <TextControl name="displayName" label={t("displayName")} />
            <ClientIdSecret create={create} />
            <DisplayOrder />
        </>
    );
};
