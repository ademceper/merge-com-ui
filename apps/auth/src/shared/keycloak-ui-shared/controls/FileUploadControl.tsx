/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/FileUploadControl.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import {
    InputGroup,
    InputGroupButton,
    InputGroupInput,
} from "@merge/ui/components/input-group";
import { ReactNode, useRef, useState } from "react";
import {
    FieldPath,
    FieldValues,
    PathValue,
    UseControllerProps,
    useController
} from "react-hook-form";
import { getRuleValue } from "../utils/getRuleValue";
import { FormLabel } from "./FormLabel";
import { useTranslation } from "react-i18next";
import { cn } from "@merge/ui/lib/utils";

export type FileUploadControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = UseControllerProps<T, P> & {
    label: string;
    labelIcon?: string | ReactNode;
    isDisabled?: boolean;
    "data-testid"?: string;
    type?: string;
};

export const FileUploadControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>(
    props: FileUploadControlProps<T, P>
) => {
    const { labelIcon, ...rest } = props;
    const required = !!getRuleValue(props.rules?.required);
    const defaultValue = props.defaultValue ?? (null as PathValue<T, P>);

    const { t } = useTranslation();
    const [filename, setFilename] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { field, fieldState } = useController({
        ...props,
        defaultValue
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            field.onChange(file);
            setFilename(file.name);
        }
    };

    const handleClear = () => {
        field.onChange(null);
        setFilename("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <FormLabel
            name={props.name}
            label={props.label}
            labelIcon={labelIcon}
            isRequired={required}
            error={fieldState.error}
        >
            <input
                ref={(el) => {
                    fileInputRef.current = el;
                    if (typeof field.ref === "function") field.ref(el);
                    else if (field.ref) (field.ref as { current: HTMLInputElement | null }).current = el;
                }}
                type="file"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={handleFileChange}
                onBlur={field.onBlur}
                disabled={props.isDisabled}
                data-testid={props["data-testid"] || props.name}
            />
            <InputGroup
                className={cn(
                    fieldState.error && "border-destructive aria-invalid:ring-destructive/20"
                )}
            >
                <InputGroupInput
                    readOnly
                    value={filename}
                    placeholder={t("browse")}
                    className="cursor-default"
                    aria-invalid={!!fieldState.error}
                    disabled={props.isDisabled}
                    onClick={() => fileInputRef.current?.click()}
                />
                <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={props.isDisabled}
                >
                    {t("browse")}
                </InputGroupButton>
                <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleClear}
                    disabled={props.isDisabled || !filename}
                >
                    {t("clear")}
                </InputGroupButton>
            </InputGroup>
        </FormLabel>
    );
};
