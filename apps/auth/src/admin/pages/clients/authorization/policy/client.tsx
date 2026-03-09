import { useTranslation } from "@merge-rd/i18n";
import { ClientSelect } from "@/admin/shared/ui/client/client-select";

export const Client = () => {
    const { t } = useTranslation();

    return (
        <ClientSelect
            name="clients"
            label={t("clients")}
            helpText={t("policyClientHelp")}
            required
            defaultValue={[]}
            variant="typeaheadMulti"
            clientKey="id"
        />
    );
};
