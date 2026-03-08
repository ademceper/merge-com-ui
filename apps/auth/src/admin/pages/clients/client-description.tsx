import { useTranslation } from "@merge-rd/i18n";
import { TextAreaControl, TextControl } from "../../../shared/keycloak-ui-shared";

import { FormAccess } from "../../shared/ui/form/form-access";
import { DefaultSwitchControl } from "../../shared/ui/switch-control";

type ClientDescriptionProps = {
    protocol?: string;
    hasConfigureAccess?: boolean;
};

export const ClientDescription = ({
    hasConfigureAccess: configure
}: ClientDescriptionProps) => {
    const { t } = useTranslation();
    return (
        <FormAccess role="manage-clients" fineGrainedAccess={configure} unWrap>
            <div className="flex flex-col gap-5">
                <TextControl
                    name="clientId"
                    label={t("clientId")}
                    labelIcon={t("clientIdHelp")}
                    rules={{ required: t("required") }}
                />
                <TextControl
                    name="name"
                    label={t("name")}
                    labelIcon={t("clientNameHelp")}
                />
                <TextAreaControl
                    name="description"
                    label={t("description")}
                    labelIcon={t("clientDescriptionHelp")}
                    rules={{
                        maxLength: {
                            value: 255,
                            message: t("maxLength", { length: 255 })
                        }
                    }}
                />
                <DefaultSwitchControl
                    name="alwaysDisplayInConsole"
                    label={t("alwaysDisplayInUI")}
                    labelIcon={t("alwaysDisplayInUIHelp")}
                />
            </div>
        </FormAccess>
    );
};
