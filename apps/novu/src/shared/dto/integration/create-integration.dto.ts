import type { ChannelTypeEnum } from "../../model";
import type { IConstructIntegrationDto } from "./construct-integration.interface";

interface ICreateIntegrationBodyDto extends IConstructIntegrationDto {
	providerId: string;
	channel: ChannelTypeEnum;
}
