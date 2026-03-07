import type { DirectionEnum } from "../../model";

export class CursorPaginationDto<T, K extends keyof T> {
	limit?: number;
	cursor?: string;
	orderDirection?: DirectionEnum;
	orderBy?: K;
}
