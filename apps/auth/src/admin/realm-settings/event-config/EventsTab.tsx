/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/event-config/EventsTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { RealmEventsConfigRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useAlerts, useFetch } from "../../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { isEqual } from "lodash-es";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { FormAccess } from "../../components/form/FormAccess";
import { useRealm } from "../../context/realm-context/RealmContext";
import { convertToFormValues } from "../../util";
import { AddEventTypesDialog } from "./AddEventTypesDialog";
import { EventConfigForm, EventsType } from "./EventConfigForm";
import { EventListenersForm } from "./EventListenersForm";
import { EventsTypeTable, EventType } from "./EventsTypeTable";

type EventsTabProps = {
    realm: RealmRepresentation;
};

type EventsConfigForm = RealmEventsConfigRepresentation & {
    adminEventsExpiration?: number;
};

export const EventsTab = ({ realm }: EventsTabProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<EventsConfigForm>();
    const { setValue, handleSubmit } = form;

    const [key, setKey] = useState(0);
    const refresh = () => setKey(new Date().getTime());
    const [tableKey, setTableKey] = useState(0);
    const reload = () => setTableKey(new Date().getTime());

    const [activeTab, setActiveTab] = useState("event");
    const [events, setEvents] = useState<RealmEventsConfigRepresentation>();
    const [type, setType] = useState<EventsType>();
    const [addEventType, setAddEventType] = useState(false);

    const { addAlert, addError } = useAlerts();
    const { realm: realmName, refresh: refreshRealm } = useRealm();

    const setupForm = (eventConfig?: EventsConfigForm) => {
        setEvents(eventConfig);
        convertToFormValues(eventConfig || {}, setValue);
    };

    const clear = async (type: EventsType) => {
        setType(type);
        toggleDeleteDialog();
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteEvents",
        messageKey: "deleteEventsConfirm",
        continueButtonLabel: "clear",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                switch (type) {
                    case "admin":
                        await adminClient.realms.clearAdminEvents({ realm: realmName });
                        break;
                    case "user":
                        await adminClient.realms.clearEvents({ realm: realmName });
                        break;
                }
                addAlert(t(`${type}-events-cleared`), AlertVariant.success);
            } catch (error) {
                addError(`${type}-events-cleared-error`, error);
            }
        }
    });

    useFetch(
        () => adminClient.realms.getConfigEvents({ realm: realmName }),
        eventConfig => {
            setupForm({
                ...eventConfig,
                adminEventsExpiration: realm.attributes?.adminEventsExpiration
            });
            reload();
        },
        [key]
    );

    const save = async (config: EventsConfigForm) => {
        const updatedEventListener = !isEqual(
            events?.eventsListeners,
            config.eventsListeners
        );

        const { adminEventsExpiration, ...eventConfig } = config;
        if (realm.attributes?.adminEventsExpiration !== adminEventsExpiration) {
            await adminClient.realms.update(
                { realm: realmName },
                {
                    ...realm,
                    attributes: { ...(realm.attributes || {}), adminEventsExpiration }
                }
            );
        }

        try {
            await adminClient.realms.updateConfigEvents(
                { realm: realmName },
                eventConfig
            );
            setupForm({ ...events, ...eventConfig, adminEventsExpiration });
            addAlert(
                updatedEventListener
                    ? t("saveEventListenersSuccess")
                    : t("eventConfigSuccessfully"),
                AlertVariant.success
            );
        } catch (error) {
            addError(
                updatedEventListener
                    ? t("saveEventListenersError")
                    : t("eventConfigError"),
                error
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
        refresh();
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
            <DeleteConfirm />
            {addEventType && (
                <AddEventTypesDialog
                    onConfirm={eventTypes => addEventTypes(eventTypes)}
                    configured={events?.enabledEventTypes || []}
                    onClose={() => setAddEventType(false)}
                />
            )}
            <div>
                <div className="flex border-b" role="tablist">
                    <button
                        role="tab"
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "event" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                        aria-selected={activeTab === "event"}
                        onClick={() => setActiveTab("event")}
                        data-testid="rs-event-listeners-tab"
                    >
                        {t("eventListeners")}
                    </button>
                    <button
                        role="tab"
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "user" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                        aria-selected={activeTab === "user"}
                        onClick={() => setActiveTab("user")}
                        data-testid="rs-events-tab"
                    >
                        {t("userEventsSettings")}
                    </button>
                    <button
                        role="tab"
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "admin" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                        aria-selected={activeTab === "admin"}
                        onClick={() => setActiveTab("admin")}
                        data-testid="rs-admin-events-tab"
                    >
                        {t("adminEventsSettings")}
                    </button>
                </div>
                {activeTab === "event" && (
                    <div className="p-6">
                        <FormAccess
                            role="manage-events"
                            isHorizontal
                            onSubmit={handleSubmit(save)}
                        >
                            <EventListenersForm
                                form={form}
                                reset={() => setupForm(events)}
                            />
                        </FormAccess>
                    </div>
                )}
                {activeTab === "user" && (
                    <>
                        <div className="p-6">
                            <FormAccess
                                role="manage-events"
                                isHorizontal
                                onSubmit={handleSubmit(save)}
                            >
                                <EventConfigForm
                                    type="user"
                                    form={form}
                                    reset={() => setupForm(events)}
                                    clear={() => clear("user")}
                                />
                            </FormAccess>
                        </div>
                        <div className="p-6">
                            <EventsTypeTable
                                key={tableKey}
                                addTypes={() => setAddEventType(true)}
                                eventTypes={events?.enabledEventTypes || []}
                                onDelete={value => removeEvents([value])}
                                onDeleteAll={removeEvents}
                            />
                        </div>
                    </>
                )}
                {activeTab === "admin" && (
                    <div className="p-6">
                        <FormAccess
                            role="manage-events"
                            isHorizontal
                            onSubmit={handleSubmit(save)}
                        >
                            <EventConfigForm
                                type="admin"
                                form={form}
                                reset={() => setupForm(events)}
                                clear={() => clear("admin")}
                            />
                        </FormAccess>
                    </div>
                )}
            </div>
        </>
    );
};
