/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/resources/ShareTheResource.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import {
    FormErrorText,
    MultiSelectField,
    useEnvironment
} from "../../shared/keycloak-ui-shared";
import { useEffect } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { Input } from "@merge/ui/components/input";
import { Badge } from "@merge/ui/components/badge";
import { X } from "@phosphor-icons/react";

import { updateRequest } from "../api";
import { Permission, Resource } from "../api/representations";
import { useAccountAlerts } from "../utils/useAccountAlerts";
import { SharedWith } from "./SharedWith";

type ShareTheResourceProps = {
    resource: Resource;
    permissions?: Permission[];
    open: boolean;
    onClose: () => void;
};

type FormValues = {
    permissions: string[];
    usernames: { value: string }[];
};

export const ShareTheResource = ({
    resource,
    permissions,
    open,
    onClose
}: ShareTheResourceProps) => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const { addAlert, addError } = useAccountAlerts();
    const form = useForm<FormValues>();
    const {
        control,
        register,
        reset,
        formState: { errors, isValid },
        setError,
        clearErrors,
        handleSubmit
    } = form;
    const { fields, append, remove } = useFieldArray<FormValues>({
        control,
        name: "usernames"
    });

    useEffect(() => {
        if (fields.length === 0) {
            append({ value: "" });
        }
    }, [fields]);

    const watchFields = useWatch({
        control,
        name: "usernames",
        defaultValue: []
    });

    const isDisabled = watchFields.every(({ value }) => value.trim().length === 0);

    const addShare = async ({ usernames, permissions }: FormValues) => {
        try {
            await Promise.all(
                usernames
                    .filter(({ value }) => value !== "")
                    .map(({ value: username }) =>
                        updateRequest(context, resource._id, username, permissions)
                    )
            );
            addAlert(t("shareSuccess"));
            onClose();
        } catch (error) {
            addError("shareError", error);
        }
        reset({});
    };

    const validateUser = async () => {
        const userOrEmails = fields.map(f => f.value).filter(f => f !== "");
        const userPermission = permissions?.map(p => [p.username, p.email]).flat();

        const hasUsers = userOrEmails.length > 0;
        const alreadyShared =
            userOrEmails.filter(u => userPermission?.includes(u)).length !== 0;

        if (!hasUsers || alreadyShared) {
            setError("usernames", {
                message: !hasUsers ? t("required") : t("resourceAlreadyShared")
            });
        } else {
            clearErrors();
        }

        return hasUsers && !alreadyShared;
    };

    return (
        <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("shareTheResource", { name: resource.name })}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {t("shareTheResource", { name: resource.name })}
                    </DialogDescription>
                </DialogHeader>
                <form id="share-form" onSubmit={handleSubmit(addShare)} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="users" className="text-sm font-medium">
                            {t("shareUser")} <span className="text-destructive">*</span>
                        </label>
                        <div className="flex gap-2">
                            <Input
                                id="users"
                                data-testid="users"
                                placeholder={t("usernamePlaceholder")}
                                className={errors.usernames ? "border-destructive" : ""}
                                {...register(`usernames.${fields.length - 1}.value`, {
                                    validate: validateUser
                                })}
                            />
                            <Button
                                type="button"
                                data-testid="add"
                                onClick={() => append({ value: "" })}
                                disabled={isDisabled}
                            >
                                {t("add")}
                            </Button>
                        </div>
                        {fields.length > 1 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                                <span className="text-xs text-muted-foreground mr-1">
                                    {t("shareWith")}
                                </span>
                                {fields.map(
                                    (field, index) =>
                                        index !== fields.length - 1 && (
                                            <Badge
                                                key={field.id}
                                                variant="secondary"
                                                className="gap-1"
                                            >
                                                {field.value}
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="ml-0.5 hover:text-foreground"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )
                                )}
                            </div>
                        )}
                        {errors.usernames && (
                            <FormErrorText message={errors.usernames.message!} />
                        )}
                    </div>
                    <FormProvider {...form}>
                        <div data-testid="permissions">
                            <MultiSelectField
                                name="permissions"
                                defaultValue={[]}
                                options={resource.scopes.map(({ name, displayName }) => ({
                                    key: name,
                                    value: displayName || name
                                }))}
                            />
                        </div>
                    </FormProvider>
                    <div>
                        <SharedWith permissions={permissions} />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                    <Button
                        size="sm"
                        data-testid="done"
                        disabled={!isValid}
                        type="submit"
                        form="share-form"
                    >
                        {t("done")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
