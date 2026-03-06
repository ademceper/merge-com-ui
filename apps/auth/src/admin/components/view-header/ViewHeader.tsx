import { Badge } from "@merge-rd/ui/components/badge";
import { buttonVariants } from "@merge-rd/ui/components/button";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { ReactElement, ReactNode, useState, isValidElement, Fragment } from "react";
import { useTranslation } from "react-i18next";

export type ViewHeaderProps = {
    titleKey: string;
    className?: string;
    badges?: ViewHeaderBadge[];
    isDropdownDisabled?: boolean;
    /** @deprecated No longer rendered */
    subKey?: string | ReactNode;
    /** @deprecated No longer rendered */
    helpUrl?: string;
    /** @deprecated No longer rendered */
    helpTextKey?: string;
    actionsDropdownId?: string;
    dropdownItems?: ReactElement[];
    dropdownIcon?: ReactNode;
    lowerDropdownItems?: any;
    lowerDropdownMenuTitle?: any;
    lowerButton?: any;
    isEnabled?: boolean;
    onToggle?: (value: boolean) => void;
    /** @deprecated No longer rendered */
    divider?: boolean;
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
    dropdownItems,
    dropdownIcon,
    lowerDropdownMenuTitle,
    lowerDropdownItems,
    lowerButton,
    isEnabled = true,
    onToggle,
    isReadOnly = false
}: ViewHeaderProps) => {
    const { t } = useTranslation();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isLowerDropdownOpen, setIsLowerDropdownOpen] = useState(false);

    const toKey = (value: string) => value.replace(/\s/g, "-");

    const hasContent = badges || onToggle || (dropdownItems && dropdownItems.length > 0) || lowerDropdownItems || lowerButton;
    if (!hasContent) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
                {badges && badges.map((badge, index) => (
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
                    </div>
                )}
                {dropdownItems && dropdownItems.length > 0 && (
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger
                            disabled={isDropdownDisabled}
                            id={actionsDropdownId}
                            data-testid="action-dropdown"
                            className={dropdownIcon ? buttonVariants({ variant: "ghost", size: "icon" }) : buttonVariants()}
                        >
                            {dropdownIcon || t("action")}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {dropdownItems}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
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
    );
};
