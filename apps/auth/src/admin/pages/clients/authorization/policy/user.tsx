import { useTranslation } from "react-i18next";
import { UserSelect } from "../../../../shared/ui/users/user-select";

export const User = () => {
    const { t } = useTranslation();
    return (
        <UserSelect
            name="users"
            label="users"
            helpText={t("policyUsers")}
            defaultValue={[]}
            variant="typeaheadMulti"
        />
    );
};
