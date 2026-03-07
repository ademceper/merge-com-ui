import { LimitOffsetPaginationDto } from "../../model";
import type { WorkflowResponseDto } from "./workflow.dto";

class GetListQueryParams extends LimitOffsetPaginationDto<
	WorkflowResponseDto,
	"updatedAt" | "name" | "lastTriggeredAt"
> {
	query?: string;
}
