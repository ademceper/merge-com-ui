export enum DirectionEnum {
	ASC = "ASC",
	DESC = "DESC",
}
export interface IResponseError {
	error: string;
	message: string;
	statusCode: number;
}

interface IPaginatedResponse<T = unknown> {
	data: T[];
	hasMore: boolean;
	totalCount: number;
	pageSize: number;
	page: number;
}

type KeysOfT<T> = keyof T;

export class LimitOffsetPaginationDto<T, K extends KeysOfT<T>> {
	limit: string;
	offset: string;
	orderDirection?: DirectionEnum;
	orderBy?: K;
}

interface IPaginationParams {
	page: number;
	limit: number;
}

interface IPaginationWithQueryParams extends IPaginationParams {
	query?: string;
}

enum OrderDirectionEnum {
	ASC = 1,
	DESC = -1,
}

enum OrderByEnum {
	ASC = "ASC",
	DESC = "DESC",
}
