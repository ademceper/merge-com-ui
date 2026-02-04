import { useState } from "react";
import { Button } from "@merge/ui/components/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge/ui/components/table";
import { useTranslation } from "react-i18next";
import { AuthorizationEvaluateResourcePolicies } from "./AuthorizationEvaluateResourcePolicies";
import type EvaluationResultRepresentation from "@keycloak/keycloak-admin-client/lib/defs/evaluationResultRepresentation";
import type PolicyResultRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyResultRepresentation";

type Props = {
    rowIndex: number;
    resource: EvaluationResultRepresentation;
    evaluateResults: any;
};

export const AuthorizationEvaluateResource = ({
    rowIndex,
    resource,
    evaluateResults
}: Props) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const { t } = useTranslation();

    return (
        <TableBody>
            <TableRow>
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
                    {resource.resource?.name}
                </TableCell>
                <TableCell id={resource.status?.toLowerCase()}>
                    {t(`${resource.status?.toLowerCase()}`)}
                </TableCell>
                <TableCell>
                    {resource.allowedScopes?.length
                        ? resource.allowedScopes.map(item => item.name)
                        : "-"}
                </TableCell>
            </TableRow>
            {expanded && (
                <TableRow key={`child-${resource.resource}`}>
                    <TableCell />
                    <TableCell colSpan={5}>
                        <div className="keycloak_resource_details py-2">
                            <Table aria-label={t("evaluationResults")} className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead aria-hidden="true" />
                                        <TableHead>{t("permission")}</TableHead>
                                        <TableHead>{t("results")}</TableHead>
                                        <TableHead>{t("decisionStrategy")}</TableHead>
                                        <TableHead>{t("grantedScopes")}</TableHead>
                                        <TableHead>{t("deniedScopes")}</TableHead>
                                        <TableHead aria-hidden="true" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.values(
                                        evaluateResults[rowIndex].policies
                                    ).map((outerPolicy, idx) => (
                                        <AuthorizationEvaluateResourcePolicies
                                            key={idx}
                                            idx={idx}
                                            rowIndex={rowIndex}
                                            outerPolicy={
                                                outerPolicy as PolicyResultRepresentation
                                            }
                                            resource={resource}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    );
};
