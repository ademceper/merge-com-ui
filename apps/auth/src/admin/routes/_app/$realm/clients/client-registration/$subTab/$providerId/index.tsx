import { createFileRoute } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../shared/ui/skeletons/form-skeleton";

// This route exists for the route tree but the parent page
// renders the ClientRegistrationList component directly with the required props.
export const Route = createFileRoute(
    "/_app/$realm/clients/client-registration/$subTab/$providerId/"
)({
    pendingComponent: FormSkeleton,
    component: () => null
});
