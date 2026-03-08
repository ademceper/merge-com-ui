import { createFileRoute, Navigate } from "@tanstack/react-router";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import { useParams } from "@tanstack/react-router";

function WebhooksRedirect() {
	const { environmentSlug } = useParams({ strict: false });
	return (
		<Navigate
			to={buildRoute(ROUTES.WEBHOOKS_ENDPOINTS, {
				environmentSlug: environmentSlug as string,
			})}
			replace
		/>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/webhooks",
)({
	component: WebhooksRedirect,
});
