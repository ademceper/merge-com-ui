import { useFormContext } from "react-hook-form";
import { AvatarPicker } from "@/shared/ui/primitives/form/avatar-picker";
import {
	FormControl,
	FormField,
	FormItem,
} from "@/shared/ui/primitives/form/form";
import { useSaveForm } from "@/features/workflows/ui/workflow-editor/steps/save-form-context";

const avatarKey = "avatar";

export const InAppAvatar = () => {
	const { control } = useFormContext();
	const { saveForm } = useSaveForm();

	return (
		<FormField
			control={control}
			name={avatarKey}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<AvatarPicker
							{...field}
							onPick={(value) => {
								field.onChange(value);
								saveForm();
							}}
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	);
};
