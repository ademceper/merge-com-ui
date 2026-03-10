import { useOrganization } from "@merge-rd/auth";
import { Button } from "@merge-rd/ui/components/button";
import {
	ApiServiceLevelEnum,
	FeatureNameEnum,
	getFeatureForTierAsBoolean,
} from "@/shared";
import { SidebarIcon } from "@phosphor-icons/react";
import { IS_ENTERPRISE, IS_SELF_HOSTED } from "@/shared/config";
import { useFetchEnvironments } from "@/app/context/environment/hooks";
import { CreateEnvironmentButton } from "@/pages/settings/ui/environments/create-environment-button";
import { FreeTierState } from "@/pages/settings/ui/environments/environments-free-state";
import { EnvironmentsList } from "@/pages/settings/ui/environments/environments-list";
import { useFetchSubscription } from "@/shared/lib/hooks/use-fetch-subscription";

type EnvironmentDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EnvironmentDrawer({ open, onOpenChange }: EnvironmentDrawerProps) {
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
		<div
			className="fixed inset-y-2 right-0 z-30 w-100 flex flex-col rounded-l-3xl bg-transparent text-sm transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
			style={{
				transform: open ? "translateX(0)" : "translateX(100%)",
			}}
		>
			<div className="flex items-center justify-between p-4">
				<h2 className="text-base font-medium text-foreground">
					Environments
				</h2>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => onOpenChange(false)}
				>
					<SidebarIcon className="size-4" />
				</Button>
			</div>
			<div className="flex-1 overflow-y-auto px-4 pb-4">
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
			</div>
		</div>
	);
}
