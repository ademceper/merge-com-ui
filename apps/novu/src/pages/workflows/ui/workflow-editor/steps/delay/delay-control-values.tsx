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

const typeKey = "type";
const amountKey = "amount";
const unitKey = "unit";
const cronKey = "cron";
const dynamicKeyKey = "dynamicKey";
const extendToScheduleKey = "extendToSchedule";

export const DelayControlValues = () => {
	const isSubscribersScheduleEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_SUBSCRIBERS_SCHEDULE_ENABLED,
	);
	const { workflow, step } = useWorkflow();
	const { uiSchema } = step?.controls ?? {};

	if (!uiSchema || !workflow || uiSchema?.group !== UiSchemaGroupEnum.DELAY) {
		return null;
	}

	const {
		[typeKey]: type,
		[amountKey]: amount,
		[unitKey]: unit,
		[cronKey]: cron,
		[dynamicKeyKey]: dynamicKey,
		[extendToScheduleKey]: extendToSchedule,
	} = uiSchema.properties ?? {};

	return (
		<>
			{(type || amount || unit || cron || dynamicKey) && (
				<>
					<SidebarContent size="lg">
						{getComponentByType({
							component:
								type?.component ||
								amount?.component ||
								unit?.component ||
								cron?.component ||
								dynamicKey?.component,
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
		</>
	);
};
