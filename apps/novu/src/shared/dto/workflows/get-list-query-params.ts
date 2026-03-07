import { LimitOffsetPaginationDto } from "../../model";
import type { WorkflowResponseDto } from "./workflow.dto";

export class GetListQueryParams extends LimitOffsetPaginationDto<
	WorkflowResponseDto,
	"updatedAt" | "name" | "lastTriggeredAt"
> {
	query?: string;
}
