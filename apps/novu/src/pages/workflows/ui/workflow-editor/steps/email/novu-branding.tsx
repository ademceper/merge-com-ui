import { Separator } from "@merge-rd/ui/components/separator";
import { Switch } from "@merge-rd/ui/components/switch";
import { cn } from "@merge-rd/ui/lib/utils";
import {
	ApiServiceLevelEnum,
	FeatureNameEnum,
	getFeatureForTierAsBoolean,
	ResourceOriginEnum,
} from "@/shared";
import type { HTMLAttributes } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { UpgradeCTATooltip } from "@/shared/ui/upgrade-cta-tooltip";
import { useFetchOrganizationSettings } from "@/pages/settings/api/use-fetch-organization-settings";
import { useUpdateOrganizationSettings } from "@/pages/settings/api/use-update-organization-settings";
import { useFetchSubscription } from "@/shared/lib/hooks/use-fetch-subscription";
import { ROUTES } from "@/shared/lib/routes";

type NovuBrandingProps = HTMLAttributes<HTMLDivElement> & {
	resourceOrigin: ResourceOriginEnum;
	isStepResolver?: boolean;
};

export const NovuBranding = ({
	className,
	resourceOrigin,
	isStepResolver,
	...rest
}: NovuBrandingProps) => {
	const { subscription } = useFetchSubscription();
	const navigate = useNavigate();
	const { data: organizationSettings, isLoading: isLoadingSettings } =
		useFetchOrganizationSettings();
	const updateOrganizationSettings = useUpdateOrganizationSettings();

	const canRemoveNovuBranding = getFeatureForTierAsBoolean(
		FeatureNameEnum.PLATFORM_REMOVE_NOVU_BRANDING_BOOLEAN,
		subscription?.apiServiceLevel || ApiServiceLevelEnum.FREE,
	);

	const removeNovuBranding = organizationSettings?.data?.removeNovuBranding;
	const isUpdating = updateOrganizationSettings.isPending;

	const showBranding =
		resourceOrigin === ResourceOriginEnum.NOVU_CLOUD &&
		!removeNovuBranding &&
		!isLoadingSettings &&
		!isStepResolver;

	if (!showBranding) return null;

	const handleRemoveBrandingChange = (value: boolean) => {
		updateOrganizationSettings.mutate({
			removeNovuBranding: value,
		});
	};

	const handleOrganizationSettingsClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate({ to: ROUTES.SETTINGS_ORGANIZATION });
	};

	/**
	 * Same branding is appended to the actual email
	 * @see apps/api/src/app/environments-v1/usecases/output-renderers/novu-branding-html.ts
	 */
	const brandingContent = (
		<div className="flex items-center">
			<img
				src="https://prod-novu-app-bucket.s3.us-east-1.amazonaws.com/assets/email-editor/powered-by-novu.png"
				alt="Novu"
				className="h-3 object-contain"
			/>
		</div>
	);

	const settingsTooltipContent = (
		<>
			<div className="flex w-full items-center justify-between">
				<span className="text-xs">Remove branding?</span>
				<Switch
					checked={removeNovuBranding}
					onCheckedChange={handleRemoveBrandingChange}
					disabled={isLoadingSettings || isUpdating}
				/>
			</div>

			<Separator />

			<div className="flex flex-col items-start">
				<p className="text-xs text-neutral-500">
					You can manage this in{" "}
					<button
						onClick={handleOrganizationSettingsClick}
						className="inline-flex items-center gap-1 font-medium underline hover:no-underline"
					>
						Organization settings ↗
					</button>{" "}
					later.
				</p>
			</div>
		</>
	);

	return (
		<div
			className={cn("flex items-center justify-center pb-6 pt-4", className)}
			{...rest}
		>
			{!canRemoveNovuBranding ? (
				<UpgradeCTATooltip
					description="Upgrade to remove Novu branding from your emails."
					utmSource="novu-branding-email"
					side="top"
					align="center"
				>
					{brandingContent}
				</UpgradeCTATooltip>
			) : (
				<Tooltip>
					<TooltipTrigger type="button">{brandingContent}</TooltipTrigger>
					<TooltipContent
						side="top"
						align="center"
						variant="light"
						size="lg"
						className="flex w-72 flex-col items-start gap-3 border border-neutral-100 p-2 shadow-md"
					>
						{settingsTooltipContent}
					</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
};
