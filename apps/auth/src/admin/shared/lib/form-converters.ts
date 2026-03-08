import { flatten } from "flat";
import type { FieldValues, Path, PathValue, UseFormSetValue } from "react-hook-form";
import {
    arrayToKeyValue,
    type KeyValueType,
    keyValueToArray
} from "../ui/key-value-form/key-value-convert";
import type { ReplaceString } from "./types";

export const beerify = <T extends string>(name: T) =>
    name.replaceAll(".", "🍺") as ReplaceString<T, ".", "🍺">;

export const debeerify = <T extends string>(name: T) =>
    name.replaceAll("🍺", ".") as ReplaceString<T, "🍺", ".">;

export function convertAttributeNameToForm<T>(name: string): PathValue<T, Path<T>> {
    const index = name.indexOf(".");
    return `${name.substring(0, index)}.${beerify(name.substring(index + 1))}` as PathValue<
        T,
        Path<T>
    >;
}

const isAttributesObject = (value: any) =>
    Object.values(value).filter(value => Array.isArray(value) && value.length >= 1)
        .length !== 0;

const isAttributeArray = (value: any) => {
    if (!Array.isArray(value)) {
        return false;
    }

    return value.some(e => Object.hasOwn(e, "key") && Object.hasOwn(e, "value"));
};

const isEmpty = (obj: any) => Object.keys(obj).length === 0;

export function convertToFormValues<T extends FieldValues>(
    obj: FieldValues,
    setValue: UseFormSetValue<T>
) {
    Object.entries(obj).map(entry => {
        const [key, value] = entry as [Path<T>, any];
        if (key === "attributes" && isAttributesObject(value)) {
            setValue(key, arrayToKeyValue(value as Record<string, string[]>));
        } else if (key === "config" || key === "attributes") {
            if (!isEmpty(value)) {
                const flattened: any = flatten(value, { safe: true });
                const convertedValues = Object.entries(flattened).map(([key, value]) =>
                    Array.isArray(value) && value.length === 1
                        ? [key, value[0]]
                        : [key, value]
                );

                convertedValues.forEach(([k, v]) =>
                    setValue(`${key}.${beerify(k)}` as Path<T>, v)
                );
            } else {
                setValue(key, undefined as PathValue<T, Path<T>>);
            }
        } else {
            setValue(key, value);
        }
    });
}

export function convertFormValuesToObject<T extends Record<string, any>, G = T>(
    obj: T
): G {
    const result: any = {};
    Object.entries(obj).map(([key, value]) => {
        if (isAttributeArray(value)) {
            result[key] = keyValueToArray(value as KeyValueType[]);
        } else if (key === "config" || key === "attributes") {
            result[key] = Object.fromEntries(
                Object.entries((value as Record<string, unknown> | undefined) || {}).map(
                    ([k, v]) => [debeerify(k), v]
                )
            );
        } else {
            result[key] = value;
        }
    });
    return result;
}
