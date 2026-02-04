import { Spinner } from "@merge/ui/components/spinner";
import { useTranslation } from "react-i18next";

export const KeycloakSpinner = () => {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-[200px] items-center justify-center" aria-label={t("spinnerLoading")}>
            <Spinner className="size-8" />
        </div>
    );
};
