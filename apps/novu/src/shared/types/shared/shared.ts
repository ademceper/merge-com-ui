interface ISuccessResponseDto {
    success: boolean;
}

interface IServerResponse<T> {
    data: T;
}

interface IPaginatedResponseDto<T> {
    hasMore: boolean;

    page: number;

    pageSize: number;

    data: T[];
}
