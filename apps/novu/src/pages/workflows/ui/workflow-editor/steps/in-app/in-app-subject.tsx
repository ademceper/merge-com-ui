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
import { capitalize, containsHTMLEntities } from "@/shared/lib/string";

const subjectKey = "subject";

export const InAppSubject = () => {
	const { control, getValues } = useFormContext();
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
								autoFocus
								enableTranslations
							/>
						</InputRoot>
					</FormControl>
					{/**
					 * In app, either subject or body must be present. When both are missing, the errors should be shown once under the body.
					 * To do that, this is a quick hack to only hide "Subject or Body is required" from the In-App subject.
					 */}
					<FormMessage
						suppressError={fieldState.error?.message?.includes("is required")}
					>
						{containsHTMLEntities(field.value) &&
							!getValues("disableOutputSanitization") &&
							"HTML entities detected. Consider disabling content sanitization for proper rendering"}
					</FormMessage>
				</FormItem>
			)}
		/>
	);
};
