import { i18nBuilder } from "keycloakify/account";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        en: {
            // Account page
            accountManagementTitle: "Account Management",
            personalInfoDescription: "Manage your personal information",
            accountSecurityDescription: "Manage your account security settings",
            editAccount: "Edit Account",
            personalInfo: "Personal Information",
            changePassword: "Change Password",
            authenticator: "Authenticator",
            deviceActivity: "Device Activity",
            linkedAccounts: "Linked Accounts",
            
            // Password page
            passwordTitle: "Change Password",
            passwordDescription: "Update your password to keep your account secure",
            currentPassword: "Current Password",
            newPassword: "New Password",
            passwordConfirm: "Confirm Password",
            updatePassword: "Update Password",
            passwordUpdated: "Password updated successfully",
            
            // Account page fields
            username: "Username",
            usernameFieldDescription: "Your unique identifier for signing in. It cannot be changed.",
            email: "Email",
            emailFieldDescription: "Your email address for account notifications and recovery.",
            firstName: "First Name",
            lastName: "Last Name",
            save: "Save Changes",
            cancel: "Cancel",
            
            // TOTP page
            totpTitle: "Mobile Authenticator Setup",
            totpDescription: "Set up two-factor authentication using your mobile device",
            scanBarcode: "Scan Barcode",
            unableToScan: "Unable to scan?",
            totpStep1: "Install one of the following applications on your mobile",
            totpStep2: "Open the application and scan the barcode",
            totpStep3: "Enter the one-time code provided by the application and click Submit",
            oneTimeCode: "One-time code",
            totpConfiguredDescription: "Mobile authenticator is configured for your account",
            
            // Sessions page
            sessionsTitle: "Device Activity",
            sessionsDescription: "Manage and logout from your active sessions",
            currentSession: "Current Session",
            ipAddress: "IP Address",
            started: "Started",
            lastAccess: "Last Access",
            expires: "Expires",
            clients: "Clients",
            signOutAll: "Sign out all sessions",
            
            // Applications page
            applicationsTitle: "Applications",
            applicationsDescription: "Manage applications that have access to your account",
            noApplications: "No applications with access",
            revokeAccess: "Revoke Access",
            
            // Federated Identity page
            federatedIdentityTitle: "Linked Accounts",
            federatedIdentityDescription: "Link your account with social providers",
            addProvider: "Add Account",
            removeProvider: "Remove",
            notLinked: "Not Linked",
            
            // Log page
            logTitle: "Account Activity Log",
            logDescription: "View your recent account activity",
            event: "Event",
            date: "Date",
            client: "Client",
            ipAddressLog: "IP Address",
            details: "Details",
        },
        tr: {
            // Account page
            accountManagementTitle: "Hesap Yönetimi",
            personalInfoDescription: "Kişisel bilgilerinizi yönetin",
            accountSecurityDescription: "Hesap güvenlik ayarlarınızı yönetin",
            editAccount: "Hesabı Düzenle",
            personalInfo: "Kişisel Bilgiler",
            changePassword: "Şifre Değiştir",
            authenticator: "Kimlik Doğrulayıcı",
            deviceActivity: "Cihaz Aktivitesi",
            linkedAccounts: "Bağlı Hesaplar",
            
            // Password page
            passwordTitle: "Şifre Değiştir",
            passwordDescription: "Hesabınızı güvende tutmak için şifrenizi güncelleyin",
            currentPassword: "Mevcut Şifre",
            newPassword: "Yeni Şifre",
            passwordConfirm: "Şifre Onayı",
            updatePassword: "Şifreyi Güncelle",
            passwordUpdated: "Şifre başarıyla güncellendi",
            
            // Account page fields
            username: "Kullanıcı Adı",
            usernameFieldDescription: "Giriş yapmak için kullandığınız benzersiz kimlik. Değiştirilemez.",
            email: "E-posta",
            emailFieldDescription: "Hesap bildirimleri ve kurtarma için e-posta adresiniz.",
            firstName: "Ad",
            lastName: "Soyad",
            save: "Değişiklikleri Kaydet",
            cancel: "İptal",
            
            // TOTP page
            totpTitle: "Mobil Kimlik Doğrulayıcı Kurulumu",
            totpDescription: "Mobil cihazınızı kullanarak iki faktörlü kimlik doğrulamayı ayarlayın",
            scanBarcode: "Barkodu Tara",
            unableToScan: "Tarayamıyor musunuz?",
            totpStep1: "Mobil cihazınıza aşağıdaki uygulamalardan birini yükleyin",
            totpStep2: "Uygulamayı açın ve barkodu tarayın",
            totpStep3: "Uygulama tarafından sağlanan tek kullanımlık kodu girin ve Gönder'e tıklayın",
            oneTimeCode: "Tek kullanımlık kod",
            totpConfiguredDescription: "Mobil kimlik doğrulayıcı hesabınız için yapılandırıldı",
            
            // Sessions page
            sessionsTitle: "Cihaz Aktivitesi",
            sessionsDescription: "Aktif oturumlarınızı yönetin ve çıkış yapın",
            currentSession: "Mevcut Oturum",
            ipAddress: "IP Adresi",
            started: "Başlangıç",
            lastAccess: "Son Erişim",
            expires: "Sona Erme",
            clients: "İstemciler",
            signOutAll: "Tüm oturumlardan çıkış yap",
            
            // Applications page
            applicationsTitle: "Uygulamalar",
            applicationsDescription: "Hesabınıza erişimi olan uygulamaları yönetin",
            noApplications: "Erişimi olan uygulama yok",
            revokeAccess: "Erişimi İptal Et",
            
            // Federated Identity page
            federatedIdentityTitle: "Bağlı Hesaplar",
            federatedIdentityDescription: "Hesabınızı sosyal sağlayıcılarla bağlayın",
            addProvider: "Hesap Ekle",
            removeProvider: "Kaldır",
            notLinked: "Bağlı Değil",
            
            // Log page
            logTitle: "Hesap Aktivite Günlüğü",
            logDescription: "Son hesap aktivitelerinizi görüntüleyin",
            event: "Olay",
            date: "Tarih",
            client: "İstemci",
            ipAddressLog: "IP Adresi",
            details: "Detaylar",
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };

