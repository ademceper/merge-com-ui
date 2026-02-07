import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { Trash } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export type EventType = {
    id: string;
};

type EventTypeRow = EventType & {
    name: string;
    description: string;
};

type EventsTypeTableProps = {
    ariaLabelKey?: string;
    eventTypes: string[];
    addTypes?: () => void;
    onSelect?: (value: EventType[]) => void;
    onDelete?: (value: EventType) => void;
    onDeleteAll?: (value: EventType[]) => void;
};

export function EventsTypeTable({
    eventTypes,
    addTypes,
    onDelete
}: EventsTypeTableProps) {
    const { t } = useTranslation();

    const data: EventTypeRow[] = eventTypes.map(type => ({
        id: type,
        name: t(`eventTypes.${type}.name`),
        description: t(`eventTypes.${type}.description`)
    }));

    const columns: ColumnDef<EventTypeRow>[] = [
        {
            accessorKey: "name",
            header: t("eventType"),
            cell: ({ row }) => row.original.name
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => row.original.description ?? "-"
        },
        ...(onDelete
            ? [
                  {
                      id: "actions",
                      header: "",
                      size: 50,
                      enableHiding: false,
                      cell: ({ row }) => (
                          <DataTableRowActions row={row}>
                              <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => onDelete({ id: row.original.id })}
                              >
                                  <Trash className="size-4 shrink-0" />
                                  {t("remove")}
                              </button>
                          </DataTableRowActions>
                      )
                  } as ColumnDef<EventTypeRow>
              ]
            : [])
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            searchColumnId="name"
            searchPlaceholder={t("searchEventType")}
            emptyMessage={t("emptyEvents")}
            toolbar={
                addTypes ? (
                    <Button
                        type="button"
                        id="addTypes"
                        onClick={addTypes}
                        data-testid="addTypes"
                        variant="default"
                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                        aria-label={t("addSavedTypes")}
                    >
                        {t("addSavedTypes")}
                    </Button>
                ) : undefined
            }
        />
    );
}
