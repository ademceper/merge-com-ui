const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9_:.-]+$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const VALID_ID_REGEX = new RegExp(
	`${ALPHANUMERIC_REGEX.source}|${EMAIL_REGEX.source}`,
);
