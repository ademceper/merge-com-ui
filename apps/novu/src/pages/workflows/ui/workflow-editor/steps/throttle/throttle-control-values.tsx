import { Separator } from "@merge-rd/ui/components/separator";
import { UiSchemaGroupEnum } from "@/shared";
import { SidebarContent } from "@/widgets/side-navigation/sidebar";
import { getComponentByType } from "@/pages/workflows/ui/workflow-editor/steps/component-utils";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";

const typeKey = "type";
const amountKey = "amount";
const unitKey = "unit";
const dynamicKeyKey = "dynamicKey";
const thresholdKey = "threshold";
const throttleKeyKey = "throttleKey";

export const ThrottleControlValues = () => {
	const { workflow, step } = useWorkflow();
	const { uiSchema } = step?.controls ?? {};

	if (
		!uiSchema ||
		!workflow ||
		uiSchema?.group !== UiSchemaGroupEnum.THROTTLE
	) {
		return null;
	}

	const {
		[typeKey]: type,
		[amountKey]: amount,
		[unitKey]: unit,
		[dynamicKeyKey]: dynamicKey,
		[thresholdKey]: threshold,
		[throttleKeyKey]: throttleKey,
	} = uiSchema.properties ?? {};

	return (
		<>
			{(type || amount || unit || dynamicKey) && (
				<>
					<SidebarContent>
						{getComponentByType({
							component:
								type?.component ||
								amount?.component ||
								unit?.component ||
								dynamicKey?.component,
						})}
					</SidebarContent>
					<Separator />
				</>
			)}
			{threshold && (
				<>
					<SidebarContent>
						{getComponentByType({ component: threshold.component })}
					</SidebarContent>
					<Separator />
				</>
			)}
			{throttleKey && (
				<>
					<SidebarContent>
						{getComponentByType({ component: throttleKey.component })}
					</SidebarContent>
					<Separator />
				</>
			)}
		</>
	);
};
