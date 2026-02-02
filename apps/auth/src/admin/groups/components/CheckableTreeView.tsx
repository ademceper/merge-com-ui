/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/groups/components/CheckableTreeView.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Checkbox } from "@merge/ui/components/checkbox";
import { CaretRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export type TreeViewDataItem = {
    id?: string;
    name: ReactNode;
    children?: TreeViewDataItem[];
    checkProps?: { checked: boolean | null };
};

type CheckableTreeViewProps = {
    data: TreeViewDataItem[];
    onSelect: (items: TreeViewDataItem[]) => void;
};

export const CheckableTreeView = ({ data, onSelect }: CheckableTreeViewProps) => {
    const [state, setState] = useState<{
        options: TreeViewDataItem[];
        checkedItems: TreeViewDataItem[];
    }>({ options: [], checkedItems: [] });

    useEffect(() => {
        onSelect(state.checkedItems.filter(i => i.checkProps?.checked === true));
    }, [state]);

    useEffect(() => {
        setState({ options: data, checkedItems: [] });
    }, [data]);

    const flattenTree = (tree: TreeViewDataItem[]) => {
        let result: TreeViewDataItem[] = [];
        tree.forEach(item => {
            result.push(item);
            if (item.children) {
                result = result.concat(flattenTree(item.children));
            }
        });
        return result;
    };

    const onCheck = (checked: boolean, treeViewItem: TreeViewDataItem) => {
        const flatCheckedItems = flattenTree([treeViewItem]);

        setState(prevState => {
            return {
                options: prevState.options,
                checkedItems: checked
                    ? prevState.checkedItems.concat(
                          flatCheckedItems.filter(
                              item => !prevState.checkedItems.some(i => i.id === item.id)
                          )
                      )
                    : prevState.checkedItems.filter(
                          item => !flatCheckedItems.some(i => i.id === item.id)
                      )
            };
        });
    };

    const isChecked = (item: TreeViewDataItem) =>
        state.checkedItems.some(i => i.id === item.id);

    const areSomeDescendantsChecked = (dataItem: TreeViewDataItem): boolean =>
        dataItem.children
            ? dataItem.children.some(child => areSomeDescendantsChecked(child))
            : isChecked(dataItem);

    const mapTree = (item: TreeViewDataItem): TreeViewDataItem => {
        const hasCheck = isChecked(item);
        item.checkProps!.checked = false;

        if (hasCheck) {
            item.checkProps!.checked = true;
        } else {
            const hasPartialCheck = areSomeDescendantsChecked(item);
            if (hasPartialCheck) {
                item.checkProps!.checked = null;
            }
        }

        if (item.children) {
            return {
                ...item,
                children: item.children.map(child => mapTree(child))
            };
        }
        return item;
    };

    const renderItem = (item: TreeViewDataItem, depth: number) => {
        const hasChildren = item.children && item.children.length > 0;
        return (
            <div key={item.id ?? depth}>
                <div className="flex items-center gap-2 py-1" style={{ paddingLeft: `${depth * 16}px` }}>
                    <Checkbox
                        checked={item.checkProps?.checked === true}
                        onCheckedChange={(checked) => onCheck(checked === true, item)}
                    />
                    {hasChildren && <CaretRight className="size-4" />}
                    <span>{item.name}</span>
                </div>
                {hasChildren && item.children!.map((child, i) => renderItem(child, depth + 1))}
            </div>
        );
    };

    const mapped = state.options.map(item => mapTree(item));
    return (
        <div className="rounded-md border p-2">
            {mapped.map((item, i) => renderItem(item, 0))}
        </div>
    );
};
