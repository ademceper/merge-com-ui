/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/event-config/AddEventTypesDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal, ModalVariant } from "../../../shared/@patternfly/react-core";

import { EventsTypeTable, EventType } from "./EventsTypeTable";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";

type AddEventTypesDialogProps = {
    onConfirm: (selected: EventType[]) => void;
    onClose: () => void;
    configured: string[];
};

export const AddEventTypesDialog = ({
    onConfirm,
    onClose,
    configured
}: AddEventTypesDialogProps) => {
    const { t } = useTranslation();
    const { enums } = useServerInfo();

    const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
    return (
        <Modal
            variant={ModalVariant.medium}
            title={t("addTypes")}
            isOpen={true}
            onClose={onClose}
            actions={[
                <Button
                    data-testid="addEventTypeConfirm"
                    key="confirm"
                    variant="primary"
                    onClick={() => onConfirm(selectedTypes)}
                >
                    {t("add")}
                </Button>,
                <Button
                    data-testid="moveCancel"
                    key="cancel"
                    variant="link"
                    onClick={onClose}
                >
                    {t("cancel")}
                </Button>
            ]}
        >
            <EventsTypeTable
                ariaLabelKey="addTypes"
                onSelect={selected => setSelectedTypes(selected)}
                eventTypes={enums!["eventType"].filter(
                    type => !configured.includes(type)
                )}
            />
        </Modal>
    );
};
