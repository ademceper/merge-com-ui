import { createFileRoute } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../shared/ui/skeletons/detail-skeleton";

// This route exists for the route tree but the parent page (realm-settings-tabs)
// renders the ThemesTab component directly with the required props.
export const Route = createFileRoute("/_app/$realm/realm-settings/themes/$tab")({
    pendingComponent: DetailSkeleton,
    component: () => null
});
