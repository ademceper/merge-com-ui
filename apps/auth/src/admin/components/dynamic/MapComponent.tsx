import { HelpItem, generateId } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { MinusCircle, PlusCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyValueType } from "../key-value-form/key-value-convert";
import type { ComponentProps } from "./components";

type IdKeyValueType = KeyValueType & {
    id: number;
};

export const MapComponent = ({
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
    const [map, setMap] = useState<IdKeyValueType[]>([]);
    const fieldName = convertToName(name!);

    useEffect(() => {
        register(fieldName);
        const values: KeyValueType[] = JSON.parse(
            getValues(fieldName) || defaultValue || "[]"
        );
        setMap(values.map(value => ({ ...value, id: generateId() })));
    }, []);

    const appendNew = () => setMap([...map, { key: "", value: "", id: generateId() }]);

    const update = (val = map) => {
        setValue(
            fieldName,
            JSON.stringify(
                val.filter(e => e.key !== "").map(({ id, ...entry }) => entry)
            )
        );
    };

    const updateKey = (index: number, key: string) => {
        updateEntry(index, { ...map[index], key });
    };

    const updateValue = (index: number, value: string) => {
        updateEntry(index, { ...map[index], value });
    };

    const updateEntry = (index: number, entry: IdKeyValueType) =>
        setMap([...map.slice(0, index), entry, ...map.slice(index + 1)]);

    const remove = (index: number) => {
        const value = [...map.slice(0, index), ...map.slice(index + 1)];
        setMap(value);
        update(value);
    };

    return map.length !== 0 ? (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <strong>{t("key")}</strong>
                    </div>
                    <div className="flex-1">
                        <strong>{t("value")}</strong>
                    </div>
                </div>
                {map.map((attribute, index) => (
                    <div className="flex gap-2" key={attribute.id} data-testid="row">
                        <div className="flex-1">
                            <Input
                                name={`${fieldName}.${index}.key`}
                                placeholder={t("keyPlaceholder")}
                                aria-label={t("key")}
                                defaultValue={attribute.key}
                                data-testid={`${fieldName}.${index}.key`}
                                onChange={(e) => updateKey(index, e.target.value)}
                                onBlur={() => update()}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                name={`${fieldName}.${index}.value`}
                                placeholder={t("valuePlaceholder")}
                                aria-label={t("value")}
                                defaultValue={attribute.value}
                                data-testid={`${fieldName}.${index}.value`}
                                onChange={(e) => updateValue(index, e.target.value)}
                                onBlur={() => update()}
                            />
                        </div>
                        <div>
                            <Button
                                variant="link"
                                title={t("removeAttribute")}
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
                    {t("addAttribute", { label })}
                </Button>
            </div>
        </div>
    ) : (
        <div
            data-testid={`${name}-empty-state`}
            className="p-0 text-center"
        >
            <p className="text-muted-foreground">{t("missingAttributes", { label })}</p>
            <div className="mt-2">
                <Button
                    data-testid={`${name}-add-row`}
                    variant="link"
                    size="sm"
                    onClick={appendNew}
                    disabled={isDisabled}
                >
                    <PlusCircle className="size-4 mr-1" />
                    {t("addAttribute", { label })}
                </Button>
            </div>
        </div>
    );
};
