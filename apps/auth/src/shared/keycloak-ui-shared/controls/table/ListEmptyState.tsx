import { MouseEventHandler, PropsWithChildren, ReactNode } from "react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@merge/ui/components/empty";
import { Button } from "@merge/ui/components/button";
import { MagnifyingGlass, PlusCircle } from "@phosphor-icons/react";

export type Action = {
    text: string;
    type?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    onClick: MouseEventHandler<HTMLButtonElement>;
};

export type ListEmptyStateProps = {
    message: string;
    instructions: ReactNode;
    primaryActionText?: string;
    onPrimaryAction?: MouseEventHandler<HTMLButtonElement>;
    hasIcon?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
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
    icon: Icon,
    isDisabled = false,
    children
}: PropsWithChildren<ListEmptyStateProps>) => {
    const IconComponent = isSearchVariant ? MagnifyingGlass : (Icon || PlusCircle);

    return (
        <Empty data-testid="empty-state" className="py-12">
            <EmptyHeader>
                {hasIcon && (
                    <EmptyMedia variant="icon">
                        <IconComponent className="size-4" />
                    </EmptyMedia>
                )}
                <EmptyTitle className="text-base font-medium">{message}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{instructions}</EmptyDescription>
                {primaryActionText && (
                    <Button
                        data-testid={`${message.replace(/\W+/g, "-").toLowerCase()}-empty-action`}
                        variant="default"
                        onClick={onPrimaryAction}
                        disabled={isDisabled}
                    >
                        {primaryActionText}
                    </Button>
                )}
                {children}
                {secondaryActions && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {secondaryActions.map(action => (
                            <Button
                                key={action.text}
                                data-testid={`${action.text.replace(/\W+/g, "-").toLowerCase()}-empty-action`}
                                variant={action.type || "secondary"}
                                onClick={action.onClick}
                                disabled={isDisabled}
                            >
                                {action.text}
                            </Button>
                        ))}
                    </div>
                )}
            </EmptyContent>
        </Empty>
    );
};
