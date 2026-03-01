/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/resources/EditTheResource.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import {
    MultiSelectField,
    TextControl,
    useEnvironment
} from "../../shared/keycloak-ui-shared";
import { Fragment, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@merge/ui/components/dialog";
import { Button } from "@merge/ui/components/button";

import { updatePermissions } from "../api";
import type { Permission, Resource } from "../api/representations";
import { useAccountAlerts } from "../utils/useAccountAlerts";

type EditTheResourceProps = {
    resource: Resource;
    permissions?: Permission[];
    onClose: () => void;
};

type FormValues = {
    permissions: Permission[];
};

export const EditTheResource = ({
    resource,
    permissions,
    onClose
}: EditTheResourceProps) => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const { addAlert, addError } = useAccountAlerts();

    const form = useForm<FormValues>();
    const { control, reset, handleSubmit } = form;

    const { fields } = useFieldArray<FormValues>({
        control,
        name: "permissions"
    });

    useEffect(() => reset({ permissions }), []);

    const editShares = async ({ permissions }: FormValues) => {
        try {
            await Promise.all(
                permissions.map(permission =>
                    updatePermissions(context, resource._id, [permission])
                )
            );
            addAlert(t("updateSuccess"));
            onClose();
        } catch (error) {
            addError("updateError", error);
        }
    };

    return (
        <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("editTheResource", { name: resource.name })}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {t("editTheResource", { name: resource.name })}
                    </DialogDescription>
                </DialogHeader>
                <form id="edit-form" onSubmit={handleSubmit(editShares)} className="space-y-4">
                    <FormProvider {...form}>
                        {fields.map((p, index) => (
                            <Fragment key={p.id}>
                                <TextControl
                                    name={`permissions.${index}.username`}
                                    label={t("user")}
                                    isDisabled
                                />
                                <MultiSelectField
                                    id={`permissions-${p.id}`}
                                    name={`permissions.${index}.scopes`}
                                    label="permissions"
                                    defaultValue={[]}
                                    options={resource.scopes.map(({ name, displayName }) => ({
                                        key: name,
                                        value: displayName || name
                                    }))}
                                />
                            </Fragment>
                        ))}
                    </FormProvider>
                </form>
                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                    <Button size="sm" type="submit" form="edit-form">
                        {t("done")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
