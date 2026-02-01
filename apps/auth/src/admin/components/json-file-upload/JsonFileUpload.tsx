/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/json-file-upload/JsonFileUpload.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { FileUploadForm, FileUploadFormProps } from "./FileUploadForm";

export type JsonFileUploadProps = Omit<
    FileUploadFormProps,
    "onChange" | "language" | "extension"
> & {
    onChange: (obj: object) => void;
};

export const JsonFileUpload = ({ onChange, ...props }: JsonFileUploadProps) => {
    const handleChange = (value: string) => {
        try {
            onChange(JSON.parse(value));
        } catch {
            onChange({});
            console.warn("Invalid json, ignoring value using {}");
        }
    };

    return (
        <FileUploadForm
            {...props}
            language="json"
            extension=".json"
            onChange={handleChange}
        />
    );
};
