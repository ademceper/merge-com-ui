import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { Switch } from "@merge/ui/components/switch";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";

import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { JsonFileUpload } from "../../components/json-file-upload/JsonFileUpload";
import { HelpItem } from "../../../shared/keycloak-ui-shared";

type ImportDialogProps = {
    onConfirm: (value: ResourceServerRepresentation) => void;
    closeDialog: () => void;
};

export const ImportDialog = ({ onConfirm, closeDialog }: ImportDialogProps) => {
    const { t } = useTranslation();
    const [imported, setImported] = useState<ResourceServerRepresentation>({});
    return (
        <Dialog open onOpenChange={(open) => { if (!open) closeDialog(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("import")}</DialogTitle>
                </DialogHeader>
                <form className="space-y-4">
                    <JsonFileUpload id="import-resource" onChange={setImported} />
                </form>
                {Object.keys(imported).length !== 0 && (
                    <>
                        <Separator />
                        <p className="my-4">{t("importResources")}</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>{t("policyEnforcementMode")}</Label>
                                    <HelpItem
                                        helpText={t("policyEnforcementModeHelp")}
                                        fieldLabelId="policyEnforcementMode"
                                    />
                                </div>
                                <RadioGroup value={imported.policyEnforcementMode} disabled>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value={imported.policyEnforcementMode || ""} id="policyEnforcementMode" />
                                        <Label htmlFor="policyEnforcementMode">
                                            {t(`policyEnforcementModes.${imported.policyEnforcementMode}`)}
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>{t("decisionStrategy")}</Label>
                                    <HelpItem
                                        helpText={t("decisionStrategyHelp")}
                                        fieldLabelId="decisionStrategy"
                                    />
                                </div>
                                <RadioGroup value={imported.decisionStrategy} disabled>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value={imported.decisionStrategy || ""} id="decisionStrategy" />
                                        <Label htmlFor="decisionStrategy">
                                            {t(`decisionStrategies.${imported.decisionStrategy}`)}
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>{t("allowRemoteResourceManagement")}</Label>
                                    <HelpItem
                                        helpText={t("allowRemoteResourceManagement")}
                                        fieldLabelId="allowRemoteResourceManagement"
                                    />
                                </div>
                                <Switch
                                    id="allowRemoteResourceManagement"
                                    checked={imported.allowRemoteResourceManagement}
                                    disabled
                                    aria-label={t("allowRemoteResourceManagement")}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            {Object.entries(imported)
                                .filter(([, value]) => Array.isArray(value))
                                .map(([key, value]) => (
                                    <Fragment key={key}>
                                        <Separator />
                                        <p className="my-2">
                                            <strong>
                                                {value.length} {t(key)}
                                            </strong>
                                        </p>
                                    </Fragment>
                                ))}
                        </div>
                        <Separator />
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>{t("importWarning")}</AlertTitle>
                        </Alert>
                    </>
                )}
                <DialogFooter>
                    <Button
                        id="modal-confirm"
                        onClick={() => {
                            onConfirm(imported);
                            closeDialog();
                        }}
                        data-testid="confirm"
                    >
                        {t("confirm")}
                    </Button>
                    <Button
                        data-testid="cancel"
                        id="modal-cancel"
                        variant="link"
                        onClick={closeDialog}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
