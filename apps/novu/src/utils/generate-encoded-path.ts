import { generatePath, type PathParam } from "react-router-dom";

export type PathParams<Path extends string> = {
	[key in PathParam<Path>]: string;
};

/**
 * Generates a URL-safe path by interpolating and encoding parameters.
 * Unlike buildRoute, this uses React Router's generatePath and encodes
 * each parameter value to handle special characters safely.
 */
export function generateEncodedPath<Path extends string>(
	originalPath: Path,
	params: PathParams<Path>,
): string {
	const encodedParams = structuredClone(params);

	for (const key in encodedParams) {
		const pathKey = key as PathParam<Path>;
		encodedParams[pathKey] = encodeURIComponent(encodedParams[pathKey]);
	}

	return generatePath(originalPath, encodedParams);
}
