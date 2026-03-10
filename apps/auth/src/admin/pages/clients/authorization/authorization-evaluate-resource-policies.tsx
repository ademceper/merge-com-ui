import type EvaluationResultRepresentation from "@keycloak/keycloak-admin-client/lib/defs/evaluationResultRepresentation";
import { DecisionEffect } from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import type PolicyResultRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyResultRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Link } from "@tanstack/react-router";
import { capitalize } from "lodash-es";
import { useState } from "react";
import { TableCell, TableRow } from "@merge-rd/ui/components/table";

import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import type { ClientParams } from "@/admin/shared/lib/routes/clients";
import { toPermissionDetails, toPolicyDetails } from "@/admin/shared/lib/routes/clients";
import { useParams } from "@/admin/shared/lib/use-params";

type Props = {
    idx: number;
    rowIndex: number;
    outerPolicy: PolicyResultRepresentation;
    resource: EvaluationResultRepresentation;
};

export const AuthorizationEvaluateResourcePolicies = ({
    idx,
    rowIndex,
    outerPolicy,
    resource
}: Props) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { clientId } = useParams<ClientParams>();

    return (
        <>
            <TableRow key={idx}>
                <TableCell>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-expanded={expanded}
                        onClick={() => setExpanded(prev => !prev)}
                    >
                        {expanded ? "▼" : "▶"}
                    </Button>
                </TableCell>
                <TableCell data-testid={`name-column-${resource.resource}`}>
                    <Link
                        to={
                            toPermissionDetails({
                                realm,
                                id: clientId,
                                permissionType: outerPolicy.policy?.type!,
                                permissionId: outerPolicy.policy?.id!
                            }) as string
                        }
                    >
                        {outerPolicy.policy?.name}
                    </Link>
                </TableCell>
                <TableCell id={outerPolicy.status?.toLowerCase()}>
                    {t(outerPolicy.status?.toLowerCase() as string)}
                </TableCell>
                <TableCell>
                    {t(`${outerPolicy.policy?.decisionStrategy?.toLowerCase()}`)}
                </TableCell>
                <TableCell>
                    {outerPolicy.status === DecisionEffect.Permit
                        ? resource.policies?.[rowIndex]?.scopes?.join(", ")
                        : "-"}
                </TableCell>
                <TableCell>
                    {outerPolicy.status === DecisionEffect.Deny &&
                    resource.policies?.[rowIndex]?.scopes?.length
                        ? resource.policies[rowIndex].scopes?.join(", ")
                        : "-"}
                </TableCell>
            </TableRow>
            {expanded && (
                <TableRow key={`child-${resource.resource}-${idx}`}>
                    <TableCell />
                    <TableCell colSpan={5}>
                        <div className="keycloak_resource_details py-2">
                            <ul className="list-disc list-inside space-y-1">
                                {outerPolicy.associatedPolicies?.map(item => (
                                    <li key={item.policy?.id ?? "policyDetails"}>
                                        <Link
                                            to={
                                                toPolicyDetails({
                                                    realm,
                                                    id: clientId,
                                                    policyType: item.policy?.type!,
                                                    policyId: item.policy?.id!
                                                }) as string
                                            }
                                        >
                                            {item.policy?.name}
                                        </Link>{" "}
                                        {t("votedToStatus", {
                                            status: capitalize(item.status as string)
                                        })}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};
