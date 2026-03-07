import type { EnvironmentId } from "./environment";
import type { OrganizationId } from "./organization";
import type { UserId } from "./user";

type JobId = string;

interface IJobData {
	_id: JobId;
	_environmentId: EnvironmentId;
	_organizationId: OrganizationId;
	_userId: UserId;
}

interface IEventJobData {
	event: string;
	userId: string;
	payload?: Record<string, unknown>;
}
