import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/policy/$policyId/$policyType"
)({
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../../pages/clients/authorization/policy/policy-details"
            ),
        "PolicyDetails"
    )
});
