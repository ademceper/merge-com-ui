import type { IWorkflowOverrideRequestDto } from "./workflow-override.dto";

interface ICreateWorkflowOverrideRequestDto
	extends IWorkflowOverrideRequestDto {
	workflowId: string;

	tenantId: string;
}
