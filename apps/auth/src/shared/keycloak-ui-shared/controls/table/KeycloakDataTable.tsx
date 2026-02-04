
import { ArrowsClockwise, CaretDown, CaretRight, DotsThreeVertical } from "@phosphor-icons/react";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { cloneDeep, get, intersectionBy } from "lodash-es";
import {
    createElement,
    Fragment,
    ReactNode,
    isValidElement,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type JSX,
    type ComponentType
} from "react";
import { useTranslation } from "react-i18next";
import { useFetch } from "../../utils/useFetch";
import { useStoredState } from "../../utils/useStoredState";
import { KeycloakSpinner } from "../KeycloakSpinner";
import { ListEmptyState } from "./ListEmptyState";
import { PaginatingTableToolbar } from "./PaginatingTableToolbar";

// Local types (replacing PatternFly table types)
export type IRowCell = { title: ReactNode } | ReactNode;
export type IFormatter = (value: unknown) => unknown;
export type ITransform = () => { className?: string; width?: string };
export type IAction = {
    title: string | ReactNode;
    onClick?: (event: React.MouseEvent, rowIndex: number, rowData: unknown) => void;
    isDisabled?: boolean;
};
export type IActions = IAction[];
export type IActionsResolver = (row: IRow, extraData: { rowIndex?: number }) => IActions | undefined;
export type IRow = {
    data: unknown;
    cells: IRowCell[];
    disableSelection?: boolean;
    disableActions?: boolean;
};

type TitleCell = { title: JSX.Element };
type Cell<T> = keyof T | JSX.Element | TitleCell;

type BaseRow<T> = {
    data: T;
    cells: Cell<T>[];
};

type Row<T> = BaseRow<T> & {
    selected: boolean;
    isOpen?: boolean;
    disableSelection: boolean;
    disableActions: boolean;
};

type SubRow<T> = BaseRow<T> & {
    parent: number;
};

type DataTableProps<T> = {
    ariaLabelKey: string;
    columns: Field<T>[];
    rows: (Row<T> | SubRow<T>)[];
    actions?: IActions;
    actionResolver?: IActionsResolver;
    selected?: T[];
    onSelect?: (value: T[]) => void;
    onCollapse?: (isOpen: boolean, rowIndex: number) => void;
    canSelectAll: boolean;
    canSelect: boolean;
    isNotCompact?: boolean;
    isRadio?: boolean;
};

type CellRendererProps = {
    row: IRow;
    index?: number;
    actions?: IActions;
    actionResolver?: IActionsResolver;
};

const isRowCell = (c: ReactNode | IRowCell): c is IRowCell =>
    !!c && typeof c === "object" && "title" in c;

const CellRenderer = ({ row, index = 0, actions, actionResolver }: CellRendererProps) => {
    const items = actions || actionResolver?.(row, { rowIndex: index });
    return (
        <>
            {row.cells!.map((c, i) => (
                <TableCell key={`cell-${i}`}>
                    {isRowCell(c) ? (c as { title: ReactNode }).title : (c as ReactNode)}
                </TableCell>
            ))}
            {items && items.length > 0 && !row.disableActions && (
                <TableCell className="w-[50px] text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
                                <DotsThreeVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {items.map((action, i) =>
                                (action as IAction & { isSeparator?: boolean }).isSeparator ? (
                                    <DropdownMenuSeparator key={i} />
                                ) : (
                                    <DropdownMenuItem
                                        key={i}
                                        disabled={action.isDisabled}
                                        onClick={e => action.onClick?.(e, index, row.data)}
                                    >
                                        {action.title}
                                    </DropdownMenuItem>
                                )
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            )}
        </>
    );
};

const ExpandableRowRenderer = ({ row }: CellRendererProps) =>
    row.cells!.map((c, i) => (
        <div key={`cell-${i}`} className="py-2 pl-4">
            {isRowCell(c) ? (c as { title: ReactNode }).title : (c as ReactNode)}
        </div>
    ));

function DataTable<T>({
    columns,
    rows,
    actions,
    actionResolver,
    ariaLabelKey,
    selected,
    onSelect,
    onCollapse,
    canSelectAll,
    canSelect,
    isNotCompact,
    isRadio,
}: DataTableProps<T>) {
    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<T[]>(selected || []);
    const [expandedRows, setExpandedRows] = useState<boolean[]>([]);

    const rowsSelectedOnPage = useMemo(
        () =>
            intersectionBy(
                selectedRows,
                rows.map(row => row.data),
                "id"
            ),
        [selectedRows, rows]
    );

    useEffect(() => {
        if (canSelectAll) {
            const selectAllCheckbox = document.getElementsByName("check-all").item(0);
            if (selectAllCheckbox) {
                const checkbox = selectAllCheckbox as HTMLInputElement;
                checkbox.indeterminate =
                    rowsSelectedOnPage.length < rows.length &&
                    rowsSelectedOnPage.length > 0;
            }
        }
    }, [selectedRows, canSelectAll, rows]);

    const updateSelectedRows = (selected: T[]) => {
        setSelectedRows(selected);
        onSelect?.(selected);
    };

    const updateState = (rowIndex: number, isSelected: boolean) => {
        if (isRadio) {
            const selectedRow = isSelected ? [rows[rowIndex].data] : [];
            updateSelectedRows(selectedRow);
        } else {
            if (rowIndex === -1) {
                const rowsSelectedOnPageIds = rowsSelectedOnPage.map(v => get(v, "id"));
                updateSelectedRows(
                    isSelected
                        ? [...selectedRows, ...rows.map(row => row.data)]
                        : selectedRows.filter(
                              v => !rowsSelectedOnPageIds.includes(get(v, "id"))
                          )
                );
            } else {
                if (isSelected) {
                    updateSelectedRows([...selectedRows, rows[rowIndex].data]);
                } else {
                    updateSelectedRows(
                        selectedRows.filter(
                            v => get(v, "id") !== get((rows[rowIndex] as IRow).data, "id")
                        )
                    );
                }
            }
        }
    };

    const mainRows = rows.filter((_, i) => !("parent" in rows[i])) as Row<T>[];
    const hasExpand = !!onCollapse && mainRows.some((_, i) => rows[i * 2 + 1] && (rows[i * 2 + 1] as SubRow<T>).cells?.length > 0);

    return (
        <Table aria-label={t(ariaLabelKey)} className={isNotCompact ? "" : "text-sm"}>
            <TableHeader>
                <TableRow>
                    {hasExpand && (
                        <TableHead className="w-10" scope="col">
                            <span className="sr-only">{t("expandRow")}</span>
                        </TableHead>
                    )}
                    {canSelect && (
                        <TableHead className="w-10 pr-0" scope="col">
                            {canSelectAll ? (
                                <>
                                    <span className="sr-only">{t("selectAll")}</span>
                                    <Checkbox
                                        name="check-all"
                                        checked={rowsSelectedOnPage.length === rows.length}
                                        onCheckedChange={checked =>
                                            updateState(-1, !!checked)
                                        }
                                        aria-label={t("selectAll")}
                                        className="mt-1"
                                    />
                                </>
                            ) : (
                                <span className="sr-only">{t("select")}</span>
                            )}
                        </TableHead>
                    )}
                    {columns.map(column => (
                        <TableHead
                            key={column.displayKey || column.name}
                            className={column.transforms?.[0]?.()?.className}
                        >
                            {t(column.displayKey || column.name)}
                        </TableHead>
                    ))}
                    {((actions && actions.length > 0) || actionResolver) && (
                        <TableHead className="w-[50px]" scope="col" />
                    )}
                </TableRow>
            </TableHeader>
            <TableBody>
                {!onCollapse
                    ? mainRows.map((row, index) => (
                          <TableRow key={index}>
                              {canSelect && (
                                  <TableCell className="pr-0">
                                      <Checkbox
                                          checked={!!selectedRows.find(
                                              v => get(v, "id") === get(row.data, "id")
                                          )}
                                          disabled={row.disableSelection}
                                          onCheckedChange={checked =>
                                              updateState(index, !!checked)
                                          }
                                          aria-label={t("selectRow")}
                                      />
                                  </TableCell>
                              )}
                              <CellRenderer
                                  row={row as IRow}
                                  index={index}
                                  actions={actions}
                                  actionResolver={actionResolver}
                              />
                          </TableRow>
                      ))
                    : mainRows.map((row, index) => {
                          const subRow = rows[index * 2 + 1] as SubRow<T> | undefined;
                          const hasSub = subRow?.cells?.length;
                          const isExpanded = expandedRows[index] ?? false;
                          return (
                              <Fragment key={index}>
                                  <TableRow>
                                      {hasExpand && (
                                          <TableCell className="w-10">
                                              {hasSub ? (
                                                  <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="size-8"
                                                      onClick={() => {
                                                          onCollapse(!isExpanded, index);
                                                          setExpandedRows(prev => {
                                                              const n = [...prev];
                                                              n[index] = !isExpanded;
                                                              return n;
                                                          });
                                                      }}
                                                      aria-expanded={isExpanded}
                                                      aria-label={t("expandRow")}
                                                  >
                                                      {isExpanded ? (
                                                          <CaretDown className="size-4" />
                                                      ) : (
                                                          <CaretRight className="size-4" />
                                                      )}
                                                  </Button>
                                              ) : null}
                                          </TableCell>
                                      )}
                                      {canSelect && (
                                          <TableCell className="pr-0">
                                              <Checkbox
                                                  checked={!!selectedRows.find(
                                                      v => get(v, "id") === get(row.data, "id")
                                                  )}
                                                  disabled={row.disableSelection}
                                                  onCheckedChange={checked =>
                                                      updateState(index, !!checked)
                                                  }
                                                  aria-label={t("selectRow")}
                                              />
                                          </TableCell>
                                      )}
                                      <CellRenderer
                                          row={row as IRow}
                                          index={index}
                                          actions={actions}
                                          actionResolver={actionResolver}
                                      />
                                  </TableRow>
                                  {hasSub && isExpanded && (
                                      <TableRow key={`${index}-exp`} className="bg-muted/30">
                                          <TableCell
                                              colSpan={
                                                  (canSelect ? 1 : 0) +
                                                  (hasExpand ? 1 : 0) +
                                                  columns.length +
                                                  1
                                              }
                                              className="border-b py-0"
                                          >
                                              <ExpandableRowRenderer
                                                  row={subRow as IRow}
                                                  index={index}
                                                  actions={actions}
                                                  actionResolver={actionResolver}
                                              />
                                          </TableCell>
                                      </TableRow>
                                  )}
                              </Fragment>
                          );
                      })}
            </TableBody>
        </Table>
    );
}

export type Field<T> = {
    name: string;
    displayKey?: string;
    cellFormatters?: IFormatter[];
    transforms?: ITransform[];
    cellRenderer?: (row: T) => JSX.Element | string;
};

export type DetailField<T> = {
    name: string;
    enabled?: (row: T) => boolean;
    cellRenderer?: (row: T) => JSX.Element | string;
};

export type Action<T> = IAction & {
    onRowClick?: (row: T) => Promise<boolean | void> | void;
    /** Legacy: render a separator in the actions dropdown. */
    isSeparator?: boolean;
};

export type LoaderFunction<T> = (
    first?: number,
    max?: number,
    search?: string
) => Promise<T[]>;

export type DataListProps<T> = {
    loader: T[] | LoaderFunction<T>;
    onSelect?: (value: T[]) => void;
    canSelectAll?: boolean;
    detailColumns?: DetailField<T>[];
    isRowDisabled?: (value: T) => boolean;
    isPaginated?: boolean;
    ariaLabelKey: string;
    searchPlaceholderKey?: string;
    columns: Field<T>[];
    actions?: Action<T>[];
    actionResolver?: IActionsResolver;
    searchTypeComponent?: ReactNode;
    toolbarItem?: ReactNode;
    subToolbar?: ReactNode;
    emptyState?: ReactNode;
    icon?: ComponentType<{ className?: string }>;
    isNotCompact?: boolean;
    isRadio?: boolean;
    isSearching?: boolean;
    className?: string;
};

export function KeycloakDataTable<T>({
    ariaLabelKey,
    searchPlaceholderKey,
    isPaginated = false,
    onSelect,
    canSelectAll = false,
    isNotCompact,
    isRadio,
    detailColumns,
    isRowDisabled,
    loader,
    columns,
    actions,
    actionResolver,
    searchTypeComponent,
    toolbarItem,
    subToolbar,
    emptyState,
    icon,
    isSearching = false,
    ...props
}: DataListProps<T>) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<T[]>([]);
    const [rows, setRows] = useState<(Row<T> | SubRow<T>)[]>();
    const [unPaginatedData, setUnPaginatedData] = useState<T[]>();
    const [loading, setLoading] = useState(false);

    const [defaultPageSize, setDefaultPageSize] = useStoredState(
        localStorage,
        "pageSize",
        10
    );

    const [max, setMax] = useState(defaultPageSize);
    const [first, setFirst] = useState(0);
    const [search, setSearch] = useState<string>("");
    const prevSearch = useRef<string | undefined>(undefined);

    const [key, setKey] = useState(0);
    const prevKey = useRef<number | undefined>(undefined);
    const refresh = () => setKey(key + 1);
    const id = useId();

    const renderCell = (columns: (Field<T> | DetailField<T>)[], value: T) => {
        return columns.map(col => {
            if ("cellFormatters" in col) {
                const v = get(value, col.name);
                return col.cellFormatters?.reduce((s, f) => f(s), v);
            }
            if (col.cellRenderer) {
                const Component = col.cellRenderer;
                return { title: createElement(Component as ComponentType<T>, value) };
            }
            return get(value, col.name);
        });
    };

    const convertToColumns = (data: T[]): (Row<T> | SubRow<T>)[] => {
        const isDetailColumnsEnabled = (value: T) => detailColumns?.[0]?.enabled?.(value);
        return data
            .map((value, index) => {
                const disabledRow = isRowDisabled ? isRowDisabled(value) : false;
                const row: (Row<T> | SubRow<T>)[] = [
                    {
                        data: value,
                        disableSelection: disabledRow,
                        disableActions: disabledRow,
                        selected: !!selected.find(v => get(v, "id") === get(value, "id")),
                        isOpen: isDetailColumnsEnabled(value) ? false : undefined,
                        cells: renderCell(columns, value)
                    }
                ];
                if (detailColumns) {
                    row.push({
                        parent: index * 2,
                        cells: isDetailColumnsEnabled(value)
                            ? renderCell(detailColumns!, value)
                            : []
                    } as SubRow<T>);
                }
                return row;
            })
            .flat();
    };

    const getNodeText = (node: Cell<T>): string => {
        if (["string", "number"].includes(typeof node)) {
            return node!.toString();
        }
        if (node instanceof Array) {
            return node.map(getNodeText).join("");
        }
        if (typeof node === "object") {
            return getNodeText(
                isValidElement((node as TitleCell).title)
                    ? (node as TitleCell).title.props
                    : Object.values(node)
            );
        }
        return "";
    };

    const filteredData = useMemo<(Row<T> | SubRow<T>)[] | undefined>(
        () =>
            search === "" || isPaginated
                ? undefined
                : convertToColumns(unPaginatedData || [])
                      .filter(row =>
                          row.cells.some(
                              cell =>
                                  cell &&
                                  getNodeText(cell)
                                      .toLowerCase()
                                      .includes(search.toLowerCase())
                          )
                      )
                      .slice(first, first + max + 1),
        [search, first, max]
    );

    useFetch(
        async () => {
            setLoading(true);
            const newSearch = prevSearch.current === "" && search !== "";

            if (newSearch) {
                setFirst(0);
            }
            prevSearch.current = search;
            return typeof loader === "function"
                ? key === prevKey.current && unPaginatedData
                    ? unPaginatedData
                    : await loader(newSearch ? 0 : first, max + 1, search)
                : loader;
        },
        data => {
            prevKey.current = key;
            if (!isPaginated) {
                setUnPaginatedData(data);
                if (data.length > first) {
                    data = data.slice(first, first + max + 1);
                } else {
                    setFirst(0);
                }
            }

            const result = convertToColumns(data);
            setRows(result);
            setLoading(false);
        },
        [key, first, max, search, typeof loader !== "function" ? loader : undefined]
    );

    const convertAction = () =>
        actions &&
        cloneDeep(actions).map((action: Action<T>, index: number) => {
            delete action.onRowClick;
            action.onClick = async (_, rowIndex) => {
                const result = await actions[index].onRowClick!(
                    (filteredData || rows)![rowIndex].data
                );
                if (result) {
                    if (!isPaginated) {
                        setSearch("");
                    }
                    refresh();
                }
            };
            return action;
        });

    const onCollapse = (isOpen: boolean, rowIndex: number) => {
        (data![rowIndex] as Row<T>).isOpen = isOpen;
        setRows([...data!]);
    };

    const data = filteredData || rows;
    const noData = !data || data.length === 0;
    const searching = search !== "" || isSearching;
    const maxRows = detailColumns ? max * 2 : max;
    const rowLength = detailColumns ? (data?.length || 0) / 2 : data?.length || 0;

    return (
        <>
            {(!noData || searching) && (
                <PaginatingTableToolbar
                    id={id}
                    count={rowLength}
                    first={first}
                    max={max}
                    onNextClick={setFirst}
                    onPreviousClick={setFirst}
                    onPerPageSelect={(first, max) => {
                        setFirst(first);
                        setMax(max);
                        setDefaultPageSize(max);
                    }}
                    inputGroupName={
                        searchPlaceholderKey ? `${ariaLabelKey}input` : undefined
                    }
                    inputGroupOnEnter={setSearch}
                    inputGroupPlaceholder={t(searchPlaceholderKey || "")}
                    searchTypeComponent={searchTypeComponent}
                    toolbarItem={
                        <>
                            {toolbarItem}
                            <span className="mx-2" aria-hidden />
                            <div className="flex items-center">
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={refresh}
                                    data-testid="refresh"
                                    className="h-auto p-0"
                                >
                                    <ArrowsClockwise className="size-4 mr-1" /> {t("refresh")}
                                </Button>
                            </div>
                        </>
                    }
                    subToolbar={subToolbar}
                >
                    {!loading && !noData && (
                        <DataTable
                            {...props}
                            canSelectAll={canSelectAll}
                            canSelect={!!onSelect}
                            selected={selected}
                            onSelect={selected => {
                                setSelected(selected);
                                onSelect?.(selected);
                            }}
                            onCollapse={detailColumns ? onCollapse : undefined}
                            actions={convertAction()}
                            actionResolver={actionResolver}
                            rows={data.slice(0, maxRows)}
                            columns={columns}
                            isNotCompact={isNotCompact}
                            isRadio={isRadio}
                            ariaLabelKey={ariaLabelKey}
                        />
                    )}
                    {!loading && noData && searching && (
                        <ListEmptyState
                            hasIcon={true}
                            icon={icon}
                            isSearchVariant={true}
                            message={t("noSearchResults")}
                            instructions={t("noSearchResultsInstructions")}
                            secondaryActions={
                                !isSearching
                                    ? [
                                          {
                                              text: t("clearAllFilters"),
                                              onClick: () => setSearch(""),
                                              type: "link"
                                          }
                                      ]
                                    : []
                            }
                        />
                    )}
                </PaginatingTableToolbar>
            )}
            {loading && <KeycloakSpinner />}
            {!loading && noData && !searching && emptyState}
        </>
    );
}
