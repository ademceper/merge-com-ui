/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/themes/ImageUpload.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

type ImageUploadProps = {
    name: string;
    onChange?: (file: string) => void;
};

export const ImageUpload = ({ name, onChange }: ImageUploadProps) => {
    const [dataUri, setDataUri] = useState("");
    const [file, setFile] = useState<File>();
    const [isLoading, setIsLoading] = useState(false);

    const { control, watch } = useFormContext();

    const fileToDataUri = (file: File) =>
        new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = event => {
                resolve(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        });

    if (file) {
        void fileToDataUri(file).then(dataUri => {
            setDataUri(dataUri);
            onChange?.(dataUri);
        });
    }

    const loadedFile = watch(name);
    useEffect(() => {
        (() => {
            if (loadedFile) {
                void fileToDataUri(loadedFile).then(dataUri => {
                    setDataUri(dataUri);
                });
            }
        })();
    }, [loadedFile]);

    return (
        <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field }) => (
                <div className="space-y-2">
                    {isLoading && <KeycloakSpinner />}
                    {dataUri && <img src={dataUri} width={200} height={200} alt="" className="rounded border" />}
                    <div className="flex gap-2 items-center">
                        <Input
                            id={name}
                            type="file"
                            accept=".png,.gif,.jpeg,.jpg,.svg,.webp,image/*"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    setFile(f);
                                    setIsLoading(true);
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        const dataUrl = ev.target?.result as string;
                                        setDataUri(dataUrl);
                                        field.onChange(dataUrl);
                                        setIsLoading(false);
                                    };
                                    reader.readAsDataURL(f);
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setFile(undefined);
                                field.onChange(undefined);
                                setDataUri("");
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                    {file?.name && <span className="text-sm text-muted-foreground">{file.name}</span>}
                </div>
            )}
        />
    );
};
