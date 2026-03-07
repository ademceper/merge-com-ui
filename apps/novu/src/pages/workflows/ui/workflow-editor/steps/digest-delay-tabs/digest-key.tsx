import { Button } from "@merge-rd/ui/components/button";
import { EnvironmentTypeEnum, ResourceOriginEnum } from "@/shared";
import { X } from "@phosphor-icons/react";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Code2 } from "@/shared/ui/icons/code-2";
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/primitives/form/form";
import { useEnvironment } from "@/app/context/environment/hooks";
import { VariableSelect } from "@/pages/workflows/ui/conditions-editor/variable-select";
import { useSaveForm } from "@/pages/workflows/ui/workflow-editor/steps/save-form-context";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";
import { useParseVariables } from "@/shared/lib/hooks/use-parse-variables";

function parseLiquidVariables(value: string | undefined): string {
	const matches = value?.match(/{{(.*?)}}/g) || [];
	return matches.map((match) => match.replace(/[{}]/g, "").trim()).join(" ");
}

const FORM_CONTROL_NAME = "controlValues.digestKey";

export const DigestKey = () => {
	const { step, workflow } = useWorkflow();
	const { variables } = useParseVariables(step?.variables);
	const payloadVariables = useMemo(
		() => variables.filter((variable) => variable.name.startsWith("payload.")),
		[variables],
	);
	const form = useFormContext();
	const { control, setValue } = form;
	const { saveForm } = useSaveForm();
	const { currentEnvironment } = useEnvironment();
	const isReadOnly =
		workflow?.origin === ResourceOriginEnum.EXTERNAL ||
		currentEnvironment?.type !== EnvironmentTypeEnum.DEV;

	return (
		<FormField
			control={control}
			name={FORM_CONTROL_NAME}
			render={({ field }) => (
				<FormItem className="flex w-full flex-col">
					<FormLabel tooltip="Digest is grouped by the subscriberId by default. You can add one more aggregation key to group events further.">
						Group events by
					</FormLabel>
					<div className="flex flex-row gap-1">
						<div className="flex h-[28px] items-center gap-1">
							<Code2 className="text-feature size-3 min-w-3" />
							<span className="text-foreground-600 whitespace-nowrap text-xs font-normal">
								subscriberId -{" "}
							</span>
						</div>
						<VariableSelect
							key={field.value || "empty"} // This key is used to force the component to re-render when the value changes
							leftIcon={<Code2 className="text-feature size-3 min-w-3" />}
							onChange={(value) => {
								if (value) {
									setValue(FORM_CONTROL_NAME, `{{${value}}}`, {
										shouldDirty: true,
									});
									saveForm();
								}
							}}
							options={payloadVariables.map((variable) => ({
								label: variable.name,
								value: variable.name,
							}))}
							value={parseLiquidVariables(field.value)}
							placeholder="payload."
							className="w-full"
							emptyState={
								<p className="text-foreground-600 mt-1 p-1 text-xs">
									Refine the digest aggregation key further by specifying a
									payload variable
								</p>
							}
							disabled={isReadOnly}
						/>
						<div className="transition-all duration-200 ease-in-out">
							{field.value && (
								<Button
									variant="secondary"
									mode="ghost"
									size="2xs"
									className="hover:bg-muted animate-in fade-in slide-in-from-right-4 h-[28px] w-[28px] p-0 duration-200"
									onClick={() => {
										setValue(FORM_CONTROL_NAME, "", { shouldDirty: true });
										saveForm();
									}}
									disabled={isReadOnly}
								>
									<X className="size-3" />
								</Button>
							)}
						</div>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
