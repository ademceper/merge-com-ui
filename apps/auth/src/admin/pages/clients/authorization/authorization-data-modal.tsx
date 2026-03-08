import type AccessTokenRepresentation from "@keycloak/keycloak-admin-client/lib/defs/accessTokenRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { Textarea } from "@merge-rd/ui/components/textarea";
import useToggle from "../../../shared/lib/useToggle";
import { prettyPrintJSON } from "../../../shared/lib/util";

type AuthorizationDataModalProps = {
    data: AccessTokenRepresentation;
};

export const AuthorizationDataModal = ({ data }: AuthorizationDataModalProps) => {
    const { t } = useTranslation();
    const [show, toggle] = useToggle();

    return (
        <>
            <Button
                data-testid="authorization-revert"
                onClick={toggle}
                variant="secondary"
            >
                {t("showAuthData")}
            </Button>
            <Dialog
                open={show}
                onOpenChange={open => {
                    if (!open) toggle();
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("authData")}</DialogTitle>
                        <p>{t("authDataDescription")}</p>
                    </DialogHeader>
                    <Textarea readOnly rows={20} value={prettyPrintJSON(data)} />
                    <DialogFooter>
                        <Button data-testid="cancel" id="modal-cancel" onClick={toggle}>
                            {t("cancel")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
