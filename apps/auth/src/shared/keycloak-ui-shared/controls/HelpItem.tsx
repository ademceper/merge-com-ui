/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/HelpItem.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Question } from "@phosphor-icons/react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import { ReactNode } from "react";
import { useHelp } from "../context/HelpContext";

type HelpItemProps = {
    helpText: string | ReactNode;
    fieldLabelId: string;
    noVerticalAlign?: boolean;
    unWrap?: boolean;
};

export const HelpItem = ({
    helpText,
    fieldLabelId,
    noVerticalAlign = true,
    unWrap = false
}: HelpItemProps) => {
    const { enabled } = useHelp();
    if (!enabled) return null;
    const icon = <Question size={14} className={noVerticalAlign ? "inline-block align-middle" : ""} />;
    return (
        <Popover>
            {!unWrap ? (
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        data-testid={`help-label-${fieldLabelId}`}
                        aria-label={fieldLabelId}
                        onClick={(e) => e.preventDefault()}
                        className="text-muted-foreground hover:text-foreground rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {icon}
                    </button>
                </PopoverTrigger>
            ) : (
                <span>{icon}</span>
            )}
            <PopoverContent className="max-w-sm p-3 text-sm" side="top">
                {helpText}
            </PopoverContent>
        </Popover>
    );
};
