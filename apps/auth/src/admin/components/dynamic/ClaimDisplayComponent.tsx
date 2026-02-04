import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { MinusCircle, PlusCircle } from "@phosphor-icons/react";
import { useEffect, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import type { ComponentProps } from "./components";

type ClaimDisplayEntry = {
    name: string;
    locale: string;
};

type IdClaimDisplayEntry = ClaimDisplayEntry & {
    id: string;
};

const generateId = () => crypto.randomUUID();

export const ClaimDisplayComponent = ({
    name,
    label,
    helpText,
    required,
    isDisabled,
    defaultValue,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const { getValues, setValue, register } = useFormContext();
    const [displays, setDisplays] = useState<IdClaimDisplayEntry[]>([]);
    const fieldName = convertToName(name!);
    const debounceTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        register(fieldName);
        const value = getValues(fieldName) || defaultValue;

        try {
            const parsed: ClaimDisplayEntry[] = value
                ? typeof value === "string"
                    ? JSON.parse(value)
                    : value
                : [];
            setDisplays(parsed.map(entry => ({ ...entry, id: generateId() })));
        } catch {
            setDisplays([]);
        }
    }, [defaultValue, fieldName, getValues, register]);

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current !== null) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const appendNew = () => {
        const newDisplays = [...displays, { name: "", locale: "", id: generateId() }];
        setDisplays(newDisplays);
        syncFormValue(newDisplays);
    };

    const syncFormValue = (val = displays) => {
        const filteredEntries = val
            .filter(e => e.name !== "" && e.locale !== "")
            .map(entry => ({ name: entry.name, locale: entry.locale }));

        setValue(fieldName, JSON.stringify(filteredEntries), {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    const debouncedUpdate = (val: IdClaimDisplayEntry[]) => {
        if (debounceTimeoutRef.current !== null) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = window.setTimeout(() => {
            syncFormValue(val);
            debounceTimeoutRef.current = null;
        }, 300);
    };

    const flushUpdate = () => {
        if (debounceTimeoutRef.current !== null) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
        syncFormValue();
    };

    const updateName = (index: number, name: string) => {
        const newDisplays = [
            ...displays.slice(0, index),
            { ...displays[index], name },
            ...displays.slice(index + 1)
        ];
        setDisplays(newDisplays);
        debouncedUpdate(newDisplays);
    };

    const updateLocale = (index: number, locale: string) => {
        const newDisplays = [
            ...displays.slice(0, index),
            { ...displays[index], locale },
            ...displays.slice(index + 1)
        ];
        setDisplays(newDisplays);
        debouncedUpdate(newDisplays);
    };

    const remove = (index: number) => {
        const value = [...displays.slice(0, index), ...displays.slice(index + 1)];
        setDisplays(value);
        syncFormValue(value);
    };

    return displays.length !== 0 ? (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <strong>{t("claimDisplayName")}</strong>
                    </div>
                    <div className="flex-1">
                        <strong>{t("claimDisplayLocale")}</strong>
                    </div>
                </div>
                {displays.map((display, index) => (
                    <div className="flex gap-2" key={display.id} data-testid="claim-display-row">
                        <div className="flex-1">
                            <Input
                                id={`${fieldName}.${index}.name`}
                                data-testid={`${fieldName}.${index}.name`}
                                value={display.name}
                                onChange={(e) => updateName(index, e.target.value)}
                                onBlur={() => flushUpdate()}
                                disabled={isDisabled}
                                placeholder={t("claimDisplayNamePlaceholder")}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                id={`${fieldName}.${index}.locale`}
                                data-testid={`${fieldName}.${index}.locale`}
                                value={display.locale}
                                onChange={(e) => updateLocale(index, e.target.value)}
                                onBlur={() => flushUpdate()}
                                disabled={isDisabled}
                                placeholder={t("claimDisplayLocalePlaceholder")}
                            />
                        </div>
                        <div>
                            <Button
                                variant="link"
                                title={t("removeClaimDisplay")}
                                disabled={isDisabled}
                                onClick={() => remove(index)}
                                data-testid={`${fieldName}.${index}.remove`}
                            >
                                <MinusCircle className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-2">
                <Button
                    data-testid={`${fieldName}-add-row`}
                    className="px-0 mt-1"
                    variant="link"
                    onClick={() => appendNew()}
                >
                    <PlusCircle className="size-4 mr-1" />
                    {t("addClaimDisplay")}
                </Button>
            </div>
        </div>
    ) : (
        <div
            data-testid={`${fieldName}-empty-state`}
            className="p-0 text-center"
        >
            <p className="text-muted-foreground">{t("noClaimDisplayEntries")}</p>
            <div className="mt-2">
                <Button
                    data-testid={`${fieldName}-add-row`}
                    variant="link"
                    size="sm"
                    onClick={appendNew}
                    disabled={isDisabled}
                >
                    <PlusCircle className="size-4 mr-1" />
                    {t("addClaimDisplay")}
                </Button>
            </div>
        </div>
    );
};
