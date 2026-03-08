type IFormatterValueType = string | undefined;
type IFormatter = (data: unknown) => string | undefined;

export const toUpperCase = <T extends string>(name: T) =>
    (name.charAt(0).toUpperCase() + name.slice(1)) as Capitalize<T>;

export const toKey = (value: string) => value.replace(/\s/g, "-");

export const emptyFormatter = (): IFormatter => (data: unknown) => {
    const v = data as IFormatterValueType;
    return v ? v : "—";
};

export const upperCaseFormatter = (): IFormatter => (data: unknown) => {
    const value = (data as IFormatterValueType)?.toString();

    return (value ? toUpperCase(value) : undefined) as string;
};

export const capitalizeFirstLetterFormatter = (): IFormatter => (data: unknown) => {
    const value = (data as IFormatterValueType)?.toString();

    return (
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : undefined
    ) as string;
};
