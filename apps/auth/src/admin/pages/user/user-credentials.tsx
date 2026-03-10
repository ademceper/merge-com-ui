import type CredentialRepresentation from "@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Separator } from "@merge-rd/ui/components/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";
import {
    Fragment,
    type DragEvent as ReactDragEvent,
    useMemo,
    useRef,
    useState
} from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem
} from "@/shared/keycloak-ui-shared";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { toUpperCase } from "@/admin/shared/lib/util";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { useDeleteCredential } from "./hooks/use-delete-credential";
import { useMoveCredentialDown, useMoveCredentialUp } from "./hooks/use-move-credential";
import { useUserCredentials as useUserCredentialsQuery } from "./hooks/use-user-credentials";
import { FederatedUserLink } from "./federated-user-link";
import { CredentialRow } from "./user-credentials/credential-row";
import { InlineLabelEdit } from "./user-credentials/inline-label-edit";
import { ResetCredentialDialog } from "./user-credentials/reset-credential-dialog";
import { ResetPasswordDialog } from "./user-credentials/reset-password-dialog";

type UserCredentialsProps = {
    user: UserRepresentation;
    setUser: (user: UserRepresentation) => void;
};

type ExpandableCredentialRepresentation = {
    key: string;
    value: CredentialRepresentation[];
    isExpanded: boolean;
};

type UserLabelEdit = {
    status: boolean;
    rowKey: string;
};

type UserCredentialsRowProps = {
    credential: CredentialRepresentation;
    userId: string;
    toggleDelete: (credential: CredentialRepresentation) => void;
    resetPassword: () => void;
    isUserLabelEdit?: UserLabelEdit;
    setIsUserLabelEdit: (isUserLabelEdit: UserLabelEdit) => void;
    refresh: () => void;
};

const UserCredentialsRow = ({
    credential,
    userId,
    toggleDelete,
    resetPassword,
    isUserLabelEdit,
    setIsUserLabelEdit,
    refresh
}: UserCredentialsRowProps) => (
    <CredentialRow
        key={credential.id}
        credential={credential}
        toggleDelete={() => toggleDelete(credential)}
        resetPassword={resetPassword}
    >
        <InlineLabelEdit
            credential={credential}
            userId={userId}
            isEditable={
                (isUserLabelEdit?.status && isUserLabelEdit.rowKey === credential.id) ||
                false
            }
            toggle={() => {
                setIsUserLabelEdit({
                    status: !isUserLabelEdit?.status,
                    rowKey: credential.id!
                });
                if (isUserLabelEdit?.status) {
                    refresh();
                }
            }}
        />
    </CredentialRow>
);

export const UserCredentials = ({ user, setUser }: UserCredentialsProps) => {

    const { t } = useTranslation();
    const formatDate = useFormatDate();
    const [isOpen, setIsOpen] = useState(false);
    const [openCredentialReset, setOpenCredentialReset] = useState(false);
    const [selectedCredential, setSelectedCredential] =
        useState<CredentialRepresentation>({});
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [isUserLabelEdit, setIsUserLabelEdit] = useState<UserLabelEdit>();
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    const bodyRef = useRef<HTMLTableSectionElement>(null);
    const [state, setState] = useState({
        draggedItemId: "",
        draggingToItemIndex: -1,
        dragging: false,
        tempItemOrder: [""]
    });

    const { data: allCredentials = [], refetch: refetchCredentials } =
        useUserCredentialsQuery(user.id!, !!user.enabled);
    const { mutateAsync: deleteCredentialMut } = useDeleteCredential(user.id!);
    const { mutateAsync: moveDownMut } = useMoveCredentialDown(user.id!);
    const { mutateAsync: moveUpMut } = useMoveCredentialUp(user.id!);
    const refresh = () => refetchCredentials();

    const userCredentials = useMemo(
        () =>
            allCredentials.filter(
                (c: CredentialRepresentation) => c.federationLink === undefined
            ),
        [allCredentials]
    );

    const groupedUserCredentials = useMemo<ExpandableCredentialRepresentation[]>(() => {
        const groupedCredentials = userCredentials.reduce(
            (r, a) => {
                r[a.type!] = r[a.type!] || [];
                r[a.type!].push(a);
                return r;
            },
            Object.create(null) as Record<string, CredentialRepresentation[]>
        );

        return Object.keys(groupedCredentials).map(key => ({
            key,
            value: groupedCredentials[key],
            isExpanded: expandedKeys.has(key)
        }));
    }, [userCredentials, expandedKeys]);

    const toggleModal = () => setIsOpen(!isOpen);

    const toggleCredentialsResetModal = () => {
        setOpenCredentialReset(!openCredentialReset);
    };

    const resetPassword = () => {
        setIsResetPassword(true);
        toggleModal();
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteCredentialsConfirmTitle"),
        messageKey: t("deleteCredentialsConfirm"),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteCredentialMut(selectedCredential.id!);
                toast.success(t("deleteCredentialsSuccess"));
                refresh();
            } catch (error) {
                toast.error(
                    t("deleteCredentialsError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    const itemOrder = useMemo(
        () =>
            groupedUserCredentials.flatMap(groupedCredential => [
                groupedCredential.value.map(({ id }) => id).toString(),
                ...(groupedCredential.isExpanded
                    ? groupedCredential.value.map(c => c.id!)
                    : [])
            ]),
        [groupedUserCredentials]
    );

    const onDragStart = (evt: ReactDragEvent) => {
        evt.dataTransfer.effectAllowed = "move";
        evt.dataTransfer.setData("text/plain", evt.currentTarget.id);
        const draggedItemId = evt.currentTarget.id;
        evt.currentTarget.classList.add("opacity-50");
        evt.currentTarget.setAttribute("aria-pressed", "true");
        setState({ ...state, draggedItemId, dragging: true });
    };

    const moveItem = (items: string[], targetItem: string, toIndex: number) => {
        const fromIndex = items.indexOf(targetItem);
        if (fromIndex === toIndex) {
            return items;
        }
        const result = [...items];
        result.splice(toIndex, 0, result.splice(fromIndex, 1)[0]);
        return result;
    };

    const move = (itemOrder: string[]) => {
        if (!bodyRef.current) return;
        const ulNode = bodyRef.current;
        const nodes = Array.from(ulNode.children);
        if (nodes.every(({ id }, i) => id === itemOrder[i])) {
            return;
        }
        ulNode.replaceChildren();
        itemOrder.forEach(itemId => {
            ulNode.appendChild(nodes.find(({ id }) => id === itemId)!);
        });
    };

    const onDragCancel = () => {
        if (!bodyRef.current) return;
        Array.from(bodyRef.current.children).forEach(el => {
            el.classList.remove("opacity-50");
            el.setAttribute("aria-pressed", "false");
        });
        setState({
            ...state,
            draggedItemId: "",
            draggingToItemIndex: -1,
            dragging: false
        });
    };

    const onDragLeave = (evt: ReactDragEvent) => {
        if (!isValidDrop(evt)) {
            move(itemOrder);
            setState({ ...state, draggingToItemIndex: -1 });
        }
    };

    const isValidDrop = (evt: ReactDragEvent) => {
        if (!bodyRef.current) return false;
        const ulRect = bodyRef.current.getBoundingClientRect();
        return (
            evt.clientX > ulRect.x &&
            evt.clientX < ulRect.x + ulRect.width &&
            evt.clientY > ulRect.y &&
            evt.clientY < ulRect.y + ulRect.height
        );
    };

    const onDrop = async (evt: ReactDragEvent) => {
        if (isValidDrop(evt)) {
            await onDragFinish(state.draggedItemId, state.tempItemOrder);
        } else {
            onDragCancel();
        }
    };

    const onDragOver = (evt: ReactDragEvent) => {
        evt.preventDefault();
        const td = evt.target as HTMLTableCellElement;
        const curListItem = td.closest("tr");
        if (
            !curListItem ||
            (bodyRef.current && !bodyRef.current.contains(curListItem)) ||
            curListItem.id === state.draggedItemId
        ) {
            return;
        } else {
            const dragId = curListItem.id;
            const draggingToItemIndex = Array.from(
                bodyRef.current?.children || []
            ).findIndex(item => item.id === dragId);
            if (draggingToItemIndex === state.draggingToItemIndex) {
                return;
            }
            const tempItemOrder = moveItem(
                itemOrder,
                state.draggedItemId,
                draggingToItemIndex
            );
            move(tempItemOrder);
            setState({
                ...state,
                draggingToItemIndex,
                tempItemOrder
            });
        }
    };

    const onAddRequiredActions = (requiredActions: string[]) => {
        setUser({
            ...user,
            requiredActions: [...(user.requiredActions ?? []), ...requiredActions]
        });
    };

    const onDragEnd = ({ target }: ReactDragEvent) => {
        if (!(target instanceof HTMLTableRowElement)) {
            return;
        }
        target.classList.remove("opacity-50");
        target.setAttribute("aria-pressed", "false");
        setState({
            ...state,
            draggedItemId: "",
            draggingToItemIndex: -1,
            dragging: false
        });
    };

    const onDragFinish = async (dragged: string, newOrder: string[]) => {
        const oldIndex = itemOrder.indexOf(dragged);
        const newIndex = newOrder.indexOf(dragged);
        const times = newIndex - oldIndex;

        const ids = dragged.split(",");

        try {
            for (const id of ids)
                for (let index = 0; index < Math.abs(times); index++) {
                    if (times > 0) {
                        await moveDownMut({
                            credentialId: id,
                            newPreviousCredentialId: itemOrder[newIndex]
                        });
                    } else {
                        await moveUpMut(id);
                    }
                }

            refresh();
            toast.success(t("updatedCredentialMoveSuccess"));
        } catch (error) {
            toast.error(
                t("updatedCredentialMoveError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const onToggleDelete = (credential: CredentialRepresentation) => {
        setSelectedCredential(credential);
        toggleDeleteDialog();
    };

    const useFederatedCredentials = user.federationLink;
    const credentialTypes = allCredentials.filter(
        (c: CredentialRepresentation) => c.federationLink !== undefined
    );

    const hasCredentialTypes = credentialTypes.length > 0;
    const noCredentials = groupedUserCredentials.length === 0;
    const noFederatedCredentials = !user.credentials || user.credentials.length === 0;
    const emptyState = noCredentials && noFederatedCredentials && !hasCredentialTypes;

    return (
        <>
            {isOpen && (
                <ResetPasswordDialog
                    user={user}
                    isResetPassword={isResetPassword}
                    onAddRequiredActions={onAddRequiredActions}
                    refresh={refresh}
                    onClose={() => setIsOpen(false)}
                />
            )}
            {openCredentialReset && (
                <ResetCredentialDialog
                    userId={user.id!}
                    onClose={() => setOpenCredentialReset(false)}
                />
            )}
            <DeleteConfirm />
            {user.email && !emptyState && (
                <Button
                    className="kc-resetCredentialBtn-header"
                    variant="default"
                    data-testid="credentialResetBtn"
                    onClick={() => setOpenCredentialReset(true)}
                >
                    {t("credentialResetBtn")}
                </Button>
            )}
            {userCredentials.length !== 0 &&
                !userCredentials.find(credential => credential.type === "password") &&
                !credentialTypes.find(credential => credential.type === "password") && (
                    <>
                        <Button
                            className="kc-setPasswordBtn-tbl"
                            data-testid="setPasswordBtn-table"
                            variant="default"
                            form="userCredentials-form"
                            onClick={() => {
                                setIsOpen(true);
                            }}
                        >
                            {t("setPassword")}
                        </Button>
                        <Separator />
                    </>
                )}
            {groupedUserCredentials.length !== 0 && (
                <div className="bg-muted/30 p-4">
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow className="kc-table-header">
                                <TableHead>
                                    <HelpItem
                                        helpText={t("userCredentialsHelpText")}
                                        fieldLabelId="userCredentialsHelpTextLabel"
                                    />
                                </TableHead>
                                <TableHead aria-hidden="true" />
                                <TableHead>{t("type")}</TableHead>
                                <TableHead>{t("userLabel")}</TableHead>
                                <TableHead>{t("createdAt")}</TableHead>
                                <TableHead>{t("data")}</TableHead>
                                <TableHead aria-hidden="true" />
                                <TableHead aria-hidden="true" />
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            ref={bodyRef}
                            onDragOver={onDragOver}
                            onDrop={onDragOver}
                            onDragLeave={onDragLeave}
                        >
                            {groupedUserCredentials.map((groupedCredential, rowIndex) => (
                                <Fragment key={groupedCredential.key}>
                                    <TableRow
                                        id={groupedCredential.value
                                            .map(({ id }) => id)
                                            .toString()}
                                        draggable={groupedUserCredentials.length > 1}
                                        onDrop={onDrop}
                                        onDragEnd={onDragEnd}
                                        onDragStart={onDragStart}
                                    >
                                        <TableCell
                                            className={
                                                groupedUserCredentials.length === 1
                                                    ? "one-row"
                                                    : ""
                                            }
                                        />
                                        {groupedCredential.value.length > 1 ? (
                                            <TableCell className="kc-expandRow-btn">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-expanded={
                                                        groupedCredential.isExpanded
                                                    }
                                                    onClick={() => {
                                                        setExpandedKeys(prev => {
                                                            const next = new Set(prev);
                                                            if (
                                                                next.has(
                                                                    groupedCredential.key
                                                                )
                                                            ) {
                                                                next.delete(
                                                                    groupedCredential.key
                                                                );
                                                            } else {
                                                                next.add(
                                                                    groupedCredential.key
                                                                );
                                                            }
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    {groupedCredential.isExpanded
                                                        ? "▼"
                                                        : "▶"}
                                                </Button>
                                            </TableCell>
                                        ) : (
                                            <TableCell />
                                        )}
                                        <TableCell
                                            data-label={`columns-${groupedCredential.key}`}
                                            className="kc-notExpandableRow-credentialType"
                                            data-testid="credentialType"
                                        >
                                            {toUpperCase(groupedCredential.key)}
                                        </TableCell>
                                        {groupedCredential.value.length <= 1 &&
                                            groupedCredential.value.map(credential => (
                                                <UserCredentialsRow
                                                    key={credential.id}
                                                    credential={credential}
                                                    userId={user.id!}
                                                    toggleDelete={onToggleDelete}
                                                    resetPassword={resetPassword}
                                                    isUserLabelEdit={isUserLabelEdit}
                                                    setIsUserLabelEdit={
                                                        setIsUserLabelEdit
                                                    }
                                                    refresh={refresh}
                                                />
                                            ))}
                                    </TableRow>
                                    {groupedCredential.isExpanded &&
                                        groupedCredential.value.map(credential => (
                                            <TableRow
                                                key={credential.id}
                                                id={credential.id}
                                                draggable
                                                onDrop={onDrop}
                                                onDragEnd={onDragEnd}
                                                onDragStart={onDragStart}
                                            >
                                                <TableCell />
                                                <TableCell className="kc-draggable-dropdown-type-icon" />
                                                <TableCell
                                                    data-label={`child-columns-${credential.id}`}
                                                    className="kc-expandableRow-credentialType"
                                                >
                                                    {toUpperCase(credential.type!)}
                                                </TableCell>
                                                <UserCredentialsRow
                                                    credential={credential}
                                                    userId={user.id!}
                                                    toggleDelete={onToggleDelete}
                                                    resetPassword={resetPassword}
                                                    isUserLabelEdit={isUserLabelEdit}
                                                    setIsUserLabelEdit={
                                                        setIsUserLabelEdit
                                                    }
                                                    refresh={refresh}
                                                />
                                            </TableRow>
                                        ))}
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            {useFederatedCredentials && hasCredentialTypes && (
                <div className="bg-muted/30 p-4">
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("type")}</TableHead>
                                <TableHead>{t("providedBy")}</TableHead>
                                <TableHead>{t("createdAt")}</TableHead>
                                <TableHead aria-hidden="true" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {credentialTypes.map(credential => (
                                <TableRow key={credential.type}>
                                    <TableCell>
                                        <b>{credential.type}</b>
                                    </TableCell>
                                    <TableCell>
                                        <FederatedUserLink user={user} />
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(new Date(credential.createdDate!))}
                                    </TableCell>
                                    {credential.type === "password" && (
                                        <TableCell className="w-fit">
                                            <Button
                                                variant="outline"
                                                onClick={toggleModal}
                                            >
                                                {t("setPassword")}
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            {emptyState && (
                <Empty className="py-12">
                    <EmptyHeader>
                        <EmptyTitle>{t("noCredentials")}</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <EmptyDescription>{t("noCredentialsText")}</EmptyDescription>
                        <Button variant="default" onClick={toggleModal}>
                            {t("setPassword")}
                        </Button>
                        {user.email && (
                            <Button variant="link" onClick={toggleCredentialsResetModal}>
                                {t("credentialResetBtn")}
                            </Button>
                        )}
                    </EmptyContent>
                </Empty>
            )}
        </>
    );
};
