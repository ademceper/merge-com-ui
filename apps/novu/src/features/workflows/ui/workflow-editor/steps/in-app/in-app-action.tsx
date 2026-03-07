import { InAppActionDropdown } from "@/components/in-app-action-dropdown";
import { useSaveForm } from "@/features/workflows/components/workflow-editor/steps/save-form-context";

export const InAppAction = () => {
	const { saveForm } = useSaveForm();

	return <InAppActionDropdown onMenuItemClick={saveForm} />;
};
