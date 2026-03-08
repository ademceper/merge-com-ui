import { useMutation } from "@tanstack/react-query";
import { uploadCertificate } from "../../../api/identity-providers";

/**
 * Upload a certificate for an identity provider.
 */
export function useUploadCertificate() {
    return useMutation({
        mutationFn: (formData: FormData) => uploadCertificate(formData)
    });
}
