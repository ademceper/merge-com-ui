/* eslint-disable @typescript-eslint/no-unused-vars */
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
            noAccount: "Don't have an account?",
            doRegister: "Create account",
            doForgotPassword: "Forgot password?",
            
            // Register page
            registerTitle: "Create an account",
            registerAccountDescription: "Create a new account to get started",
            backToLogin: "Already have an account?",
            email: "Email",
            firstName: "First name",
            lastName: "Last name",
            
            // Forgot Password page
            emailForgotTitle: "Forgot your password?",
            emailForgotDescription: "Enter your email and we'll send you instructions to reset your password",
            backToLoginPage: "Back to login",
            doSubmit: "Submit",
            
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
        },
        tr: {
            // Login page
            loginAccountTitle: "Hesabınıza giriş yapın",
            loginAccountDescription: "Hesabınıza erişmek için bilgilerinizi girin",
            orSeparator: "Veya",
            username: "Kullanıcı adı veya e-posta",
            usernameOrEmail: "Kullanıcı adı veya e-posta",
            password: "Şifre",
            rememberMe: "Beni hatırla",
            doLogIn: "Giriş yap",
            noAccount: "Hesabınız yok mu?",
            doRegister: "Hesap oluştur",
            doForgotPassword: "Şifrenizi mi unuttunuz?",
            
            // Register page
            registerTitle: "Hesap oluştur",
            registerAccountDescription: "Başlamak için yeni bir hesap oluşturun",
            backToLogin: "Zaten hesabınız var mı?",
            email: "E-posta",
            firstName: "Ad",
            lastName: "Soyad",
            
            // Forgot Password page
            emailForgotTitle: "Şifrenizi mi unuttunuz?",
            emailForgotDescription: "E-posta adresinizi girin, size şifre sıfırlama talimatları gönderelim",
            backToLoginPage: "Giriş sayfasına dön",
            doSubmit: "Gönder",
            
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
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };