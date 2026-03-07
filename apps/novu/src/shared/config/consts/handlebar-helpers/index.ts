export * from "./getTemplateVariables";
export * from "./handlebarHelpers";

const novuReservedVariableNames = ["body"];

function isReservedVariableName(variableName: string) {
	return novuReservedVariableNames.includes(variableName);
}
