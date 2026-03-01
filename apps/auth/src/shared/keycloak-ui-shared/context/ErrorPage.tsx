import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import { WarningCircle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";
import { getNetworkErrorMessage } from "../utils/errors";

type ErrorPageProps = {
    error?: unknown;
};

export const ErrorPage = (props: ErrorPageProps) => {
    const { t, i18n } = useTranslation();
    const routeError = useRouteError();
    const error = props.error ?? routeError;
    const errorMessage = getErrorMessage(error);
    const networkErrorMessage = getNetworkErrorMessage(error);
    console.error("ErrorPage caught:", error);

    function onRetry() {
        location.href = location.origin + location.pathname;
    }

    const message = errorMessage
        ? t(errorMessage)
        : networkErrorMessage && i18n.exists(networkErrorMessage)
          ? t(networkErrorMessage)
          : t("somethingWentWrongDescription");

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Dialog open={true}>
                <DialogContent showCloseButton={false} className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            <span className="inline-flex items-center gap-2">
                                <WarningCircle className="size-5 text-destructive shrink-0" aria-hidden />
                                {t("somethingWentWrong")}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">{message}</p>
                    <DialogFooter className="sm:justify-end">
                        <Button variant="default" onClick={onRetry}>
                            {t("tryAgain")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

function getErrorMessage(error: unknown): string | null {
    if (error instanceof Error) {
        return error.message;
    }

    return null;
}
