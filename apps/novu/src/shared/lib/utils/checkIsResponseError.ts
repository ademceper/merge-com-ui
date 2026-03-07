import type { IResponseError } from "@/shared/model";

/**
 * Validate (type-guard) that an error response matches our IResponseError interface.
 */
const checkIsResponseError = (err: unknown): err is IResponseError => {
	return (
		!!err &&
		typeof err === "object" &&
		"error" in err &&
		"message" in err &&
		"statusCode" in err
	);
};
