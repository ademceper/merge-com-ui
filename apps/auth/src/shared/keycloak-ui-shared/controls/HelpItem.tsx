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

import { Icon, Popover } from "../../@patternfly/react-core";
import { HelpIcon } from "../../@patternfly/react-icons";
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
    return enabled ? (
        <Popover bodyContent={helpText}>
            <>
                {!unWrap && (
                    <button
                        data-testid={`help-label-${fieldLabelId}`}
                        aria-label={fieldLabelId}
                        onClick={e => e.preventDefault()}
                        className="pf-v5-c-form__group-label-help"
                    >
                        <Icon isInline={noVerticalAlign}>
                            <HelpIcon />
                        </Icon>
                    </button>
                )}
                {unWrap && (
                    <Icon isInline={noVerticalAlign}>
                        <HelpIcon />
                    </Icon>
                )}
            </>
        </Popover>
    ) : null;
};
