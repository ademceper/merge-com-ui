import type GlobalRequestResult from "@keycloak/keycloak-admin-client/lib/defs/globalRequestResult";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useRealm } from "../context/realm-context/RealmContext";

type RevocationModalProps = {
    handleModalToggle: () => void;
    save: () => void;
};

export const RevocationModal = ({ handleModalToggle, save }: RevocationModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm: realmName, realmRepresentation: realm, refresh } = useRealm();
    const { register, handleSubmit } = useForm();

    const parseResult = (result: GlobalRequestResult, prefixKey: string) => {
        const successCount = result.successRequests?.length || 0;
        const failedCount = result.failedRequests?.length || 0;

        if (successCount === 0 && failedCount === 0) {
            toast.warning(t("noAdminUrlSet"));
        } else if (failedCount > 0) {
            toast.success(t(prefixKey + "Success", {
                    successNodes: result.successRequests
                }));
            toast.error(t(prefixKey + "Fail", {
                    failedNodes: result.failedRequests
                }));
        } else {
            toast.success(t(prefixKey + "Success", {
                    successNodes: result.successRequests
                }));
        }
    };

    const setToNow = async () => {
        try {
            await adminClient.realms.update(
                { realm: realmName },
                {
                    realm: realmName,
                    notBefore: Date.now() / 1000
                }
            );

            toast.success(t("notBeforeSuccess"));
        } catch (error) {
            toast.error(t("setToNowError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const clearNotBefore = async () => {
        try {
            await adminClient.realms.update(
                { realm: realmName },
                {
                    realm: realmName,
                    notBefore: 0
                }
            );
            toast.success(t("notBeforeClearedSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("notBeforeError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const push = async () => {
        const result = await adminClient.realms.pushRevocation({
            realm: realmName
        });
        parseResult(result, "notBeforePush");

        refresh();
    };

    return (
        <Dialog open onOpenChange={open => !open && handleModalToggle()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("revocation")}</DialogTitle>
                </DialogHeader>
                <p className="kc-revocation-description-text text-sm">
                    {t("revocationDescription")}
                </p>
                <form id="revocation-modal-form" className="space-y-4" onSubmit={handleSubmit(save)}>
                    <div className="space-y-2 kc-revocation-modal-form-group">
                        <Label htmlFor="not-before">{t("notBefore")}</Label>
                        <Input
                            data-testid="not-before-input"
                            autoFocus
                            readOnly
                            value={
                                realm?.notBefore === 0
                                    ? (t("none") as string)
                                    : new Date(realm?.notBefore! * 1000).toString()
                            }
                            id="not-before"
                            className="bg-muted"
                            {...register("notBefore")}
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button
                        id="modal-cancel"
                        data-testid="cancel"
                        variant="link"
                        type="button"
                        onClick={handleModalToggle}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        data-testid="modal-test-connection-button"
                        variant="secondary"
                        type="button"
                        onClick={async () => {
                            await push();
                            handleModalToggle();
                        }}
                    >
                        {t("push")}
                    </Button>
                    <Button
                        data-testid="clear-not-before-button"
                        variant="outline"
                        type="button"
                        onClick={async () => {
                            await clearNotBefore();
                            handleModalToggle();
                        }}
                    >
                        {t("clear")}
                    </Button>
                    <Button
                        data-testid="set-to-now-button"
                        variant="outline"
                        type="button"
                        onClick={async () => {
                            await setToNow();
                            handleModalToggle();
                        }}
                    >
                        {t("setToNow")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
