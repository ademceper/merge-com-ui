/** Column width helper (replaces @patternfly/react-table cellWidth). Returns ITransform for KeycloakDataTable columns. */
export const cellWidth = (width: number) => (): { className?: string } => ({
    className: width === 100 ? "w-full" : `w-[${width}%]`,
});
export type IRowData = Record<string, unknown>;
