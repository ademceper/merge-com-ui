import { useTranslation } from "react-i18next";
import { SelectField } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { useLoginProviders } from "../../context/server-info/ServerInfoProvider";
import { ClientDescription } from "../ClientDescription";
import { getProtocolName } from "../utils";

export const GeneralSettings = () => {
    const { t } = useTranslation();
    const providers = useLoginProviders();

    return (
        <FormAccess role="manage-clients">
            <div className="flex flex-col gap-5">
                <SelectField
                    name="protocol"
                    label={t("clientType")}
                    labelIcon={t("clientTypeHelp")}
                    defaultValue=""
                    options={providers.map(option => ({
                        key: option,
                        value: getProtocolName(t, option)
                    }))}
                />
                <ClientDescription hasConfigureAccess />
            </div>
        </FormAccess>
    );
};
