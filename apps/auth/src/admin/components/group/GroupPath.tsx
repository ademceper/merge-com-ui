/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/group/GroupPath.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useState } from "react";
import { Tooltip } from "../../../shared/@patternfly/react-core";
import type { TableTextProps } from "../../../shared/@patternfly/react-table";

import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";

type GroupPathProps = TableTextProps & {
    group: GroupRepresentation;
};

export const GroupPath = ({
    group: { path },
    onMouseEnter: onMouseEnterProp,
    ...props
}: GroupPathProps) => {
    const [tooltip, setTooltip] = useState("");
    const onMouseEnter = (event: any) => {
        setTooltip(path!);
        onMouseEnterProp?.(event);
    };
    const text = (
        <span onMouseEnter={onMouseEnter} {...props}>
            {path}
        </span>
    );

    return tooltip !== "" ? (
        <Tooltip content={tooltip} isVisible>
            {text}
        </Tooltip>
    ) : (
        text
    );
};
