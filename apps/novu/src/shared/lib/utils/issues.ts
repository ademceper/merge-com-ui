export enum ContentIssueEnum {
	ILLEGAL_VARIABLE_IN_CONTROL_VALUE = "ILLEGAL_VARIABLE_IN_CONTROL_VALUE",
	MISSING_VALUE = "MISSING_VALUE",
	}

enum IntegrationIssueEnum {
	MISSING_INTEGRATION = "MISSING_INTEGRATION",
	INBOX_NOT_CONNECTED = "INBOX_NOT_CONNECTED",
}

export class RuntimeIssue {
	issueType: ContentIssueEnum | IntegrationIssueEnum;
	variableName?: string;
	message: string;
}
