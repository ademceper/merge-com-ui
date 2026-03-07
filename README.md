# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@merge/ui/components/button"
```


Ortak Yapı İçin Önerim
En iyisi ikisinin iyi özelliklerini birleştirmek:

Auth'dan al: AppRouteObject (type-safe route + access + breadcrumb), toX() navigation helpers, generateEncodedPath, AuthWall guard pattern
Novu'dan al: Dual layout sistemi, ROUTES constants, CatchAllRoute akıllı yönlendirme, navigation hooks (side-effect'li)
Her ikisinden: Lazy loading (zaten var), feature-based colocation



Route Tanımlama
Novu	Auth
Konum	Tek dosya (main.tsx)	Feature klasörlerinde dağıtık
Tip güvenliği	Yok — düz string path'ler	AppRouteObject interface ile zorunlu access, opsiyonel breadcrumb
Router	createBrowserRouter	createHashRouter
Auth'un İyi Özellikleri
1. Type-safe route tanımı


// Her route'un access ve breadcrumb'ı zorunlu/tanımlı
interface AppRouteObject extends NonIndexRouteObject {
  path: string;
  breadcrumb?: (t: TFunction) => string | ComponentType;
  handle: { access: AccessType | AccessType[] };
}
Novu'da bu yok — route'lar düz obje.

2. Navigation helper pattern — toX() fonksiyonları


// URL-safe, tip-güvenli navigasyon
navigate(toEditOrganization({ realm, id: org.id!, tab: "settings" }));
Novu'da buildRoute(ROUTES.EDIT_WORKFLOW, { environmentSlug, workflowSlug }) — daha az type-safe, param isimleri string.

3. generateEncodedPath — URL encoding otomatik. Novu'da encoding yok.

4. Route-level access control — AuthWall component'i route handle'daki access prop'una bakarak otomatik koruma sağlıyor. Novu'da ProtectedRoute var ama şu an no-op (boş).

5. Breadcrumb sistemi — Route tanımından otomatik breadcrumb üretimi. Novu'da breadcrumb yok.

6. Feature-based colocation — Her feature kendi route'larını yönetiyor, ana routes.tsx sadece birleştiriyor.

Novu'nun İyi Özellikleri
1. Dual layout sistemi


DashboardLayoutRoute → sidebar + header (list sayfaları)
FullPageLayoutRoute  → full viewport (editor sayfaları)
Auth'da bu ayrım yok — hep sidebar layout.

2. Akıllı CatchAllRoute — Bilinmeyen URL'leri analiz edip doğru sayfaya yönlendiriyor, environment slug'ı çözümlüyor. Auth'da sadece 404 sayfası gösteriyor.

3. Environment-aware routing — URL'de environment bilgisi var (/env/production/workflows), environment değiştirince URL otomatik güncelleniyor. Auth'da realm URL'de var ama aynı seviyede entegrasyon yok.

4. Feature-specific navigation hooks


const { navigateToEditContextPage } = useContextsNavigate();
// search params korunuyor, query invalidation yapılıyor
Auth'un toX() fonksiyonları sadece path üretiyor, side-effect yok.

5. Command palette entegrasyonu — Route'lar command palette'te aranabilir. Auth'da yok.

6. ROUTES constants — Tüm path'ler tek yerde. Auth'da path'ler route dosyalarına dağılmış.

İkisinde de Eksik
Eksik	Açıklama
Route-level loader	İkisi de React Router loader kullanmıyor, data fetching component seviyesinde
Shared route types	İki proje farklı route tipleri kullanıyor
Ortak layout	Sidebar/header pattern'leri farklı implementasyonlarla tekrarlanıyor
Ortak Yapı İçin Önerim
En iyisi ikisinin iyi özelliklerini birleştirmek:

Auth'dan al: AppRouteObject (type-safe route + access + breadcrumb), toX() navigation helpers, generateEncodedPath, AuthWall guard pattern
Novu'dan al: Dual layout sistemi, ROUTES constants, CatchAllRoute akıllı yönlendirme, navigation hooks (side-effect'li)
Her ikisinden: Lazy loading (zaten var), feature-based colocation