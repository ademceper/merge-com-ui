import { Separator } from "@merge-rd/ui/components/separator";
import { UiSchemaGroupEnum } from "@novu/shared";
import { SidebarContent } from "@/components/side-navigation/sidebar";
import { getComponentByType } from "@/features/workflows/components/workflow-editor/steps/component-utils";
import { useWorkflow } from "@/features/workflows/components/workflow-editor/workflow-provider";

export const ThrottleEditor = () => {
	const { step } = useWorkflow();
	const { uiSchema } = step?.controls ?? {};

	if (!uiSchema || uiSchema?.group !== UiSchemaGroupEnum.THROTTLE) {
		return null;
	}

	const { type, amount, unit, dynamicKey, threshold, throttleKey } =
		uiSchema.properties ?? {};

	return (
		<div className="flex flex-col">
			{(type || amount || unit || dynamicKey) && (
				<>
					<SidebarContent size="lg">
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
					<SidebarContent size="lg">
						{getComponentByType({
							component: threshold.component,
						})}
					</SidebarContent>
					<Separator />
				</>
			)}
			{throttleKey && (
				<>
					<SidebarContent size="lg">
						{getComponentByType({
							component: throttleKey.component,
						})}
					</SidebarContent>
					<Separator />
				</>
			)}
		</div>
	);
};
