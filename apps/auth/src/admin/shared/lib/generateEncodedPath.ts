/**
 * Extracts parameter names from a path template.
 * Supports both `:param` and `$param` syntax.
 */
export type PathParam<Path extends string> =
    Path extends `${string}:${infer Param}/${infer Rest}`
        ? Param | PathParam<`/${Rest}`>
        : Path extends `${string}:${infer Param}`
            ? Param
            : never;

/**
 * Represents an object that contains the parameters to be included in a path.
 *
 * @example
 * const params: PathParams<"/user/:id"> = { id: "123" };
 */
export type PathParams<Path extends string> = {
    [key in PathParam<Path>]: string;
};

/**
 * Generates a path by replacing `:param` placeholders with encoded parameter values.
 *
 * @param originalPath - The path template to use to generate the path.
 * @param params - An object that contains the parameters to be included in the path.
 *
 * @example
 * const path = "/:realm/users/:id/:tab";
 * const params = { realm: "master", id: "123", tab: "settings" };
 * const encodedPath = generateEncodedPath(path, params);
 * // encodedPath will be "/master/users/123/settings"
 */
export function generateEncodedPath<Path extends string>(
    originalPath: Path,
    params: PathParams<Path>
): string {
    let result: string = originalPath;

    for (const key in params) {
        const value = encodeURIComponent((params as Record<string, string>)[key]);
        result = result.replace(`:${key}`, value);
    }

    // Remove optional param markers
    result = result.replace(/\/:\w+\?/g, "");

    return result;
}
