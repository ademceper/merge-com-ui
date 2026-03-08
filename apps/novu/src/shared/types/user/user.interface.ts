import type { IServicesHashes, JobTitleEnum } from "../../model";

export interface IUserEntity {
    _id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profilePicture?: string | null;
    createdAt: string;
    showOnBoarding?: boolean;
    showOnBoardingTour?: number;
    servicesHashes?: IServicesHashes;
    jobTitle?: JobTitleEnum;
    hasPassword: boolean;
}
