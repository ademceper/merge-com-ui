/* eslint-disable */
// @ts-nocheck
/** Column width helper (replaces @patternfly/react-table cellWidth). Returns transform-like object for table columns. */
export const cellWidth = (width: number) => ({
    width: width === 100 ? "100%" : `${width}%`,
});
export type IRowData = Record<string, unknown>;
