/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/keys/key-providers/KeyProviderModal.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Modal, ModalVariant } from "../../../../shared/@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { KeyProviderForm } from "./KeyProviderForm";
import type { ProviderType } from "../../routes/KeyProvider";

type KeyProviderModalProps = {
    providerType: ProviderType;
    onClose: () => void;
};

export const KeyProviderModal = ({ providerType, onClose }: KeyProviderModalProps) => {
    const { t } = useTranslation();
    return (
        <Modal
            className=""
            variant={ModalVariant.medium}
            title={t("addProvider")}
            isOpen
            onClose={onClose}
        >
            <KeyProviderForm providerType={providerType} onClose={onClose} />
        </Modal>
    );
};
