/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/table/ListEmptyState.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ComponentClass, MouseEventHandler, PropsWithChildren, ReactNode } from "react";
import {
    EmptyState,
    EmptyStateIcon,
    EmptyStateBody,
    Button,
    ButtonVariant,
    EmptyStateActions,
    EmptyStateHeader,
    EmptyStateFooter
} from "../../../@patternfly/react-core";
import type { SVGIconProps } from "@patternfly/react-icons/dist/js/createIcon";
import { MagnifyingGlass, PlusCircle } from "@phosphor-icons/react";

export type Action = {
    text: string;
    type?: ButtonVariant;
    onClick: MouseEventHandler<HTMLButtonElement>;
};

export type ListEmptyStateProps = {
    message: string;
    instructions: ReactNode;
    primaryActionText?: string;
    onPrimaryAction?: MouseEventHandler<HTMLButtonElement>;
    hasIcon?: boolean;
    icon?: ComponentClass<SVGIconProps>;
    isSearchVariant?: boolean;
    secondaryActions?: Action[];
    isDisabled?: boolean;
};

export const ListEmptyState = ({
    message,
    instructions,
    onPrimaryAction,
    hasIcon = true,
    isSearchVariant,
    primaryActionText,
    secondaryActions,
    icon,
    isDisabled = false,
    children
}: PropsWithChildren<ListEmptyStateProps>) => {
    return (
        <EmptyState data-testid="empty-state" variant="lg">
            {hasIcon && isSearchVariant ? (
                <EmptyStateIcon icon={MagnifyingGlass as unknown as ComponentClass<SVGIconProps>} />
            ) : (
                hasIcon && <EmptyStateIcon icon={(icon as ComponentClass<SVGIconProps>) || (PlusCircle as unknown as ComponentClass<SVGIconProps>)} />
            )}
            <EmptyStateHeader titleText={message} headingLevel="h1" />
            <EmptyStateBody>{instructions}</EmptyStateBody>
            <EmptyStateFooter>
                {primaryActionText && (
                    <Button
                        data-testid={`${message
                            .replace(/\W+/g, "-")
                            .toLowerCase()}-empty-action`}
                        variant="primary"
                        onClick={onPrimaryAction}
                        isDisabled={isDisabled}
                    >
                        {primaryActionText}
                    </Button>
                )}
                {children}
                {secondaryActions && (
                    <EmptyStateActions>
                        {secondaryActions.map(action => (
                            <Button
                                key={action.text}
                                data-testid={`${action.text
                                    .replace(/\W+/g, "-")
                                    .toLowerCase()}-empty-action`}
                                variant={action.type || ButtonVariant.secondary}
                                onClick={action.onClick}
                                isDisabled={isDisabled}
                            >
                                {action.text}
                            </Button>
                        ))}
                    </EmptyStateActions>
                )}
            </EmptyStateFooter>
        </EmptyState>
    );
};
