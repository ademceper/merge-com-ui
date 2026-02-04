import { Button } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import { PlusCircle } from "@phosphor-icons/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge/ui/components/table";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useConfirmDialog } from "../../../components/confirm-dialog/ConfirmDialog";
import { DefaultValue } from "../../../components/key-value-form/KeyValueInput";
import useToggle from "../../../utils/useToggle";
import type { IndexedValidations } from "../../NewAttributeSettings";
import { AddValidatorDialog } from "../attribute/AddValidatorDialog";

export const AttributeValidations = () => {
    const { t } = useTranslation();
    const [addValidatorModalOpen, toggleModal] = useToggle();
    const [validatorToDelete, setValidatorToDelete] = useState<string>();
    const { setValue, control, register, getValues } = useFormContext();

    const validators: IndexedValidations[] = useWatch({
        name: "validations",
        control,
        defaultValue: []
    });

    useEffect(() => {
        register("validations");
    }, [register]);

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteValidatorConfirmTitle"),
        messageKey: t("deleteValidatorConfirmMsg", {
            validatorName: validatorToDelete
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            const updatedValidators = validators.filter(
                validator => validator.key !== validatorToDelete
            );

            setValue("validations", [...updatedValidators]);
        }
    });

    return (
        <>
            {addValidatorModalOpen && (
                <AddValidatorDialog
                    selectedValidators={validators}
                    onConfirm={newValidator => {
                        const annotations: DefaultValue[] = getValues("annotations");
                        if (
                            newValidator.id === "options" &&
                            !annotations.find(a => a.key === "inputType")
                        ) {
                            setValue("annotations", [
                                ...annotations,
                                { key: "inputType", value: "select" }
                            ]);
                        }
                        setValue("validations", [
                            ...validators,
                            { key: newValidator.id, value: newValidator.config }
                        ]);
                    }}
                    toggleDialog={toggleModal}
                />
            )}
            <DeleteConfirm />
            <div className="kc-attributes-validations">
                <Button
                    id="addValidator"
                    onClick={() => toggleModal()}
                    variant="link"
                    data-testid="addValidator"
                    className="kc--attributes-validations--add-validation-button"
                >
                    <PlusCircle className="size-4" />
                    {t("addValidator")}
                </Button>
                <Separator />
                {validators.length !== 0 ? (
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("validatorColNames.colName")}</TableHead>
                                <TableHead>{t("validatorColNames.colConfig")}</TableHead>
                                <TableHead aria-hidden="true" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {validators.map(validator => (
                                <TableRow key={validator.key}>
                                    <TableCell data-label={t("validatorColNames.colName")}>
                                        {validator.key}
                                    </TableCell>
                                    <TableCell data-label={t("validatorColNames.colConfig")}>
                                        {JSON.stringify(validator.value)}
                                    </TableCell>
                                    <TableCell className="kc--attributes-validations--action-cell">
                                        <Button
                                            key="validator"
                                            variant="link"
                                            data-testid="deleteValidator"
                                            onClick={() => {
                                                toggleDeleteDialog();
                                                setValidatorToDelete(validator.key);
                                            }}
                                        >
                                            {t("delete")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="kc-emptyValidators">
                        {t("emptyValidators")}
                    </p>
                )}
            </div>
        </>
    );
};
