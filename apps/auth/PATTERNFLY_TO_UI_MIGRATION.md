# PatternFly → @merge/ui Migration Guide

Admin theme'de PatternFly kullanılan yerler @merge/ui ile değiştiriliyor. Bu dosya eşleştirmeleri ve kalan işleri listeler.

## Tamamlanan Dönüşümler

### Shared (keycloak-ui-shared)
- **FormErrorText** – PF FormHelperText/HelperTextItem → `@merge/ui` FieldError + Phosphor WarningCircle
- **FormLabel** – PF FormGroup → `@merge/ui` Field, FieldLabel, FieldContent
- **HelpItem** – PF Popover/Icon/HelpIcon → `@merge/ui` Popover + Phosphor Question
- **UserProfileGroup** – PF FormGroup/InputGroup → `@merge/ui` Field, InputGroup
- **KeycloakSpinner** – PF Bullseye/Spinner → `@merge/ui` Spinner
- **FormSubmitButton** – PF Button → `@merge/ui` Button (`variant="default"`, `disabled`)
- **AlertPanel** – PF AlertGroup/Alert/AlertActionCloseButton → `@merge/ui` Alert, AlertTitle, AlertDescription, AlertAction, Button
- **Alerts.tsx** – AlertVariant artık keycloak-ui-shared'de tanımlı (`AlertVariant.success`, `.danger`, `.warning`, `.info`)
- **ContinueCancelModal** – PF Modal/Button → `@merge/ui` Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button
- **ErrorPage** – PF Page/Modal/Button/Text/TextContent → `@merge/ui` Dialog (open), DialogContent (showCloseButton=false), Button; Phosphor WarningCircle
- **KeycloakContext** – PF Spinner → `KeycloakSpinner` (shared controls)

### Admin
- **WorkflowsSection** – PF Button, PageSection, Switch, AlertVariant → `@merge/ui` Button, Switch, Label; AlertVariant keycloak-ui-shared'den
- **ConfirmDialog** – PF Modal, Button, ButtonVariant, ModalVariant → `@merge/ui` Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button
- **UserRoleMapping, CreateRealmRole, GroupRoleMapping, WorkflowDetailForm** – AlertVariant import'u keycloak-ui-shared'e taşındı
- **AlertVariant** – UserProfileContext, CreateClientRole, SamlImportKeyDialog, CreateUser, CreateUserFederationLdapSettings, ServiceAccount, CreateClientScope, AdvancedTab, RequiredActions, JwksSettings, ResetCredentialDialog: import `keycloak-ui-shared`; DeleteScopeDialog: Alert → `@merge/ui` Alert/AlertTitle/AlertDescription
- **PageSection** – CreateUser, CreateUserFederationLdapSettings, ServiceAccount, CreateClientScope, AdvancedTab: `<div className="bg-muted/30 p-4">` veya benzeri
- **Text** – AdvancedTab: `<p className="pb-6">`
- **RequiredActions** – Button, Switch, CogIcon → `@merge/ui` Button, Switch; Phosphor Gear
- **JwksSettings** – FormGroup, Button → `@merge/ui` Field, Button
- **ResetCredentialDialog** – Form, ModalVariant → `<form className="flex flex-col gap-4">`, variant kaldırıldı

## PatternFly → @merge/ui Eşleştirmeleri

| PatternFly | @merge/ui / Not |
|------------|------------------|
| `Alert`, `AlertVariant` | `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`; AlertVariant → keycloak-ui-shared'den `AlertVariant` |
| `Button`, `ButtonVariant.primary` | `Button` variant="default" |
| `ButtonVariant.danger` | `Button` variant="destructive" |
| `ButtonVariant.link` | `Button` variant="ghost" veya "link" |
| `Modal`, `ModalVariant` | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` |
| `PageSection` | `<div className="...">` (örn. `bg-muted/30 p-4`) |
| `FormGroup` | `Field`, `FieldLabel`, `FieldContent` (@merge/ui field) |
| `Form`, `ActionGroup` | `form` + `div` (flex/gap) veya Field bileşenleri |
| `Switch` (isChecked, onChange) | `Switch` (checked, onCheckedChange) |
| `SelectOption` | `SelectItem` (Select içinde) |
| `Tab`, `TabTitleText`, `Tabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `TextInput`, `TextArea` | `Input`, `Textarea` |
| `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |
| PF Icons | `@phosphor-icons/react` (örn. Question, WarningCircle, X, Trash) |

## Kalan İşler

Tüm admin ve shared dosyalarında:

1. `import { ... } from ".../@patternfly/react-core"` → ilgili bileşenleri `@merge/ui` veya `keycloak-ui-shared` ile değiştir.
2. `import { ... } from ".../@patternfly/react-icons"` → `@phosphor-icons/react` ile değiştir.
3. `import { ... } from ".../@patternfly/react-table"` → `@merge/ui` Table veya DataTable / TanStack Table kullan.
4. Sadece `AlertVariant` import eden dosyalarda: `from ".../@patternfly/react-core"` → `from ".../keycloak-ui-shared"`.

Aranacak ifadeler:
- `@patternfly/react-core`
- `@patternfly/react-icons`
- `@patternfly/react-table`
- `@patternfly/react-styles`

Shared keycloak-ui-shared içinde hâlâ PF kullanan dosyalar (user-profile, select, scroll-form, masthead, controls/table, KeycloakTextArea, NumberControl, PasswordInput, FileUploadControl, continue-cancel, context/ErrorPage, context/KeycloakContext, icons/IconMapper, OrganizationTable vb.) da aynı eşleştirmelerle @merge/ui’ye taşınmalıdır.
