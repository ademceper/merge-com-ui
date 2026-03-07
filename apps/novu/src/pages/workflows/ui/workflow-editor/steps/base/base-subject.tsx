import { useFormContext } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/shared/ui/primitives/form/form";
import { InputRoot } from "@/shared/ui/primitives/input";
import { ControlInput } from "@/pages/workflows/ui/workflow-editor/control-input";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";
import { useParseVariables } from "@/shared/lib/hooks/use-parse-variables";
import { capitalize } from "@/shared/lib/string";

const subjectKey = "subject";

export const BaseSubject = () => {
	const { control } = useFormContext();
	const { step, digestStepBeforeCurrent } = useWorkflow();
	const { variables, isAllowedVariable } = useParseVariables(
		step?.variables,
		digestStepBeforeCurrent?.stepId,
	);

	return (
		<FormField
			control={control}
			name={subjectKey}
			render={({ field, fieldState }) => (
				<FormItem className="w-full">
					<FormControl>
						<InputRoot hasError={!!fieldState.error}>
							<ControlInput
								multiline={false}
								indentWithTab={false}
								placeholder={capitalize(field.name)}
								id={field.name}
								value={field.value}
								onChange={field.onChange}
								variables={variables}
								isAllowedVariable={isAllowedVariable}
								enableTranslations
							/>
						</InputRoot>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
