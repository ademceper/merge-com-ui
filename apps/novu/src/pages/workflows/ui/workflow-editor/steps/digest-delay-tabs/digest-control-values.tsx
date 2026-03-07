import { Separator } from "@merge-rd/ui/components/separator";
import {
	FeatureFlagsKeysEnum,
	UiComponentEnum,
	UiSchemaGroupEnum,
} from "@/shared";
import { SidebarContent } from "@/widgets/side-navigation/sidebar";
import { getComponentByType } from "@/pages/workflows/ui/workflow-editor/steps/component-utils";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";

const extendToScheduleKey = "extendToSchedule";

export const DigestControlValues = () => {
	const isSubscribersScheduleEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_SUBSCRIBERS_SCHEDULE_ENABLED,
	);
	const { step } = useWorkflow();
	const { uiSchema } = step?.controls ?? {};

	if (!uiSchema || uiSchema?.group !== UiSchemaGroupEnum.DIGEST) {
		return null;
	}

	const {
		amount,
		digestKey,
		unit,
		cron,
		[extendToScheduleKey]: extendToSchedule,
	} = uiSchema.properties ?? {};

	return (
		<div className="flex flex-col">
			{digestKey && (
				<>
					<SidebarContent size="lg">
						{getComponentByType({
							component: digestKey.component,
						})}
					</SidebarContent>
					<Separator />
				</>
			)}
			{((amount && unit) || cron) && (
				<>
					<SidebarContent size="lg">
						{getComponentByType({
							component: amount.component || unit.component || cron.component,
						})}
					</SidebarContent>
					{isSubscribersScheduleEnabled && (
						<>
							<Separator />
							<SidebarContent>
								{getComponentByType({
									component:
										extendToSchedule?.component ??
										UiComponentEnum.EXTEND_TO_SCHEDULE,
								})}
							</SidebarContent>
						</>
					)}
					<Separator />
				</>
			)}
		</div>
	);
};
