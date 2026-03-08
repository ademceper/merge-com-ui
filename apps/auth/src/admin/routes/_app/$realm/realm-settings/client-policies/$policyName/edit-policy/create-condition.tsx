import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$policyName/edit-policy/create-condition"
)({
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../pages/realm-settings/new-client-policy-condition"
            ),
        "NewClientPolicyCondition"
    )
});
