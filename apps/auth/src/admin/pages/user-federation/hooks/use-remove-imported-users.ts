import { useMutation } from "@tanstack/react-query";
import { removeImportedUsers } from "../../../api/user-federation";

export function useRemoveImportedUsers() {
    return useMutation({
        mutationFn: (id: string) => removeImportedUsers(id)
    });
}
