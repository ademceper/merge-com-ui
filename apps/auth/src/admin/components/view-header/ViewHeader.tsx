/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/view-header/ViewHeader.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { Label } from "@merge/ui/components/label";
import { Separator } from "@merge/ui/components/separator";
import { Switch } from "@merge/ui/components/switch";
import { ReactElement, ReactNode, useState, isValidElement, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { FormattedLink } from "../external-link/FormattedLink";
import { useHelp, HelpItem } from "../../../shared/keycloak-ui-shared";
import "../../help-urls";

export type ViewHeaderProps = {
    titleKey: string;
    className?: string;
    badges?: ViewHeaderBadge[];
    isDropdownDisabled?: boolean;
    subKey?: string | ReactNode;
    actionsDropdownId?: string;
    helpUrl?: string | undefined;
    dropdownItems?: ReactElement[];
    lowerDropdownItems?: any;
    lowerDropdownMenuTitle?: any;
    lowerButton?: any;
    isEnabled?: boolean;
    onToggle?: (value: boolean) => void;
    divider?: boolean;
    helpTextKey?: string;
    isReadOnly?: boolean;
};

export type ViewHeaderBadge = {
    id?: string;
    text?: string | ReactNode;
    readonly?: boolean;
};

export const ViewHeader = ({
    actionsDropdownId,
    className,
    titleKey,
    badges,
    isDropdownDisabled,
    subKey,
    helpUrl,
    dropdownItems,
    lowerDropdownMenuTitle,
    lowerDropdownItems,
    lowerButton,
    isEnabled = true,
    onToggle,
    divider = true,
    helpTextKey,
    isReadOnly = false
}: ViewHeaderProps) => {
    const { t, i18n } = useTranslation();
    const { enabled } = useHelp();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isLowerDropdownOpen, setIsLowerDropdownOpen] = useState(false);

    const onDropdownToggle = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const onLowerDropdownToggle = () => {
        setIsLowerDropdownOpen(!isLowerDropdownOpen);
    };

    const toKey = (value: string) => value.replace(/\s/g, "-");

    return (
        <>
            <div className="bg-muted/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1
                            className={className}
                            data-testid="view-header"
                        >
                            {i18n.exists(titleKey) ? t(titleKey) : titleKey}
                        </h1>
                        {badges && (
                            <>
                                {badges.map((badge, index) => (
                                    <Fragment key={index}>
                                        {!isValidElement(badge.text) && (
                                            <Badge
                                                data-testid={badge.id}
                                                variant={badge.readonly ? "secondary" : "default"}
                                            >
                                                {badge.text}
                                            </Badge>
                                        )}
                                        {isValidElement(badge.text) && badge.text}
                                    </Fragment>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {onToggle && (
                            <div className="flex items-center gap-2 mr-4">
                                <Label htmlFor={`${toKey(titleKey)}-switch`} className="text-sm">
                                    {t("enabled")}
                                </Label>
                                <Switch
                                    id={`${toKey(titleKey)}-switch`}
                                    data-testid={`${titleKey}-switch`}
                                    disabled={isReadOnly}
                                    checked={isEnabled}
                                    aria-label={t("enabled")}
                                    onCheckedChange={onToggle}
                                />
                                {helpTextKey && (
                                    <HelpItem
                                        helpText={t(helpTextKey)}
                                        fieldLabelId={`${toKey(titleKey)}-switch`}
                                    />
                                )}
                            </div>
                        )}
                        {dropdownItems && dropdownItems.length > 0 && (
                            <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        disabled={isDropdownDisabled}
                                        id={actionsDropdownId}
                                        data-testid="action-dropdown"
                                    >
                                        {t("action")}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {dropdownItems}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
                {enabled && (
                    <p id="view-header-subkey" className="text-muted-foreground mt-1">
                        {isValidElement(subKey)
                            ? subKey
                            : subKey
                              ? t(subKey as string)
                              : ""}
                        {helpUrl && (
                            <FormattedLink
                                title={t("learnMore")}
                                href={helpUrl}
                                isInline
                                className="ml-4"
                            />
                        )}
                    </p>
                )}
                {lowerDropdownItems && (
                    <DropdownMenu open={isLowerDropdownOpen} onOpenChange={setIsLowerDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button id="ufToggleId">
                                {t(lowerDropdownMenuTitle)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {lowerDropdownItems}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {lowerButton && (
                    <Button
                        variant={lowerButton.variant === "primary" ? "default" : (lowerButton.variant as "outline" | "secondary" | "ghost" | "link" | "destructive")}
                        onClick={lowerButton.onClick}
                        data-testid="viewHeader-lower-btn"
                    >
                        {lowerButton.lowerButtonTitle}
                    </Button>
                )}
            </div>
            {divider && <Separator />}
        </>
    );
};
