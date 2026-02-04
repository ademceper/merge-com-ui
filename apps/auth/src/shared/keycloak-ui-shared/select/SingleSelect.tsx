
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { Children, isValidElement, useState, type ReactNode } from "react";
import type { KeycloakSelectProps } from "./KeycloakSelect";

type SingleSelectProps = Omit<KeycloakSelectProps, "variant">;

/** Recursively collect items with value prop (SelectItem or legacy SelectOption). */
function collectSelectItems(nodes: ReactNode): Array<{ value: unknown; children: ReactNode; key?: React.Key }> {
    const out: Array<{ value: unknown; children: ReactNode; key?: React.Key }> = [];
    Children.forEach(nodes, (child) => {
        if (!isValidElement<{ value?: unknown; children?: ReactNode }>(child)) return;
        if (child.props?.value !== undefined && child.props?.value !== null) {
            out.push({
                value: child.props.value,
                children: child.props.children,
                key: child.key ?? undefined,
            });
        } else if (child.props?.children != null) {
            out.push(...collectSelectItems(child.props.children));
        }
    });
    return out;
}

export const SingleSelect = ({
    toggleId,
    onToggle,
    onSelect,
    selections,
    isOpen,
    placeholderText,
    className,
    isDisabled,
    children,
    ...props
}: SingleSelectProps) => {
    const [open, setOpen] = useState(false);
    const controlledOpen = isOpen !== undefined ? isOpen : open;
    const setControlledOpen = (v: boolean) => {
        if (isOpen === undefined) setOpen(v);
        onToggle(v);
    };

    const items = collectSelectItems(children);
    const valueToStr = (v: unknown) =>
        v == null ? "" : typeof v === "object" ? (v as { id?: string })?.id ?? JSON.stringify(v) : String(v);
    const value = selections != null ? valueToStr(selections) : "";
    const valueMap = new Map<string, unknown>();
    items.forEach((item) => valueMap.set(valueToStr(item.value), item.value));

    return (
        <Select
            value={value || undefined}
            onValueChange={(v) => {
                onSelect?.(valueMap.get(v) ?? v);
                setControlledOpen(false);
            }}
            open={controlledOpen}
            onOpenChange={setControlledOpen}
            disabled={isDisabled}
        >
            <SelectTrigger
                id={toggleId}
                className={className}
                aria-label={props["aria-label"]}
            >
                <SelectValue placeholder={placeholderText} />
            </SelectTrigger>
            <SelectContent>
                {items.map((item, i) => {
                    const valueStr = valueToStr(item.value);
                    return (
                        <SelectItem key={item.key ?? i} value={valueStr}>
                            {item.children ?? valueStr}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
};
