import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { useFormContext } from "react-hook-form";
import { FormErrorText, HelpItem } from "../../../../shared/keycloak-ui-shared";
import { useUserProfile } from "../../api/use-user-profile";
import { KeySelect } from "../key-select";
import type { ComponentProps } from "./components";

export const UserProfileAttributeListComponent = ({
    name,
    label,
    helpText,
    required = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const {
        formState: { errors }
    } = useFormContext();

    const { data: config } = useUserProfile();
    const convertedName = convertToName(name!);

    const convert = (config?: UserProfileConfig) => {
        if (!config?.attributes) return [];

        return config.attributes.map(option => ({
            key: option.name!,
            value: option.name!
        }));
    };

    if (!config) return null;

    const getError = () => {
        return convertedName
            .split(".")
            .reduce((record: any, key) => record?.[key], errors);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={convertedName!}>
                    {t(label!)}
                    {required && " *"}
                </Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={label!} />
            </div>
            <KeySelect
                name={convertedName}
                rules={required ? { required: true } : {}}
                selectItems={convert(config)}
            />
            {getError() && <FormErrorText message={t("required")} />}
        </div>
    );
};
