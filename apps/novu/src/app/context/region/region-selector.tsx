import { FeatureFlagsKeysEnum } from "@/shared";
import { useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/primitives/select";
import { IS_EU } from "@/shared/config";
import { useRegion } from "@/app/context/region";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";
import { REGIONS } from "./region-config";

const REGION_OPTIONS = REGIONS.map((region) => ({
	value: region.code,
	label: region.name,
	flag: region.flag,
}));

function useLaunchDarklyReady() {
	const ldClient = useLDClient();
	const [isReady, setIsReady] = useState(!ldClient);

	useEffect(() => {
		if (!ldClient) {
			setIsReady(true);
			return;
		}

		const waitForReady = async () => {
			try {
				await ldClient.waitUntilReady?.();
			} finally {
				setIsReady(true);
			}
		};

		waitForReady();
	}, [ldClient]);

	return isReady;
}

export function RegionSelector() {
	const { selectedRegion, setSelectedRegion } = useRegion();
	const isLDReady = useLaunchDarklyReady();
	const isRegionSelectorEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_REGION_SELECTOR_ENABLED,
		false,
	);
	const isInOrgCreation = window.location.pathname.includes(
		"/auth/organization-list",
	);

	if (IS_EU || !isLDReady || !isRegionSelectorEnabled) {
		return null;
	}

	const triggerClassName = isInOrgCreation
		? "h-8 w-auto min-w-[120px] border border-neutral-200 bg-background text-sm shadow-sm focus:ring-2 focus:ring-ring/20"
		: "h-[26px] w-auto min-w-[100px] border border-neutral-200/50 bg-background text-xs shadow-sm focus:ring-1 focus:ring-ring/20 px-2";

	return (
		<Select value={selectedRegion} onValueChange={setSelectedRegion}>
			<SelectTrigger className={triggerClassName}>
				<SelectValue placeholder="Select Region" />
			</SelectTrigger>
			<SelectContent>
				{REGION_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						<div className="flex items-center gap-2">
							<span className="text-sm">{option.flag}</span>
							<span className="text-xs font-medium">{option.label}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
