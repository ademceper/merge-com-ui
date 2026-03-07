import { useAuth } from "@merge-rd/auth";

type CheckAuthorizationWithCustomPermissions = (...args: any[]) => boolean;

import {
	ApiServiceLevelEnum,
	FeatureFlagsKeysEnum,
	FeatureNameEnum,
	type GetSubscriptionDto,
	getFeatureForTierAsBoolean,
} from "@/shared";
import { useMemo } from "react";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";
import { useFetchSubscription } from "@/shared/lib/hooks/use-fetch-subscription";

function isRbacEnabled(
	isRbacFlagEnabled: boolean,
	subscription: GetSubscriptionDto | undefined,
): boolean {
	return (
		isRbacFlagEnabled &&
		getFeatureForTierAsBoolean(
			FeatureNameEnum.ACCOUNT_ROLE_BASED_ACCESS_CONTROL_BOOLEAN,
			subscription?.apiServiceLevel || ApiServiceLevelEnum.FREE,
		)
	);
}

export function useHasPermission(): CheckAuthorizationWithCustomPermissions {
	const { has, isLoaded } = useAuth();
	const { subscription } = useFetchSubscription();
	const isRbacFlagEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_V2_ENABLED,
		false,
	);

	const isRbacFeatureEnabled = useMemo(
		() => isRbacEnabled(isRbacFlagEnabled, subscription),
		[isRbacFlagEnabled, subscription],
	);

	return useMemo(() => {
		if (!isRbacFeatureEnabled) {
			return () => true;
		}

		if (!isLoaded) {
			return () => false;
		}

		return has as CheckAuthorizationWithCustomPermissions;
	}, [has, isLoaded, isRbacFeatureEnabled]);
}
