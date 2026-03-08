import type { RealmEventsConfigRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { isEqual } from "lodash-es";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    FormPanel,
    getErrorDescription,
    getErrorMessage
} from "../../../../shared/keycloak-ui-shared";
import { updateRealm, saveEventsConfig as saveEventsConfigApi } from "../../../api/realm-settings";
import { useClearEvents } from "../hooks/use-clear-events";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { convertToFormValues } from "../../../shared/lib/util";
import { FixedButtonsGroup } from "../../../shared/ui/form/fixed-button-group";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { useEventsConfig } from "../hooks/use-events-config";
import { AddEventTypesDialog } from "./add-event-types-dialog";
import { EventConfigForm, type EventsType } from "./event-config-form";
import { EventListenersForm } from "./event-listeners-form";
import { EventsTypeTable, type EventType } from "./events-type-table";

type EventsTabProps = {
    realm: RealmRepresentation;
};

type EventsConfigForm = RealmEventsConfigRepresentation & {
    adminEventsExpiration?: number;
};

export const EventsTab = ({ realm }: EventsTabProps) => {

    const { t } = useTranslation();
    const form = useForm<EventsConfigForm>();
    const { setValue, handleSubmit } = form;

    const [activeTab, setActiveTab] = useState("event");
    const [events, setEvents] = useState<RealmEventsConfigRepresentation>();
    const [type, setType] = useState<EventsType>();
    const [addEventType, setAddEventType] = useState(false);
    const { realm: realmName, refresh: refreshRealm } = useRealm();

    const { data: eventsConfigData, refetch: refetchEventsConfig } = useEventsConfig();
    const { mutateAsync: clearEventsMut } = useClearEvents();

    const setupForm = (eventConfig?: EventsConfigForm) => {
        setEvents(eventConfig);
        convertToFormValues(eventConfig || {}, setValue);
    };

    useEffect(() => {
        if (eventsConfigData) {
            setupForm({
                ...eventsConfigData,
                adminEventsExpiration: realm.attributes?.adminEventsExpiration
            });
        }
    }, [eventsConfigData]);

    const clear = (eventType: EventsType) => {
        setType(eventType);
    };

    const onDeleteConfirm = async () => {
        if (!type) return;
        try {
            await clearEventsMut(type);
            toast.success(t(`${type}-events-cleared`));
            setType(undefined);
        } catch (error) {
            toast.error(
                t(`${type}-events-cleared-error`, { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const save = async (config: EventsConfigForm) => {
        const updatedEventListener = !isEqual(
            events?.eventsListeners,
            config.eventsListeners
        );

        const { adminEventsExpiration, ...eventConfig } = config;
        if (realm.attributes?.adminEventsExpiration !== adminEventsExpiration) {
            await updateRealm(realmName, {
                ...realm,
                attributes: { ...(realm.attributes || {}), adminEventsExpiration }
            });
        }

        try {
            await saveEventsConfigApi(realmName, eventConfig);
            setupForm({ ...events, ...eventConfig, adminEventsExpiration });
            toast.success(
                updatedEventListener
                    ? t("saveEventListenersSuccess")
                    : t("eventConfigSuccessfully")
            );
        } catch (error) {
            toast.error(
                t(updatedEventListener ? "saveEventListenersError" : "eventConfigError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }

        refreshRealm();
    };

    const addEventTypes = async (eventTypes: EventType[]) => {
        const eventsTypes = eventTypes.map(type => type.id);
        const enabledEvents = events!.enabledEventTypes?.concat(eventsTypes);
        await addEvents(enabledEvents);
    };

    const addEvents = async (events: string[] = []) => {
        const eventConfig = { ...form.getValues(), enabledEventTypes: events };
        await save(eventConfig);
        setAddEventType(false);
        refetchEventsConfig();
    };

    const removeEvents = async (eventTypes: EventType[] = []) => {
        const values = eventTypes.map(type => type.id);
        const enabledEventTypes = events?.enabledEventTypes?.filter(
            e => !values.includes(e)
        );
        await addEvents(enabledEventTypes);
        setEvents({ ...events, enabledEventTypes });
    };

    return (
        <>
            <AlertDialog open={!!type} onOpenChange={open => !open && setType(undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteEvents")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteEventsConfirm")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("clear")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {addEventType && (
                <AddEventTypesDialog
                    onConfirm={eventTypes => addEventTypes(eventTypes)}
                    configured={events?.enabledEventTypes || []}
                    onClose={() => setAddEventType(false)}
                />
            )}
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v)}>
                <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                    <TabsList
                        variant="line"
                        className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none"
                    >
                        <TabsTrigger value="event" data-testid="rs-event-listeners-tab">
                            {t("eventListeners")}
                        </TabsTrigger>
                        <TabsTrigger value="user" data-testid="rs-events-tab">
                            {t("userEventsSettings")}
                        </TabsTrigger>
                        <TabsTrigger value="admin" data-testid="rs-admin-events-tab">
                            {t("adminEventsSettings")}
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="event" className="mt-0 pt-0 outline-none">
                    <FormAccess
                        role="manage-events"
                        isHorizontal
                        onSubmit={handleSubmit(save)}
                    >
                        <FormPanel title={t("eventListeners")} className="mt-6 space-y-6">
                            <div className="space-y-4">
                                <EventListenersForm
                                    form={form}
                                    reset={() => setupForm(events)}
                                />
                            </div>
                        </FormPanel>
                        <FixedButtonsGroup
                            name="eventListeners"
                            reset={() => setupForm(events)}
                            isSubmit
                        />
                    </FormAccess>
                </TabsContent>
                <TabsContent value="user" className="mt-0 pt-0 outline-none space-y-6">
                    <FormAccess
                        role="manage-events"
                        isHorizontal
                        onSubmit={handleSubmit(save)}
                    >
                        <FormPanel
                            title={t("userEventsSettings")}
                            className="mt-6 space-y-6"
                        >
                            <div className="space-y-4">
                                <EventConfigForm
                                    type="user"
                                    form={form}
                                    reset={() => setupForm(events)}
                                    clear={() => clear("user")}
                                />
                            </div>
                        </FormPanel>
                        <FixedButtonsGroup
                            name="userEvents"
                            reset={() => setupForm(events)}
                            isSubmit
                        />
                    </FormAccess>
                    <EventsTypeTable
                        addTypes={() => setAddEventType(true)}
                        eventTypes={events?.enabledEventTypes || []}
                        onDelete={value => removeEvents([value])}
                    />
                </TabsContent>
                <TabsContent value="admin" className="mt-0 pt-0 outline-none">
                    <FormAccess
                        role="manage-events"
                        isHorizontal
                        onSubmit={handleSubmit(save)}
                    >
                        <FormPanel
                            title={t("adminEventsSettings")}
                            className="mt-6 space-y-6"
                        >
                            <div className="space-y-4">
                                <EventConfigForm
                                    type="admin"
                                    form={form}
                                    reset={() => setupForm(events)}
                                    clear={() => clear("admin")}
                                />
                            </div>
                        </FormPanel>
                        <FixedButtonsGroup
                            name="adminEvents"
                            reset={() => setupForm(events)}
                            isSubmit
                        />
                    </FormAccess>
                </TabsContent>
            </Tabs>
        </>
    );
};
