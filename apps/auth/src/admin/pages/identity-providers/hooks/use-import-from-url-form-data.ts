import { useMutation } from "@tanstack/react-query";
import { importFromUrlFormData } from "@/admin/api/identity-providers";

/**
 * Import identity provider config from a file upload (FormData).
 */
export function useImportFromUrlFormData() {
    return useMutation({
        mutationFn: (formData: FormData) => importFromUrlFormData(formData)
    });
}
