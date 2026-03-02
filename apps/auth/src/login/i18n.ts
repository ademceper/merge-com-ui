import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        en: {
            // Login page
            loginAccountTitle: "Sign in to your account",
            loginAccountDescription: "Enter your credentials to access your account",
            orSeparator: "Or",
            username: "Username or email",
            usernameOrEmail: "Username or email",
            password: "Password",
            rememberMe: "Remember me",
            doLogIn: "Sign in",
            doContinue: "Continue",
            noAccount: "Don't have an account?",
            doRegister: "Create account",
            doForgotPassword: "Forgot password?",
            orContinueWith: "Or continue with Google, Apple, or Facebook",
            "identity-provider-login-label": "Or",
            continueWithProvider: "Continue with {{provider}}",
            loginPlaceholder: "Enter phone number or email address",
            
            // Register page
            registerTitle: "Create an account",
            registerAccountDescription: "Create a new account to get started",
            backToLogin: "Already have an account?",
            signUpWithSocialHint: "You can also sign in with Google, Apple, or Facebook on the login page.",
            email: "Email",
            firstName: "First name",
            lastName: "Last name",
            
            // Forgot Password page
            emailForgotTitle: "Forgot your password?",
            emailForgotDescription: "Enter your email and we'll send you instructions to reset your password",
            backToLoginPage: "Back to login",
            doSubmit: "Submit",
            doCancel: "Cancel",
            
            // Update Password page
            updatePasswordTitle: "Update your password",
            updatePasswordDescription: "Please set a new password for your account",
            updatePasswordRequiredDescription: "You need to change your password",
            passwordNew: "New password",
            passwordConfirm: "Confirm password",
            
            // Update Profile page
            loginProfileTitle: "Update your profile",
            loginProfileDescription: "Please update your profile information",
            loginProfileRequiredDescription: "You need to update your profile information",

            // Delete account confirm
            deleteAccountConfirm: "Delete account confirmation",
            irreversibleAction: "This action is irreversible.",
            deletingImplies: "Deleting your account will:",
            loggingOutImmediately: "Log you out immediately",
            errasingData: "Erase all your data",
            finalDeletionConfirmation: "Are you sure you want to delete your account?",
            doConfirmDelete: "Yes, delete my account",

            // Configure TOTP page
            loginTotpTitle: "Set up two-factor authentication",
            loginTotpConfigureDescription: "Configure an authenticator app to secure your account",
            loginTotpStepInstall: "Supported apps:",
            loginTotpDeviceName: "Device name",
            logoutOtherSessions: "Sign out from other devices",
            loginOtpTitle: "Two-factor authentication",
            loginOtpOneTime: "Enter your verification code",

            // Delete credential page
            deleteCredentialTitle: "Remove {0}",
            deleteCredentialMessage: "Are you sure you want to remove this credential? This action cannot be undone.",

            // Error page
            errorTitle: "An error occurred",
            backToApplication: "Back to application",

            // Login page expired
            pageExpiredTitle: "Page expired",
            pageExpiredMsg1: "The page you were trying to access has expired.",
            pageExpiredMsg2: "Or",
            pageExpiredRestartLogin: "Restart login",
            pageExpiredContinueToApp: "continue to your application",
        },
        tr: {
            // Login page
            loginAccountTitle: "Telefon numaranız veya e-posta adresiniz nedir?",
            loginAccountDescription: "Hesabınıza erişmek için bilgilerinizi girin",
            orSeparator: "Veya",
            username: "Kullanıcı adı veya e-posta",
            usernameOrEmail: "Kullanıcı adı veya e-posta",
            password: "Şifre",
            rememberMe: "Beni hatırla",
            doLogIn: "Giriş yap",
            doContinue: "Devam",
            noAccount: "Hesabınız yok mu?",
            doRegister: "Hesap oluştur",
            doForgotPassword: "Şifrenizi mi unuttunuz?",
            orContinueWith: "Google, Apple veya Facebook ile devam edin",
            "identity-provider-login-label": "Veya",
            continueWithProvider: "{{provider}} ile devam edin",
            loginPlaceholder: "Telefon numarası veya e-posta adresi girin",
            
            // Register page
            registerTitle: "Hesap oluştur",
            registerAccountDescription: "Başlamak için yeni bir hesap oluşturun",
            backToLogin: "Zaten hesabınız var mı?",
            signUpWithSocialHint: "Giriş sayfasından Google, Apple veya Facebook ile de giriş yapabilirsiniz.",
            email: "E-posta",
            firstName: "Ad",
            lastName: "Soyad",
            
            // Forgot Password page
            emailForgotTitle: "Şifrenizi mi unuttunuz?",
            emailForgotDescription: "E-posta adresinizi girin, size şifre sıfırlama talimatları gönderelim",
            backToLoginPage: "Giriş sayfasına dön",
            doSubmit: "Gönder",
            doCancel: "İptal",
            
            // Update Password page
            updatePasswordTitle: "Şifrenizi güncelleyin",
            updatePasswordDescription: "Lütfen hesabınız için yeni bir şifre belirleyin",
            updatePasswordRequiredDescription: "Şifrenizi değiştirmeniz gerekiyor",
            passwordNew: "Yeni şifre",
            passwordConfirm: "Şifre tekrarı",
            
            // Update Profile page
            loginProfileTitle: "Profilinizi güncelleyin",
            loginProfileDescription: "Lütfen profil bilgilerinizi güncelleyin",
            loginProfileRequiredDescription: "Profil bilgilerinizi güncellemeniz gerekiyor",

            // Delete account confirm
            deleteAccountConfirm: "Hesabı silme onayı",
            irreversibleAction: "Bu işlem geri alınamaz.",
            deletingImplies: "Hesabınızı silmek şunları yapacaktır:",
            loggingOutImmediately: "Hemen oturumunuzu kapatacak",
            errasingData: "Tüm verilerinizi silecek",
            finalDeletionConfirmation: "Hesabınızı silmek istediğinizden emin misiniz?",
            doConfirmDelete: "Evet, hesabımı sil",

            // Configure TOTP page
            loginTotpTitle: "İki faktörlü kimlik doğrulamayı ayarla",
            loginTotpConfigureDescription: "Hesabınızı güvence altına almak için bir doğrulama uygulaması yapılandırın",
            loginTotpStepInstall: "Desteklenen uygulamalar:",
            loginTotpDeviceName: "Cihaz adı",
            logoutOtherSessions: "Diğer cihazlardan çıkış yap",
            loginOtpTitle: "İki faktörlü kimlik doğrulama",
            loginOtpOneTime: "Doğrulama kodunuzu girin",

            // Delete credential page
            deleteCredentialTitle: "{0} kaldır",
            deleteCredentialMessage: "Bu kimlik bilgisini kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.",

            // Error page
            errorTitle: "Bir hata oluştu",
            backToApplication: "Uygulamaya dön",

            // Login page expired
            pageExpiredTitle: "Sayfa süresi doldu",
            pageExpiredMsg1: "Erişmeye çalıştığınız sayfanın süresi doldu.",
            pageExpiredMsg2: "Veya",
            pageExpiredRestartLogin: "girişe yeniden başlayın",
            pageExpiredContinueToApp: "uygulamaya devam edin",
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
