import { NetworkError } from "@keycloak/keycloak-admin-client";
import { useTranslation } from "@merge-rd/i18n";
import { Alert, AlertDescription } from "@merge-rd/ui/components/alert";
import { Button } from "@merge-rd/ui/components/button";
import {
    type FallbackProps,
    useEnvironment
} from "@/shared/keycloak-ui-shared";

export const ErrorRenderer = ({ error }: FallbackProps) => {
    const { keycloak } = useEnvironment();
    const { t } = useTranslation();
    const isPermissionError =
        error instanceof NetworkError && error.response.status === 403;

    let message;
    if (isPermissionError) {
        message = t("forbiddenAdminConsole");
    } else {
        message = error.message;
    }

    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
                <div className="mt-2">
                    {isPermissionError ? (
                        <Button
                            variant="link"
                            onClick={async () => await keycloak.logout()}
                        >
                            {t("signOut")}
                        </Button>
                    ) : (
                        <Button variant="link" onClick={() => location.reload()}>
                            {t("reload")}
                        </Button>
                    )}
                </div>
            </Alert>
        </div>
    );
};
