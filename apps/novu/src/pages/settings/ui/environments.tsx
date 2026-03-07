import { useOrganization } from "@merge-rd/auth";
import {
	ApiServiceLevelEnum,
	FeatureNameEnum,
	getFeatureForTierAsBoolean,
} from "@/shared";
import { useEffect } from "react";
import { PageMeta } from "@/shared/ui/page-meta";
import { IS_ENTERPRISE, IS_SELF_HOSTED } from "@/shared/config";
import { useFetchEnvironments } from "@/app/context/environment/hooks";
import { useSetPageHeader } from "@/app/context/page-header";
import { CreateEnvironmentButton } from "@/pages/settings/ui/environments/create-environment-button";
import { FreeTierState } from "@/pages/settings/ui/environments/environments-free-state";
import { EnvironmentsList } from "@/pages/settings/ui/environments/environments-list";
import { useFetchSubscription } from "@/shared/lib/hooks/use-fetch-subscription";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { TelemetryEvent } from "@/shared/lib/telemetry";

export function EnvironmentsPage() {
	useSetPageHeader(<h1 className="text-foreground-950">Environments</h1>);
	const { organization: currentOrganization } = useOrganization();
	const { environments = [], areEnvironmentsInitialLoading } =
		useFetchEnvironments({
			organizationId: currentOrganization?.id,
		});
	const track = useTelemetry();
	const { subscription } = useFetchSubscription();

	const isTierEligibleForCustomEnvironments = getFeatureForTierAsBoolean(
		FeatureNameEnum.CUSTOM_ENVIRONMENTS_BOOLEAN,
		subscription?.apiServiceLevel || ApiServiceLevelEnum.FREE,
	);
	const isTrialActive = subscription?.trial?.isActive;
	const allowedToAccessEnvironments =
		areEnvironmentsInitialLoading ||
		!subscription ||
		(isTierEligibleForCustomEnvironments && !isTrialActive);
	const canAccessEnvironments =
		allowedToAccessEnvironments && (!IS_SELF_HOSTED || IS_ENTERPRISE);

	useEffect(() => {
		track(TelemetryEvent.ENVIRONMENTS_PAGE_VIEWED);
	}, [track]);

	return (
		<>
			<PageMeta title={`Environments`} />
			{canAccessEnvironments ? (
				<div className="flex flex-col justify-between gap-2 py-2">
					<div className="flex justify-end">
						<CreateEnvironmentButton />
					</div>
					<EnvironmentsList
						environments={environments}
						isLoading={areEnvironmentsInitialLoading}
					/>
				</div>
			) : (
				<FreeTierState />
			)}
		</>
	);
}
