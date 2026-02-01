/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/components/diagram/ConditionalNode.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { memo } from "react";
import { Handle, Position } from "reactflow";

type ConditionalNodeProps = {
    data: { label: string };
    selected: boolean;
};

const ConditionalNodeInner = ({ data, selected }: ConditionalNodeProps) => {
    return (
        <>
            <Handle position={Position.Right} type="source" />
            <div
                className={`react-flow__node-default keycloak__authentication__conditional_node ${
                    selected ? "selected" : ""
                }`}
            >
                <div>{data.label}</div>
            </div>
            <Handle position={Position.Left} type="target" />
        </>
    );
};

export const ConditionalNode = memo(ConditionalNodeInner);
