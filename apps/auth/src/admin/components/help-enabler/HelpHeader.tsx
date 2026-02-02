/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/help-enabler/HelpHeader.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useHelp } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { Label } from "@merge/ui/components/label";
import { Separator } from "@merge/ui/components/separator";
import { Switch } from "@merge/ui/components/switch";
import { Question } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import helpUrls from "../../help-urls";
import { FormattedLink } from "../external-link/FormattedLink";

export const HelpHeader = () => {
    const [open, setOpen] = useState(false);
    const help = useHelp();
    const { t } = useTranslation();

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Help"
                    id="help"
                    data-testid="help-toggle"
                >
                    <Question className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <FormattedLink
                        data-testId="documentation-link"
                        href={helpUrls.documentationUrl}
                        title={t("documentation")}
                    />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="enable" onSelect={e => e.preventDefault()}>
                    <div className="flex items-center justify-between gap-4 w-full">
                        <Label htmlFor="enableHelp" className="flex-1">
                            {t("enableHelpMode")}
                        </Label>
                        <Switch
                            id="enableHelp"
                            aria-label={t("enableHelp")}
                            checked={help.enabled}
                            className="keycloak_help-header-switch"
                            onCheckedChange={() => help.toggleHelp()}
                        />
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
