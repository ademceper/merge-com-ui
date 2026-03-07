import type { DirectionEnum } from "../../model";

class CursorPaginationDto<T, K extends keyof T> {
	limit?: number;
	cursor?: string;
	orderDirection?: DirectionEnum;
	orderBy?: K;
}
