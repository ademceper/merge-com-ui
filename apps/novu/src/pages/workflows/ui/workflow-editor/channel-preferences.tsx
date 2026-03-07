import { EnvironmentTypeEnum } from "@/shared";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";
import { ChannelPreferencesForm } from "./channel-preferences-form";

export function ChannelPreferences() {
	const { workflow, update } = useWorkflow();
	const { currentEnvironment } = useEnvironment();

	if (!workflow) {
		return null;
	}

	const isReadOnly = currentEnvironment?.type !== EnvironmentTypeEnum.DEV;

	return (
		<ChannelPreferencesForm
			workflow={workflow}
			update={update}
			isReadOnly={isReadOnly}
		/>
	);
}
