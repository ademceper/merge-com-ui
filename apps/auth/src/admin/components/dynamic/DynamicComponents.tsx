import type { ConfigPropertyRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation";

import { COMPONENTS, type ComponentLayoutOptions, isValidComponentType } from "./components";
import { convertAttributeNameToForm } from "../../util";

/** Layout overrides by component type (e.g. all List/MultivaluedList/boolean get same layout). */
export type LayoutOverridesByType = Partial<Record<string, ComponentLayoutOptions>>;

type DynamicComponentProps = {
    properties: ConfigPropertyRepresentation[];
    stringify?: boolean;
    isNew?: boolean;
    convertToName?: (name: string) => string;
    /** Layout overrides per property name (e.g. "allowed-client-scopes" => { hideLabel: true, helpIconAfterControl: true }). */
    layoutOverrides?: Record<string, ComponentLayoutOptions>;
    /** Layout overrides by component type; applied to all fields of that type (e.g. List, MultivaluedList, boolean). Per-property layoutOverrides take precedence. */
    layoutOverridesByType?: LayoutOverridesByType;
};

export const DynamicComponents = ({
    convertToName: convert,
    properties,
    layoutOverrides,
    layoutOverridesByType,
    ...rest
}: DynamicComponentProps) => (
    <>
        {properties.map(property => {
            const componentType = property.type!;
            if (isValidComponentType(componentType)) {
                const Component = COMPONENTS[componentType];
                const options: ComponentLayoutOptions = {
                    ...layoutOverridesByType?.[componentType],
                    ...layoutOverrides?.[property.name!],
                };
                return (
                    <Component
                        key={property.name}
                        {...property}
                        {...rest}
                        {...options}
                        convertToName={convert || convertToName}
                    />
                );
            } else {
                console.warn(`There is no editor registered for ${componentType}`);
            }
        })}
    </>
);

export const convertToName = (name: string): string =>
    convertAttributeNameToForm(`config.${name}`);
