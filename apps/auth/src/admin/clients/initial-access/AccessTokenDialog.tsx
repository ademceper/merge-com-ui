import { useTranslation } from "react-i18next";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
import { Label } from "@merge/ui/components/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@merge/ui/components/dialog";

type AccessTokenDialogProps = {
    token: string;
    toggleDialog: () => void;
};

export const AccessTokenDialog = ({ token, toggleDialog }: AccessTokenDialogProps) => {
    const { t } = useTranslation();
    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) toggleDialog(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("initialAccessTokenDetails")}</DialogTitle>
                </DialogHeader>
                <Alert variant="destructive">
                    <AlertTitle>{t("copyInitialAccessToken")}</AlertTitle>
                </Alert>
                <div className="space-y-2 mt-4">
                    <Label>{t("initialAccessToken")}</Label>
                    <code
                        id="initialAccessToken"
                        data-testid="initialAccessToken"
                        className="block p-2 bg-muted rounded text-sm break-all select-all"
                    >
                        {token}
                    </code>
                </div>
            </DialogContent>
        </Dialog>
    );
};
