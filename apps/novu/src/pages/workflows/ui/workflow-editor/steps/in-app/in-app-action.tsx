import { InAppActionDropdown } from "@/pages/workflows/ui/in-app-action-dropdown";
import { useSaveForm } from "@/pages/workflows/ui/workflow-editor/steps/save-form-context";

export const InAppAction = () => {
	const { saveForm } = useSaveForm();

	return <InAppActionDropdown onMenuItemClick={saveForm} />;
};
