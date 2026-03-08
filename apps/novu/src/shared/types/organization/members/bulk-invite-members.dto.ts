interface IBulkInviteRequestDto {
    invitees: {
        email: string;
    }[];
}

interface IBulkInviteResponse {
    success: boolean;
    email: string;
}
