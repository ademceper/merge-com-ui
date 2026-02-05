import {
    ControllerProps,
    FieldPath,
    FieldValues,
    UseControllerProps
} from "react-hook-form";
import { SingleSelectControl } from "./SingleSelectControl";
import { TypeaheadSelectControl } from "./TypeaheadSelectControl";

type Variant = `${SelectVariant}`;

export enum SelectVariant {
    single = "single",
    typeahead = "typeahead",
    typeaheadMulti = "typeaheadMulti"
}

export type SelectControlOption = {
    key: string;
    value: string;
};

export type OptionType = string[] | SelectControlOption[];

export type SelectControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = UseControllerProps<T, P> & {
    id?: string;
    name: string;
    label?: string;
    options: OptionType;
    selectedOptions?: OptionType;
    labelIcon?: string;
    controller: Omit<ControllerProps, "name" | "render">;
    onFilter?: (value: string) => void;
    variant?: Variant;
    isDisabled?: boolean;
    menuAppendTo?: string;
    placeholderText?: string;
    chipGroupProps?: Record<string, unknown>;
    onSelect?: (
        value: string | string[],
        onChangeHandler: (value: string | string[]) => void
    ) => void;
    triggerClassName?: string;
    triggerStyle?: React.CSSProperties;
    /** Legacy PatternFly: scrollable menu; ignored in UI lib. */
    isScrollable?: boolean;
    maxMenuHeight?: string;
    className?: string;
};

export const isSelectBasedOptions = (
    options: OptionType
): options is SelectControlOption[] => typeof options[0] !== "string";

export const isString = (option: SelectControlOption | string): option is string =>
    typeof option === "string";
export const key = (option: SelectControlOption | string) =>
    isString(option) ? option : option.key;

export const SelectControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>({
    variant = SelectVariant.single,
    ...rest
}: SelectControlProps<T, P>) =>
    variant === SelectVariant.single ? (
        <SingleSelectControl {...rest} />
    ) : (
        <TypeaheadSelectControl {...rest} variant={variant} />
    );
