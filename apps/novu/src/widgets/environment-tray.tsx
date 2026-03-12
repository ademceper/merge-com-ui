import { useOrganization } from "@merge-rd/auth";
import {
	Tray,
	TrayHeader,
	TrayContent,
} from "@merge-rd/ui/components/tray";
import {
	ApiServiceLevelEnum,
	FeatureNameEnum,
	getFeatureForTierAsBoolean,
} from "@/shared";
import { IS_ENTERPRISE, IS_SELF_HOSTED } from "@/shared/config";
import { useFetchEnvironments } from "@/app/context/environment/hooks";
import { CreateEnvironmentButton } from "@/pages/settings/ui/environments/create-environment-button";
import { FreeTierState } from "@/pages/settings/ui/environments/environments-free-state";
import { EnvironmentsList } from "@/pages/settings/ui/environments/environments-list";
import { useFetchSubscription } from "@/shared/lib/hooks/use-fetch-subscription";

export function EnvironmentTray() {
	const { organization: currentOrganization } = useOrganization();
	const { environments = [], areEnvironmentsInitialLoading } =
		useFetchEnvironments({
			organizationId: currentOrganization?.id,
		});
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

	return (
		<Tray>
			<TrayHeader>Environments</TrayHeader>
			<TrayContent>

					<div className="flex flex-col justify-between gap-2 py-2">
						<div className="flex justify-end">
							<CreateEnvironmentButton />
						</div>
						<EnvironmentsList
							environments={environments}
							isLoading={areEnvironmentsInitialLoading}
						/>
					</div>

			</TrayContent>
		</Tray>
	);
}
