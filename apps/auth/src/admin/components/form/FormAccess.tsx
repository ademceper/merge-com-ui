import type { AccessType } from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";
import type { ComponentProps } from "react";

/** Form element props (replaces PatternFly FormProps). */
type FormProps = ComponentProps<"form">;
import {
    Children,
    cloneElement,
    isValidElement,
    PropsWithChildren,
    ReactElement,
    ReactNode
} from "react";
import { Controller } from "react-hook-form";

import { useAccess } from "../../context/access/Access";
import { FixedButtonsGroup } from "./FixedButtonGroup";

export type FormAccessProps = FormProps & {
    /**
     * One of the AccessType's that the user needs to have to view this form. Also see {@link useAccess}.
     * @type {AccessType}
     */
    role: AccessType;

    /**
     * An override property if fine grained access has been setup for this form.
     * @type {boolean}
     */
    fineGrainedAccess?: boolean;

    /**
     * Set unWrap when you don't want this component to wrap your "children" in a {@link Form} component.
     * @type {boolean}
     */
    unWrap?: boolean;

    /**
     * Overwrite the fineGrainedAccess and make form regardless of access rights.
     */
    isReadOnly?: boolean;

    /** Horizontal layout (PatternFly-style). */
    isHorizontal?: boolean;
};

/**
 * Use this in place of a patternfly Form component and add the `role` and `fineGrainedAccess` properties.
 * @param {FormAccessProps} param0 - all properties of Form + role and fineGrainedAccess
 */
export const FormAccess = ({
    children,
    role,
    fineGrainedAccess = false,
    isReadOnly = false,
    isHorizontal = false,
    unWrap = false,
    ...rest
}: PropsWithChildren<FormAccessProps>) => {
    const { hasAccess } = useAccess();

    const recursiveCloneChildren = (children: ReactNode, newProps: any): ReactNode => {
        return Children.map(children, child => {
            if (!isValidElement(child)) {
                return child;
            }

            if (child.props && typeof child.props === "object") {
                const element = child as ReactElement<Record<string, unknown>>;
                if (child.type === Controller) {
                    return cloneElement(child, {
                        ...element.props,
                        render: (props: unknown) => {
                            const renderElement = (element.props as { render: (p: unknown) => ReactElement }).render(props);
                            return cloneElement(renderElement, {
                                ...(renderElement.props as Record<string, unknown>),
                                ...newProps
                            } as Record<string, unknown>);
                        }
                    } as Record<string, unknown>);
                }
                const clonedChildren = recursiveCloneChildren(element.props.children as ReactNode, newProps);
                if (child.type === FixedButtonsGroup) {
                    return cloneElement(child, {
                        isActive: !(newProps as { isDisabled?: boolean }).isDisabled,
                        children: clonedChildren
                    } as Record<string, unknown>);
                }
                return cloneElement(child, { ...newProps, children: clonedChildren } as Record<string, unknown>);
            }
            return child;
        });
    };

    const isDisabled = isReadOnly || (!hasAccess(role) && !fineGrainedAccess);
    const disabledProps = isDisabled
        ? { isDisabled: true, disabled: true, readOnly: true }
        : {};

    return (
        <>
            {!unWrap && (
                <form {...rest} className={"keycloak__form " + (isHorizontal ? "pf-m-horizontal " : "") + (rest.className || "")}>
                    {recursiveCloneChildren(children, disabledProps)}
                </form>
            )}
            {unWrap && recursiveCloneChildren(children, disabledProps)}
        </>
    );
};
