import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "./components";

export const FileComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    required,
    isDisabled = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();
    const [filename, setFilename] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
            <Controller
                name={convertToName(name!)}
                control={control}
                defaultValue={defaultValue || ""}
                render={({ field }) => (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Input
                                id={name!}
                                type="file"
                                disabled={isDisabled}
                                className="flex-1"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setFilename(file.name);
                                        setIsLoading(true);
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            field.onChange(reader.result ?? "");
                                            setIsLoading(false);
                                        };
                                        reader.readAsText(file);
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isDisabled || isLoading}
                                onClick={() => {
                                    field.onChange("");
                                    setFilename("");
                                }}
                            >
                                {t("clear")}
                            </Button>
                        </div>
                        {isLoading && <span className="text-sm text-muted-foreground">{t("loading")}</span>}
                        {filename && <span className="text-sm text-muted-foreground truncate">{filename}</span>}
                    </div>
                )}
            />
        </div>
    );
};
