/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dropdown-panel/DropdownPanel.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useEffect, useRef } from "react";
import { CaretDown } from "@phosphor-icons/react";

type DropdownPanelProps = {
    buttonText: string;
    children: React.ReactNode;
    setSearchDropdownOpen: (open: boolean) => void;
    searchDropdownOpen: boolean;
    marginRight?: string;
    width: string;
};

const DropdownPanel: React.FC<DropdownPanelProps> = ({
    buttonText,
    children,
    setSearchDropdownOpen,
    searchDropdownOpen,
    marginRight,
    width
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setSearchDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setSearchDropdownOpen]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                setSearchDropdownOpen(false);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [setSearchDropdownOpen]);

    return (
        <span ref={dropdownRef}>
            <button
                className="kc-dropdown-panel"
                onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}
                aria-label={buttonText}
                style={{ width, marginRight }}
                data-testid="dropdown-panel-btn"
            >
                {buttonText}
                <CaretDown className="kc-dropdown-panel-icon size-4" />
            </button>
            {searchDropdownOpen && (
                <div className="kc-dropdown-panel-content">{children}</div>
            )}
        </span>
    );
};

export default DropdownPanel;
