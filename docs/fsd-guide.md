# Feature-Sliced Design (FSD) Kapsamli Rehber

> Bu dokuman, [feature-sliced.design](https://feature-sliced.design/) resmi dokumantasyonundan derlenmis kapsamli bir Turkce rehberdir.

---

## Icindekiler

1. [FSD Nedir?](#1-fsd-nedir)
2. [Katmanlar (Layers)](#2-katmanlar-layers)
3. [Slice'lar ve Segment'ler](#3-slicelar-ve-segmentler)
4. [Izolasyon Kurallari (Import Rules)](#4-izolasyon-kurallari-import-rules)
5. [Public API Kurallari](#5-public-api-kurallari)
6. [Framework Entegrasyonlari](#6-framework-entegrasyonlari)
7. [Migrasyon Rehberi](#7-migrasyon-rehberi)
8. [Gercek Dunya Ornekleri](#8-gercek-dunya-ornekleri)
9. [Cross-Import Sorunlari ve Cozumleri](#9-cross-import-sorunlari-ve-cozumleri)
10. [Naming Conventions](#10-naming-conventions)
11. [Alternatifler ve Karsilastirma](#11-alternatifler-ve-karsilastirma)

---

## 1. FSD Nedir?

### Tanim

Feature-Sliced Design (FSD), frontend uygulamalarini yapilandirmak icin gelistirilmis bir **mimari metodoloji**dir. Kod organizasyonu icin kurallar ve konvansiyonlar butunu sunar. Amaci, projenin anlasilabilirligini ve degisen is gereksinimlerine karsi dayanikliligi artirmaktir.

### Temel Felsefe ve Motivasyon

FSD su temel problemleri cozer:

- **Anlasilabilirlik**: Projeye yeni katilan bir gelistirici, kodun nerede oldugunu ve nasil organize edildigini hizla anlayabilir.
- **Surudurelebilirlik**: Degisen is gereksinimleri karsisinda kod tabaninin kararliligi korunur.
- **Yeniden Kullanilabirlik**: Yuksek kohezyon (cohesion) ve dusuk baglanti (coupling) sayesinde moduller bagimsiz olarak gelistirilebilir ve test edilebilir.
- **Olceklenebilirlik**: Proje buyudukce mimari bozulmaz; her yeni ozellik ayni kurallara uyar.

### Ne Zaman FSD Kullanilmali?

FSD su kosullarda uygundur:

- Frontend gelistirme yapilan projeler (web, mobil, masaustu)
- Kutuphane degil, uygulama gelistirme
- Herhangi bir programlama dili, UI framework'u veya state manager ile calisabilir
- Kademeli (incremental) benimseme ve monorepo yapilarini destekler

### Ne Zaman FSD Kullanilmamali?

- Cok kucuk, tek sayfali basit projeler
- Kutuphane veya paket gelistirme
- Takim FSD'ye karsi isteksiz oldugunda (takimin riza gostermesi onemlidir)

### Uc Organizasyon Seviyesi

FSD, kodu uc hiyerarsik seviyede organize eder:

```
src/
  app/          <- Katman (Layer)
  pages/        <- Katman
    feed/       <- Dilim (Slice)
      ui/       <- Parca (Segment)
      api/      <- Parca (Segment)
      model/    <- Parca (Segment)
    profile/    <- Dilim (Slice)
  widgets/      <- Katman
  features/     <- Katman
  entities/     <- Katman
  shared/       <- Katman
```

1. **Katmanlar (Layers)**: Standartlastirilmis, yukari-asagi siralama
2. **Dilimler (Slices)**: Is alani (domain) bazli kod bolumlemeleri
3. **Parcalar (Segments)**: Teknik amaca gore kod gruplamasi

---

## 2. Katmanlar (Layers)

FSD, 7 standart katmandan olusur. Yukaridan asagiya dogru siralama:

```
app        (en ust - uygulama geneli)
processes  (kaldirildi - deprecated)
pages      (sayfa bazli)
widgets    (buyuk UI bloklari)
features   (kullanici etkilesimleri)
entities   (is varliklari)
shared     (en alt - paylasilan, proje-bagimisiz)
```

**Onemli**: Projede tum katmanlari kullanmak zorunlu degildir. Yalnizca deger kattigini dusundugunuz katmanlari ekleyin.

### 2.1 Shared (Paylasilan) Katmani

**Ne ise yarar**: Projenin temelini olusturur. Dis baglantilari (backend'ler, kutuphaneler, ortam degiskenleri) icerir. Is mantigi iceremez. Proje-bagimisiz, yeniden kullanilabilir kodlar burada bulunur.

**Ozel durumu**: Shared katmaninda slice yoktur. Yalnizca segment'ler vardir ve bu segment'ler birbirine serbestce referans verebilir.

**Tipik segment'ler**:

| Segment | Aciklama | Ornek Icerik |
|---------|----------|-------------|
| `ui` | UI kit bilesenleri | Button, Input, Modal, Card |
| `api` | API istemcisi ve istek fonksiyonlari | axios instance, fetch wrapper |
| `lib` | Dahili kutuphaneler | tarih formatlama, string islemleri |
| `config` | Ortam degiskenleri, global feature flag'ler | API_URL, IS_PRODUCTION |
| `routes` | Rota sabitleri ve pattern'leri | ROUTES.HOME, ROUTES.PROFILE |
| `i18n` | Ceviri yapilandirmasi ve metinler | turkce.json, ingilizce.json |

**Dosya agaci ornegi**:

```
shared/
  api/
    client.ts          # API istemcisi (axios/fetch wrapper)
    models.ts          # Ortak tipler (User, Article vb.)
    index.ts           # Public API
  ui/
    button/
      Button.tsx
      Button.styles.ts
      index.ts
    input/
      Input.tsx
      index.ts
    modal/
      Modal.tsx
      index.ts
    index.ts           # Tum UI bilesenlerinin public API'si
  lib/
    date/
      formatDate.ts
      index.ts
    string/
      capitalize.ts
      index.ts
  config/
    backend.ts         # Backend URL yapisi
    env.ts             # Ortam degiskenleri
    index.ts
  routes/
    paths.ts
    index.ts
```

**Yapilmasi gerekenler**:
- Segment isimleri amaci (purpose) belirtmeli, ozu (essence) degil
- `shared/ui` icerisinde is mantigi (business logic) barindirabilirsiniz ancak is terimlerinden bagimsiz olmali
- Her segment icin ayri public API (index.ts) olusturun

**Yapilmamasi gerekenler**:
- `shared/components`, `shared/hooks`, `shared/utils` gibi teknik isimlendirmeler kullanmayin
- Ust katmanlara bagimlilik olusturmayin
- Is mantigi (business logic) eklemeyin

### 2.2 Entities (Varliklar) Katmani

**Ne ise yarar**: Projenin calistigi gercek dunya kavramlarini temsil eder. Ornegin bir sosyal agda User, Post, Group; bir e-ticaret sitesinde Product, Cart, Order.

**Tipik slice icerikleri**:

| Segment | Aciklama | Ornek |
|---------|----------|-------|
| `model` | Veri depolama, dogrulama semalari | UserStore, validateUser() |
| `api` | Varlikla ilgili API fonksiyonlari | getUser(), updateUser() |
| `ui` | Gorsel temsil, arayuzde tekrar kullanim | UserCard, UserAvatar |
| `lib` | Varliga ozel yardimci fonksiyonlar | formatUserName() |

**Dosya agaci ornegi**:

```
entities/
  user/
    api/
      getUser.ts
      updateUser.ts
    model/
      user.ts            # User tipi ve store
      userSchema.ts      # Zod/Yup dogrulama semasi
    ui/
      UserCard.tsx
      UserAvatar.tsx
    lib/
      formatUserName.ts
    index.ts             # Public API
  article/
    api/
      getArticle.ts
      listArticles.ts
    model/
      article.ts
    ui/
      ArticleCard.tsx
      ArticlePreview.tsx
    index.ts
  comment/
    api/
      getComments.ts
      createComment.ts
    model/
      comment.ts
    ui/
      CommentItem.tsx
    index.ts
```

**Varliklar arasi iliski (@x notasyonu)**:

Varliklar birbirine referans vermek zorunda kalabilir. Bu durumda `@x` notasyonu kullanilir:

```
entities/
  artist/
    model/
      artist.ts
    index.ts
  song/
    @x/
      artist.ts          # Artist entity icin ozel public API
    model/
      song.ts
    index.ts
```

```typescript
// entities/song/@x/artist.ts
export type { Song } from "../model/song.ts";

// entities/artist/model/artist.ts
import type { Song } from "entities/song/@x/artist";

export interface Artist {
  name: string;
  songs: Array<Song>;
}
```

**Neden @x?** Bagli varliklar birlikte refactor edilmek zorundadir, bu nedenle baglantinin gozden kacmasi imkansiz kilinmalidir.

**Yapilmasi gerekenler**:
- Her entity bir gercek dunya kavramini temsil etmeli
- Entity'ler birbirinden bagimsiz olmali (cross-import kurallarina dikkat)
- Public API uzerinden erisim saglayin

**Yapilmamasi gerekenler**:
- Entity'ler arasi dogrudan import yapmayin (@x haricinde)
- Entity icinde sayfa veya feature bazli is mantigi bulundurmayin

### 2.3 Features (Ozellikler) Katmani

**Ne ise yarar**: Kullanicinin uygulamayla olan temel etkilesimlerini uygular. Is varliklari (entities) uzerinde gerceklestirilen eylemlerdir.

**Onemli kural**: Her sey bir feature olmak zorunda degildir. Bir seyin feature olmasi gerektirinin iyi bir gostergesi, birden fazla sayfada kullanilmasidir.

**Tipik slice icerikleri**:

| Segment | Aciklama | Ornek |
|---------|----------|-------|
| `ui` | Etkilesim UI'i (formlar, butonlar) | LoginForm, AddToCartButton |
| `api` | Gerekli API cagrilari | loginUser(), addToCart() |
| `model` | Dogrulama ve dahili durum | loginFormSchema, cartState |
| `config` | Feature flag'leri | IS_NEW_LOGIN_ENABLED |

**Dosya agaci ornegi**:

```
features/
  auth/
    ui/
      LoginForm.tsx
      RegisterForm.tsx
      AuthButton.tsx
    api/
      login.ts
      register.ts
      logout.ts
    model/
      authStore.ts
      useAuth.ts
      loginSchema.ts
    index.ts
  add-to-cart/
    ui/
      AddToCartButton.tsx
    api/
      addToCart.ts
    model/
      cartValidation.ts
    index.ts
  write-comment/
    ui/
      CommentForm.tsx
    api/
      submitComment.ts
    index.ts
  toggle-favorite/
    ui/
      FavoriteButton.tsx
    api/
      toggleFavorite.ts
    index.ts
```

**Yapilmasi gerekenler**:
- Feature isimleri kullanici eylemlerini yansitmali (ornegin "add-to-cart", "write-comment")
- Yeni gelenler icin onemli kod alanlarinin hizla kesfedilebilmesini optimize edin

**Yapilmamasi gerekenler**:
- Yalnizca bir sayfada kullanilan, tekrar kullanilmayacak isleri feature yapmayin
- Feature'lar arasi ayni katmanda cross-import yapmayin

### 2.4 Widgets (Widget'lar) Katmani

**Ne ise yarar**: Buyuk, kendine yeterli UI bloklaridir. Ozellikle sayfalar arasi tekrar kullanildiginda veya tek bir sayfada birden fazla bagimsiz blok bulundugunda degerlidir.

**Onemli kural**: Bir UI blogu sayfanin ilginc iceriginin buyuk bolumunu olusturuyorsa ve asla baska yerde kullanilmayacaksa, widget olmamali; dogrudan o sayfanin icine yerlestirilmelidir.

**Ek kullanim alani**: Remix gibi ic ice rotalama (nested routing) sistemlerinde widget'lar, kendi veri cekmesi, yukleme durumlari ve hata sinirlari olan sayfa-benzeri yapilar olabilir. Sayfa duzenleri (layout) de burada bulunabilir.

**Dosya agaci ornegi**:

```
widgets/
  header/
    ui/
      Header.tsx
      HeaderNav.tsx
      UserMenu.tsx
    model/
      headerState.ts
    index.ts
  sidebar/
    ui/
      Sidebar.tsx
      SidebarNav.tsx
    index.ts
  article-feed/
    ui/
      ArticleFeed.tsx
      ArticleList.tsx
      Pagination.tsx
    api/
      loadArticles.ts
    model/
      feedFilters.ts
    index.ts
  login-dialog/
    ui/
      LoginDialog.tsx
    index.ts
```

**Yapilmasi gerekenler**:
- Widget'lari sayfalar arasi paylasilan buyuk UI parcalari icin kullanin
- Nested routing'de bagimsiz veri cekme ve hata yonetimi ekleyin

**Yapilmamasi gerekenler**:
- Her kucuk bileseni widget yapmayin
- Yalnizca bir yerde kullanilan icerik icin widget olusturmayin

### 2.5 Pages (Sayfalar) Katmani

**Ne ise yarar**: Uygulama icerisindeki ekranlar veya aktivitelerdir. Genellikle her sayfa icin bir slice olusturulur, ancak benzer sayfalar (kayit ve giris gibi) bir slice'i paylasabilir.

**Tipik icerikler**:

| Segment | Aciklama |
|---------|----------|
| `ui` | Sayfa UI'i, yukleme durumlari, hata sinirlari |
| `api` | Veri cekme ve mutasyon istekleri |

**Not**: Sayfaya ozel veri modelleri nadirdir; minimal durum bilesenler icinde kalir.

**Dosya agaci ornegi**:

```
pages/
  feed/
    ui/
      FeedPage.tsx
      Tabs.tsx
      TagFilter.tsx
    api/
      loader.ts
      action.ts
    index.ts
  sign-in/
    ui/
      LoginPage.tsx
      RegisterPage.tsx
    api/
      login.ts
      register.ts
    model/
      registrationSchema.ts
    index.ts
  article-read/
    ui/
      ArticlePage.tsx
      ArticleMeta.tsx
      Comments.tsx
    api/
      loader.ts
      action.ts
    index.ts
  article-edit/
    ui/
      ArticleEditPage.tsx
      TagsInput.tsx
      FormErrors.tsx
    api/
      loader.ts
      action.ts
    model/
      parseAsArticle.ts
    index.ts
  profile/
    ui/
      ProfilePage.tsx
    api/
      loader.ts
    index.ts
  settings/
    ui/
      SettingsPage.tsx
    api/
      action.ts
    index.ts
```

### 2.6 Processes (Surecler) Katmani - KALDIRILDI

**Durum**: Bu katman **kaldirilmistir** (deprecated).

Mevcut spec, bu katmandan kacinilmasini ve iceriginin `features` ve `app` katmanlarina tasinmasini onerir.

Orijinal amaci: Birden fazla sayfayi kapsayan karmasik etkilesimler icin bir kacis kapisi (escape hatch) olarak tasarlanmisti.

### 2.7 App (Uygulama) Katmani

**Ne ise yarar**: Uygulama genelindeki kaygiler icin kullanilir. Teknik kaygiler (context provider'lar) ve is kaygilari (analitik) burada bulunur.

**Ozel durumu**: Shared gibi, App katmaninda da slice yoktur. Yalnizca segment'ler vardir.

**Tipik segment'ler**:

| Segment | Aciklama | Ornek |
|---------|----------|-------|
| `routes` | Router yapilandirmasi | createBrowserRouter() |
| `store` | Global store yapilandirmasi | configureStore() |
| `styles` | Global stiller | global.css, variables.css |
| `entrypoint` | Framework'e ozel uygulama giris noktasi | main.tsx |
| `providers` | Context provider'lar | ThemeProvider, AuthProvider |

**Dosya agaci ornegi**:

```
app/
  routes/
    index.tsx          # Router yapilandirmasi
  store/
    index.ts           # Redux/Zustand store setup
  styles/
    global.css
    variables.css
  providers/
    ThemeProvider.tsx
    AuthProvider.tsx
    index.tsx          # Tum provider'larin birlesitirilmesi
  entrypoint/
    main.tsx           # ReactDOM.createRoot()
  index.ts
```

---

## 3. Slice'lar ve Segment'ler

### 3.1 Slice (Dilim) Nedir?

Slice, FSD'nin ikinci organizasyon seviyesidir. Gorevi, kodu **urun, is veya uygulama icin anlami** bazinda gruplamaktir.

**Isimlendirme**: Slice isimleri is alanina (business domain) gore belirlenir. Uygulama turune gore degisir:

| Uygulama Turu | Ornek Slice Isimleri |
|---------------|---------------------|
| Fotograf galerisi | `photo`, `effects`, `gallery-page` |
| Sosyal ag | `post`, `comments`, `news-feed` |
| E-ticaret | `product`, `cart`, `order`, `checkout` |
| Muzik uygulamasi | `song`, `album`, `artist`, `playlist` |

**Onemli**: Shared ve App katmanlarinda slice yoktur. Shared is mantigi iceremez, App ise uygulama geneli kodu barindirir ve alt bolmeye ihtiyac duymaz.

### 3.2 Sifir Baglanti ve Yuksek Kohezyon

Slice'lar birbirinden **bagimsiz** calisirken, ic yapilari guclu iliskiler icermelidir:

- **Yuksek Kohezyon**: Slice icindeki tum dosyalar ayni is amacina hizmet eder
- **Dusuk Baglanti (Coupling)**: Slice'lar arasi bagimlilik minimum seviyededir
- **Izolasyon**: Bir slice'daki degisiklik, ayni katmandaki baska slice'lari etkilememeli

### 3.3 Slice Gruplari

Iliskili slice'lar klasorler icinde yapisal olarak gruplanabilir:

```
entities/
  user/
    ...
  @auth/                 # Grup klasoru
    session/
      ...
    credentials/
      ...
  @content/              # Grup klasoru
    article/
      ...
    comment/
      ...
```

**Onemli kural**: Grup icinde kod paylasimi yapilmaz. Gruplama yalnizca yapisal organizasyon icindir.

### 3.4 Segment (Parca) Nedir?

Segment, ucuncu organizasyon seviyesidir. Kodu **teknik dogasina** gore gruplar.

**Standart segment isimleri**:

#### `ui` Segmenti
UI bilesenleri, formatlayicilar, stiller.

```typescript
// entities/user/ui/UserCard.tsx
interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div className="user-card" onClick={onClick}>
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
    </div>
  );
}
```

#### `api` Segmenti
Backend etkilesimleri, istekler, veri tipleri, mapper'lar.

```typescript
// entities/user/api/getUser.ts
import { client } from "@/shared/api";

export async function getUser(id: string) {
  const { data } = await client.GET("/users/{id}", {
    params: { path: { id } },
  });
  return data;
}
```

#### `model` Segmenti
Veri semalari, arayuzler, store'lar, is mantigi.

```typescript
// entities/user/model/user.ts
import { create } from "zustand";

interface UserState {
  currentUser: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  setUser: (user) => set({ currentUser: user }),
  clearUser: () => set({ currentUser: null }),
}));
```

#### `lib` Segmenti
Slice ici yeniden kullanilabilir moduller.

```typescript
// entities/user/lib/formatUserName.ts
export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}
```

#### `config` Segmenti
Yapilandirma ve feature flag'ler.

```typescript
// features/auth/config/authConfig.ts
export const AUTH_CONFIG = {
  tokenKey: "access_token",
  refreshTokenKey: "refresh_token",
  tokenExpiry: 3600, // saniye
  enableBiometric: false,
};
```

### 3.5 Ozel (Custom) Segment'ler

Ozellikle App ve Shared katmanlarinda ozel segment isimleri kullanilabilir:

```
shared/
  i18n/           # Ozel segment: Coklu dil destegi
  routes/         # Ozel segment: Rota sabitleri
  analytics/      # Ozel segment: Analitik islemleri
```

### 3.6 Segment Isimlendirme Kurali

Segment isimleri icerigin **amacini** (purpose) tanimlamalidir, **ozunu** (essence) degil.

| Yanlis (Oz) | Dogru (Amac) |
|-------------|-------------|
| `components` | `ui` |
| `hooks` | `model` veya `lib` |
| `types` | Ilgili segmente dagitilmali |
| `helpers` | `lib` |
| `utils` | `lib` |
| `constants` | `config` |
| `containers` | `ui` |
| `modals` | `ui` |

### 3.7 Public API (index.ts)

Her slice, bir public API tanimlamalidir. Dis moduller **yalnizca** public API uzerinden erisebilir, ic dosya yapisina dogrudan erisilemez.

```typescript
// entities/user/index.ts
export { UserCard } from "./ui/UserCard";
export { UserAvatar } from "./ui/UserAvatar";
export { getUser, updateUser } from "./api/getUser";
export { useUserStore } from "./model/user";
export type { User } from "./model/user";
```

---

## 4. Izolasyon Kurallari (Import Rules)

### 4.1 Temel Kural: Katmanlar Arasi Import

FSD'nin en temel kisitlamasi:

> **Bir slice icindeki modul (dosya), yalnizca kesinlikle altindaki katmanlarda bulunan slice'lardan import yapabilir.**

Bu kural, tek yonlu bagimlilik akisi olusturur:

```
app     -> pages, widgets, features, entities, shared
pages   -> widgets, features, entities, shared
widgets -> features, entities, shared
features -> entities, shared
entities -> shared
shared  -> (hicbir sey - yalnizca dis kutuphaneler)
```

### 4.2 Detayli Import Matrisi

| Kaynak Katman | Import Edilebilir Katmanlar |
|---------------|---------------------------|
| `app` | pages, widgets, features, entities, shared |
| `pages` | widgets, features, entities, shared |
| `widgets` | features, entities, shared |
| `features` | entities, shared |
| `entities` | shared (ve @x ile diger entities) |
| `shared` | Yalnizca dis kutuphaneler |

### 4.3 Ornek: Gecerli ve Gecersiz Import'lar

```typescript
// GECERLI: features/auth altindan entities/user'a erisim
// features/auth/ui/LoginForm.tsx
import { UserAvatar } from "@/entities/user";     // OK - alt katman
import { Button } from "@/shared/ui";              // OK - alt katman

// GECERSIZ: features/auth altindan features/cart'a erisim
// features/auth/ui/LoginForm.tsx
import { CartIcon } from "@/features/cart";         // YASAK - ayni katman!

// GECERSIZ: entities/user altindan features/auth'a erisim
// entities/user/model/user.ts
import { useAuth } from "@/features/auth";          // YASAK - ust katman!

// GECERLI: Slice ici import
// features/auth/ui/LoginForm.tsx
import { loginSchema } from "../model/loginSchema"; // OK - ayni slice
```

### 4.4 Istisnalar

**App ve Shared katmanlari**: Bu iki katman hem katman hem de slice olarak calisir. Ic segment'ler birbirine serbestce import yapabilir.

```typescript
// GECERLI: shared icindeki segment'ler arasi import
// shared/api/client.ts
import { API_URL } from "@/shared/config/backend"; // OK
```

### 4.5 Slice'lar Arasi Import Yasagi

Ayni katmandaki slice'lar birbirine import yapamaz:

```typescript
// YASAK: Ayni katmandaki iki feature arasinda import
// features/cart/ui/CartButton.tsx
import { useAuth } from "@/features/auth"; // YASAK!

// COZUM 1: Ust katmanda birlestirme (Composition)
// pages/shop/ui/ShopPage.tsx
import { CartButton } from "@/features/cart";
import { useAuth } from "@/features/auth";
// CartButton'a auth bilgisini prop olarak gecin

// COZUM 2: Entities katmanina tasima
// entities/session icinde auth durumunu tutun
// Her iki feature da entities/session'dan import yapar
```

### 4.6 Bagimlilik Yonu Kurallari

Bagimliliklar **her zaman yukaridan asagiya** akar:

```
         app
          |
        pages
          |
       widgets
          |
       features
          |
       entities
          |
        shared
```

Bu tek yonlu akis:
- Dongusel bagimliliklari onler
- Her katmanin bagimsiz test edilmesini saglar
- Refactoring'i kolaylastirir

---

## 5. Public API Kurallari

### 5.1 Public API Nedir?

Public API, modul gruplari (slice'lar gibi) ile tuketici kod arasindaki bir **sozlesmedir**. Kontrol edilen bir gecit gorevindedir ve erisimlere yalnizca belirlenmis re-export'lar araciligiyla izin verir.

### 5.2 Etkili Public API'nin Uc Temel Hedefi

1. **Yapisal Koruma**: Uygulama kodu, slice'in ic refactoring'lerinden etkilenmez
2. **Davranissal Tutarlilik**: Slice davranisindaki kirilici degisiklikler, public API'de de karsilik gelen degisiklikler gerektirir
3. **Minimum Maruz Kalma**: Yalnizca gerekli bilesenler disariya acilmalidir

### 5.3 Dogru Public API Ornegi

```typescript
// entities/user/index.ts
export { UserCard } from "./ui/UserCard";
export { UserAvatar } from "./ui/UserAvatar";
export { getUser } from "./api/getUser";
export { useUserStore } from "./model/user";
export type { User, UserRole } from "./model/types";
```

### 5.4 Anti-Pattern: Wildcard Re-export

```typescript
// YANLIS - Kesfedilebilirligi azaltir ve icleri acar
export * from "./ui/Comment";
export * from "./model/comments";

// DOGRU - Acik ve kontrolllu
export { Comment } from "./ui/Comment";
export { useComments, addComment } from "./model/comments";
export type { CommentData } from "./model/comments";
```

Wildcard re-export'lar gercek arayuzu gizler ve entegrasyonu zorlastirir.

### 5.5 @x Notasyonu ile Cross-Import

Entity'ler arasinda mestu cross-import gerektiginde:

```
entities/
  song/
    @x/
      artist.ts       # Artist entity icin ozel API
      playlist.ts     # Playlist entity icin ozel API
    model/
      song.ts
    index.ts          # Normal public API
```

```typescript
// entities/song/@x/artist.ts
export type { Song } from "../model/song.ts";

// entities/artist/model/artist.ts
import type { Song } from "entities/song/@x/artist";
```

**Kisitlama**: @x notasyonu yalnizca Entities katmaninda kullanilmalidir.

### 5.6 Dongusal (Circular) Import Tehlikesi

Dosyalar birbirini dongusal olarak import ettiginde sorunlar olusur:

```typescript
// SORUNLU PATTERN
// pages/home/ui/HomePage.tsx
import { loadUserStatistics } from "../"; // index.ts'yi import ediyor

// pages/home/index.ts
export { HomePage } from "./ui/HomePage";          // HomePage'i export ediyor
export { loadUserStatistics } from "./api/loadUserStatistics";
```

**Cozum stratejisi**: Slice icinde goreceli (relative) import, slice'lar arasi mutlak (absolute) import kullanin.

```typescript
// Slice ici (goreceli)
import { loginSchema } from "../model/loginSchema";

// Slice arasi (mutlak)
import { UserCard } from "@/entities/user";
```

### 5.7 Shared Katmaninda Tree-Shaking Sorunu

`shared/ui` ve `shared/lib` gibi koleksiyonlarda ilgisiz moduller bulunur. Monolitik index dosyalari, etkili tree-shaking'i engeller.

**Cozum**: Her bilesen icin ayri index dosyasi kullanin:

```typescript
// Dogrudan import (tree-shaking dostu)
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/text-field";

// KACINILMASI GEREKEN (tek dev index)
import { Button, TextField } from "@/shared/ui";
```

### 5.8 Steiger ile Zorlama

Index dosyalari, public API'yi atlayan dogrudan import'lari onleyemez. IDE'lerin otomatik import ozellikleri sinir ihlallerine yol acabilir.

**Cozum**: [Steiger](https://github.com/feature-sliced/steiger) - FSD uyumlulugu icin mimari linter.

---

## 6. Framework Entegrasyonlari

### 6.1 Next.js ile FSD

Next.js'in klasor tabanli rotalama sistemi, FSD'nin duz slice yapisiyla catisir. Cozum, Next.js'in `app` klasorunu proje kokune tasimak ve FSD sayfalarini `src` dizininden import etmektir.

#### App Router ile FSD

**Temel yaklasim**:
- Next.js `app` klasoru proje kokunde
- FSD katmanlari `src` icinde
- Bos `pages` klasoru (Pages Router fallback'ini onlemek icin)

**Dosya agaci**:

```
proje-koku/
  app/                          # Next.js routing (proje kokunde)
    api/
      get-example/
        route.ts
    example/
      page.tsx
    layout.tsx
  pages/                        # Bos klasor (README.md ile)
    README.md
  src/                          # FSD katmanlari
    app/
      providers/
        ThemeProvider.tsx
      api-routes/
        get-example-data.ts
      styles/
        global.css
    pages/
      example/
        ui/
          ExamplePage.tsx
        index.ts
    widgets/
      header/
        ui/
          Header.tsx
        index.ts
    features/
      auth/
        ui/
          LoginForm.tsx
        index.ts
    entities/
      user/
        model/
          user.ts
        index.ts
    shared/
      ui/
        button/
          Button.tsx
      api/
        client.ts
      config/
        env.ts
```

**Sayfa re-export pattern'i**:

```typescript
// app/example/page.tsx (Next.js route dosyasi)
export { ExamplePage as default, metadata } from "@/pages/example";

// src/pages/example/index.ts (FSD public API)
export { ExamplePage } from "./ui/ExamplePage";
export { metadata } from "./config/metadata";
```

**API Route Handler'lari**:

```typescript
// src/app/api-routes/get-example-data.ts
import { getExamplesList } from "@/shared/db";

export const getExampleData = () => {
  try {
    const examplesList = getExamplesList();
    return Response.json({ examplesList });
  } catch {
    return Response.json(null, {
      status: 500,
      statusText: "Bir seyler yanlis gitti",
    });
  }
};

// app/api/example/route.ts (proje kokunde)
export { getExampleData as GET } from "@/app/api-routes";
```

#### Pages Router ile FSD

**Dosya agaci**:

```
proje-koku/
  pages/                        # Next.js routing (proje kokunde)
    _app.tsx
    api/
      example.ts
    example/
      index.tsx
  src/                          # FSD katmanlari
    app/
      custom-app/
        custom-app.tsx
    pages/
      example/
        ui/
          ExamplePage.tsx
        index.ts
    widgets/
    features/
    entities/
    shared/
```

**Sayfa re-export pattern'i**:

```typescript
// pages/example/index.tsx (Next.js route dosyasi)
export { Example as default } from "@/pages/example";

// pages/_app.tsx
export { App as default } from "@/app/custom-app";
```

**Custom App bileseni**:

```typescript
// src/app/custom-app/custom-app.tsx
import type { AppProps } from "next/app";

export const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
};
```

**API Route'lari (Pages Router)**:

```typescript
// src/app/api-routes/get-example-data.ts
import type { NextApiRequest, NextApiResponse } from "next";

const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
  maxDuration: 5,
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ message: "FSD'den merhaba" });
};

export const getExampleData = { config, handler } as const;

// pages/api/example.ts (proje kokunde)
import { getExampleData } from "@/app/api-routes";
export const config = getExampleData.config;
export default getExampleData.handler;
```

**Ozel dosya konumlari**:
- **Middleware**: Proje kokunde (`middleware.ts`)
- **Instrumentation**: Proje kokunde (`instrumentation.js`)

#### Next.js ile En Iyi Uygulamalar

- Veritabani sorgulari icin `shared` katmaninda `db` segmenti kullanin
- Onbellekleme ve yeniden dogrulama mantogini sorgu tanimlariyla birlikte tutun
- FSD frontend mimarisini hedefler; kapsamli backend kodu icin ayri monorepo paketi dusunun

### 6.2 Vite + React ile FSD

Vite + React ile FSD uygulamasi en basit entegrasyondur cunku Vite'in klasor tabanli rotalamasi yoktur:

**Dosya agaci**:

```
src/
  app/
    routes/
      index.tsx          # React Router yapilandirmasi
    providers/
      index.tsx          # Provider'larin birlestirilmesi
    styles/
      global.css
    main.tsx             # Giris noktasi
  pages/
    home/
      ui/
        HomePage.tsx
      api/
        loader.ts
      index.ts
    about/
      ui/
        AboutPage.tsx
      index.ts
  widgets/
    header/
      ui/
        Header.tsx
      index.ts
  features/
    auth/
      ui/
        LoginForm.tsx
      api/
        login.ts
      model/
        authStore.ts
      index.ts
  entities/
    user/
      model/
        user.ts
      ui/
        UserCard.tsx
      index.ts
  shared/
    ui/
      button/
        Button.tsx
        index.ts
      input/
        Input.tsx
        index.ts
    api/
      client.ts
      index.ts
    config/
      env.ts
      index.ts
    lib/
      date/
        formatDate.ts
        index.ts
```

**Alias yapilandirmasi (vite.config.ts)**:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**tsconfig.json paths**:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 6.3 React Native ile FSD

React Native projelerinde FSD ayni prensiplerle uygulanabilir. Dosya tabanli rotalama (Expo Router) kullaniliyorsa Next.js'e benzer yaklasim uygulanir.

**Expo Router ile dosya agaci**:

```
app/                            # Expo Router (proje kokunde)
  (tabs)/
    index.tsx
    profile.tsx
  _layout.tsx
src/                            # FSD katmanlari
  app/
    providers/
      index.tsx
  pages/
    home/
      ui/
        HomePage.tsx
      index.ts
    profile/
      ui/
        ProfilePage.tsx
      index.ts
  widgets/
    bottom-tab/
      ui/
        BottomTab.tsx
      index.ts
  features/
    auth/
      ui/
        LoginForm.tsx
      index.ts
  entities/
    user/
      model/
        user.ts
      index.ts
  shared/
    ui/
      button/
        Button.tsx
        index.ts
    api/
      client.ts
      index.ts
```

**Route dosyasi re-export**:

```typescript
// app/(tabs)/index.tsx
export { HomePage as default } from "@/pages/home";

// app/(tabs)/profile.tsx
export { ProfilePage as default } from "@/pages/profile";
```

**Duz React Native (rotalama olmadan)**:

```
src/
  app/
    navigation/
      RootNavigator.tsx
      index.ts
    providers/
      index.tsx
    App.tsx
  pages/
    home/
      ui/
        HomeScreen.tsx
      index.ts
  widgets/
  features/
  entities/
  shared/
```

---

## 7. Migrasyon Rehberi

### 7.1 Migrasyon Oncesi Degerlendirme

FSD'ye gecmeden once su sorulari yanitlayin:

1. **Yeni takim uyeleri uretkenlige ulasmakta zorlanyor mu?**
2. **Bir alanda yapilan kod degisiklikleri ilgisiz islevselligi sik sik bozuyor mu?**
3. **Ozellik eklemek asiri bagimlilik yonetimi gerektiriyor mu?**

Eger bu sorulara "evet" yaniti veriyorsaniz, FSD gecisi faydali olabilir.

### 7.2 Takim ve Yonetim Uyumu

- Takim arkadaslarinizin iradesi disinda FSD'ye gecis yapmayin
- Migrasyon kademeli olarak gerceklesebilir, yeni ozelliklerin gelistirilmesini durdurmaz
- Yeni gelistiriciler icin adapasyon surecini kisaltir
- Dokumante edilmis mimari, dahili dokumantasyon bakimini azaltir

### 7.3 Ilk Kurulum

`src` dizini icin bir alias olusturun (genellikle `@`):

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 7.4 Adim Adim Migrasyon

#### Adim 1: Kodu Sayfalara Boluun

**Hedef**: Net sayfa seviyesinde ayrim olusturmak

Sayfalar henuz yoksa, `pages` klasoru olusturun ve bilesen mantogini route'lardan tasiyin:

```
// Onceki durum
src/
  routes/
    products.[id].js     # Buyuk bilesen ve veri cekme mantigi
  components/
    ProductDetails.tsx
    ProductList.tsx

// Sonraki durum
src/
  pages/
    product/
      ui/
        ProductPage.tsx
      index.ts
  routes/
    products.[id].js     # Yalnizca re-export
```

```typescript
// routes/products.[id].js (minimal)
export { ProductPage as default } from "@/pages/product";

// pages/product/index.ts
export { ProductPage } from "./ui/ProductPage";

// pages/product/ui/ProductPage.tsx
export function ProductPage() {
  return <div>...</div>;
}
```

**Temel prensip**: Route dosyalarini minimal tutun; asil mantigi sayfa bilesenlerinde barindin.

#### Adim 2: Sayfalari Diger Her Seyden Ayirin

**Hedef**: App ve Shared katmanlarini olusturmak

Iki klasor olusturun:
- `src/app` - Route'lari, App bilesenini ve sayfalari import eden her seyi icerir
- `src/shared` - Sayfalardan veya route'lardan import yapmayan her seyi icerir

```
src/
  app/
    routes/
    App.tsx
    index.ts
  pages/
    product/
      ui/
      index.ts
    catalog/
      ui/
      index.ts
  shared/
    api/
    ui/
    lib/
    config/
```

**Onemli not**: Shared katmaninda slice yoktur; segment'ler birbirine serbestce import yapabilir.

#### Adim 3: Sayfalar Arasi Cross-Import'lari Cozun

**Hedef**: Sayfadan sayfaya bagimliliklari ortadan kaldirmak

Her sayfanin baska bir sayfadan import yaptigi durumda iki yaklasimdan birini secin:

**Yaklasim 1 - Coglama (Duplication)**:
Kodu bagimli sayfaya kopyala-yapistir yapin.

> "Kopyala-yapistir mimari olarak yanlis degildir... bazen soyutlamak yerine cogaltmak daha dogru olabilir." Ancak is mantogini cogaltmaktan kacinin.

**Yaklasim 2 - Paylasilan soyutlama**:
Yeniden kullanilabilir kodu Shared katmani segment'lerine tasiyin:
- UI bilesenleri -> `shared/ui`
- Yapilandirma sabitleri -> `shared/config`
- Backend etkilesimleri -> `shared/api`

#### Adim 4: Shared Katmanini Konsolide Edin

**Hedef**: Shared'den belirli sayfa slice'larina ait kodu cikartin

Yalnizca bir sayfa tarafindan kullanilan nesneleri belirleyin ve o sayfanin slice'ina tasiyin:

```
// Onceki (tum action'lar bir arada)
shared/
  actions/
    productActions.ts
    cartActions.ts
    userActions.ts

// Sonraki (sayfalara dagitilmis)
pages/
  product/
    actions/
      productActions.ts
    ui/
      ProductPage.tsx
    index.ts
```

#### Adim 5: Teknik Amaca Gore Organize Edin (Segment'ler)

**Hedef**: Kod turune gore gruplardan isleve gore gruplara gecis

```
// Onceki
pages/product/
  components/
    ProductDetails.tsx
    ProductForm.tsx
  hooks/
    useProduct.ts
  helpers/
    formatPrice.ts
  constants/
    productConfig.ts

// Sonraki (FSD segment'leri)
pages/product/
  ui/
    ProductDetails.tsx
    ProductForm.tsx
  model/
    useProduct.ts
  lib/
    formatPrice.ts
  config/
    productConfig.ts
```

**Shared katmani yeniden yapilandirmasi**:
- `components`, `containers` -> `shared/ui`
- `helpers`, `utils` -> `shared/lib` (isleve gore gruplanmis)
- `constants` -> `shared/config` (isleve gore gruplanmis)

#### Adim 6 (Opsiyonel): Entities/Features Olusturma

Is alani Redux slice'lari varsa:
- Is varligi slice'lari -> `entities/` katmani (ornegin products Redux slice -> `entities/products`)
- Eylem odakli slice'lar -> `features/` katmani

#### Adim 7 (Opsiyonel): Modules Katmanini Refactor Etme

Ozel `modules` klasorleri varsa:
- Buyuk UI parcalari iceren moduller -> `widgets/` katmani
- Salt is mantigi iceren moduller -> `features/` katmani

#### Adim 8 (Opsiyonel): shared/ui Temizligi

Sunum bilesenlerini is mantigindan ayirin:
- Gomulu is mantogini kaldirin
- Mantigi ust katmanlara tasiyin
- Yeniden kullanilabilirligi en ust duzeye cikarin

### 7.5 Yaygin Hatalar ve Cozumleri

| Hata | Cozum |
|------|-------|
| Her seyi bir anda tasimaya calismak | Kademeli gecis yapin, once App ve Shared |
| Cok fazla feature olusturmak | Yalnizca birden fazla sayfada kullanilanlari feature yapin |
| Shared'a is mantigi koymak | Is mantigini entities veya features'a tasiyin |
| Segment'leri teknik olarak isimlendirmek | Amac bazli isimlendirme kullanin (ui, model, api, lib, config) |
| Tum export'lari wildcard yapmak | Acik (explicit) re-export kullanin |
| Cross-import ihlalleri yapmak | Import kuralina kesinlikle uyun |

---

## 8. Gercek Dunya Ornekleri

### 8.1 Conduit (Medium Klonu) Proje Yapisi

Tutorial'da kullanilan ornek uygulama:

```
src/
  app/
    routes/
      _index.tsx                    # Feed sayfasi route
      login.tsx                     # Giris sayfasi route
      register.tsx                  # Kayit sayfasi route
      articles.$slug.tsx            # Makale okuma route
      editor.tsx                    # Yeni makale route
      editor.$slug.tsx              # Makale duzenleme route
      profile.$username.tsx         # Profil route
      settings.tsx                  # Ayarlar route
    root.tsx                        # Root layout
  pages/
    feed/
      ui/
        FeedPage.tsx
        Tabs.tsx
        TagFilter.tsx
      api/
        loader.ts                   # Makale ve etiket cekme
      index.ts
    sign-in/
      ui/
        LoginPage.tsx
        RegisterPage.tsx
      api/
        sign-in.ts                  # Giris action
        register.ts                 # Kayit action
      index.ts
    article-read/
      ui/
        ArticlePage.tsx
        ArticleMeta.tsx
        Comments.tsx
      api/
        loader.ts                   # Makale + yorum cekme
        action.ts                   # Favori, takip, yorum islemleri
      index.ts
    article-edit/
      ui/
        ArticleEditPage.tsx
        TagsInput.tsx
        FormErrors.tsx
      api/
        loader.ts
        action.ts
      model/
        parseAsArticle.ts           # Dogrulama
      index.ts
    profile/
      ui/
        ProfilePage.tsx
      api/
        loader.ts
      index.ts
    settings/
      ui/
        SettingsPage.tsx
      api/
        action.ts
      index.ts
  shared/
    api/
      client.ts                     # openapi-fetch istemcisi
      models.ts                     # Tip tanimlari (Article, User)
      auth.server.ts                # Oturum yonetimi
      index.ts
    ui/
      Header.tsx                    # Genel baslik bileseni
      index.ts
    config/
      backend.ts                    # Backend URL
      index.ts
```

### 8.2 E-Ticaret Uygulamasi Ornek Yapisi

```
src/
  app/
    routes/
      index.tsx
    providers/
      ThemeProvider.tsx
      CartProvider.tsx
    store/
      index.ts
    styles/
      global.css
  pages/
    home/
      ui/
        HomePage.tsx
        HeroBanner.tsx
        FeaturedProducts.tsx
      api/
        loader.ts
      index.ts
    product-detail/
      ui/
        ProductDetailPage.tsx
        ProductGallery.tsx
        ProductInfo.tsx
        Reviews.tsx
      api/
        loader.ts
      index.ts
    cart/
      ui/
        CartPage.tsx
        CartItem.tsx
        CartSummary.tsx
      index.ts
    checkout/
      ui/
        CheckoutPage.tsx
        ShippingForm.tsx
        PaymentForm.tsx
      api/
        action.ts
      model/
        checkoutSchema.ts
      index.ts
  widgets/
    header/
      ui/
        Header.tsx
        SearchBar.tsx
        CartIcon.tsx
        UserMenu.tsx
      index.ts
    footer/
      ui/
        Footer.tsx
      index.ts
    product-card/
      ui/
        ProductCard.tsx
      index.ts
  features/
    add-to-cart/
      ui/
        AddToCartButton.tsx
        QuantitySelector.tsx
      api/
        addToCart.ts
      index.ts
    search-products/
      ui/
        SearchInput.tsx
        SearchResults.tsx
      api/
        searchProducts.ts
      model/
        searchStore.ts
      index.ts
    auth/
      ui/
        LoginForm.tsx
        RegisterForm.tsx
      api/
        login.ts
        register.ts
        logout.ts
      model/
        authStore.ts
      index.ts
    write-review/
      ui/
        ReviewForm.tsx
      api/
        submitReview.ts
      model/
        reviewSchema.ts
      index.ts
  entities/
    product/
      api/
        getProduct.ts
        listProducts.ts
      model/
        product.ts
        productStore.ts
      ui/
        ProductPreview.tsx
        ProductPrice.tsx
        ProductRating.tsx
      lib/
        formatPrice.ts
      index.ts
    user/
      api/
        getUser.ts
      model/
        user.ts
        userStore.ts
      ui/
        UserAvatar.tsx
        UserName.tsx
      index.ts
    cart-item/
      model/
        cartItem.ts
      ui/
        CartItemRow.tsx
      index.ts
    order/
      api/
        createOrder.ts
        getOrders.ts
      model/
        order.ts
      index.ts
  shared/
    api/
      client.ts
      interceptors.ts
      index.ts
    ui/
      button/
        Button.tsx
        index.ts
      input/
        Input.tsx
        index.ts
      modal/
        Modal.tsx
        index.ts
      spinner/
        Spinner.tsx
        index.ts
      card/
        Card.tsx
        index.ts
    lib/
      currency/
        formatCurrency.ts
        index.ts
      date/
        formatDate.ts
        index.ts
      validation/
        commonSchemas.ts
        index.ts
    config/
      env.ts
      routes.ts
      index.ts
```

### 8.3 Authentication Ornegi

FSD'de kimlik dogrulamanin tipik uygulamasi:

**Yapisal organizasyon**:

```
pages/
  login/
    ui/
      LoginPage.tsx
      RegisterPage.tsx
    model/
      registrationSchema.ts     # Zod dogrulama semasi
    index.ts

widgets/
  login-dialog/                 # Dialog bazli login icin
    ui/
      LoginDialog.tsx
    index.ts

features/
  auth/
    ui/
      AuthButton.tsx
    model/
      useAuth.ts
    api/
      login.ts
      logout.ts
    index.ts

entities/
  session/
    model/
      sessionStore.ts           # Token ve kullanici bilgisi
    index.ts

shared/
  api/
    auth.server.ts              # Oturum depolama (cookie)
    index.ts
```

**Token depolama stratejileri**:

1. **Cookie (Onerilen)**: Manuel token depolama veya isleme gerektirmez
2. **Shared katmaninda**: API istemcisi durumu tutar, token yenileme middleware olarak uygulanir
3. **Entities katmaninda**: Reaktif store icinde token ve kullanici nesnesi tutulur
4. **Pages/Widgets (Onerilmez)**: Uygulama geneli durum buralarda depolanmamali

**Dogrulama semasi ornegi (Zod)**:

```typescript
// pages/login/model/registrationSchema.ts
import { z } from "zod";

export const registrationSchema = z.object({
  email: z.string().email("Gecerli bir e-posta adresi girin"),
  password: z.string().min(8, "Sifre en az 8 karakter olmali"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Sifreler eslesmiyor",
  path: ["confirmPassword"],
});
```

### 8.4 Tip Yonetimi Ornekleri

**Utility tipleri**: `shared/lib` icine yerlestirilir veya `type-fest` gibi kutuphaneler kurulur.

**Is varligi tipleri**: Entity slice'larinin `model` segmentinde tanimlanir.

**DTO ve Mapper'lar**:

```typescript
// shared/api/songs.ts
interface SongDTO {
  id: number;
  title: string;
  disc_no: number;
  artist_ids: Array<number>;
}

interface Song {
  id: string;
  title: string;
  fullTitle: string;
  artistIds: Array<string>;
}

function adaptSongDTO(dto: SongDTO): Song {
  return {
    id: String(dto.id),
    title: dto.title,
    fullTitle: `${dto.disc_no} / ${dto.title}`,
    artistIds: dto.artist_ids.map(String),
  };
}

export function listSongs() {
  return fetch("/api/songs")
    .then(async (res) => (await res.json()).map(adaptSongDTO));
}
```

**Global tipler (Redux ornegi)**:

```typescript
// app/store/index.ts
import { combineReducers } from "redux";
import { songReducer } from "entities/song";
import { artistReducer } from "entities/artist";

const rootReducer = combineReducers({ songs: songReducer, artists: artistReducer });
const store = createStore(rootReducer);

// Global tip bildirimi
declare type RootState = ReturnType<typeof rootReducer>;
declare type AppDispatch = typeof store.dispatch;

// shared/store/index.ts
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 9. Cross-Import Sorunlari ve Cozumleri

### 9.1 Cross-Import Nedir?

Cross-import, **ayni katmandaki farkli slice'lar arasindaki import'tur**. Ornekler:
- `features/product` icinden `features/cart`'a import
- `widgets/sidebar` icinden `widgets/header`'a import

**Not**: `shared` ve `app` katmanlarinda slice yoktur, bu nedenle bu katmanlar icindeki import'lar cross-import sayilmaz.

### 9.2 Neden Cross-Import Sorunludur?

**1. Belirsiz Sahiplik**:
`cart`, `product`'tan import yaptiginda, paylasilan mantiga hangi slice'in "sahip" oldugu belirsizlesir.

**2. Azalan Izolasyon**:
`cart`'i test etmek artik `product`'in de kurulmasini gerektirir. Bir slice'daki degisiklikler digerinde beklenmeyen test basarizliklarina yol acabilir.

**3. Artan Bilissel Yuk**:
Bir slice uzerinde calismak, baska bir slice'in yapisini ve davranisini anlamayi gerektirir.

**4. Dongusal Bagimliliklar**:
Cross-import'lar genellikle tek yonlu baslar ancak cift yonlu hale gelebilir.

### 9.3 Cozum Stratejileri

#### Strateji A: Slice Birlestirme

Surekli cross-import yapan ve birlikte hareket eden iki slice'i birlestirin:

```
// Onceki
features/
  profile/
    ...
  profile-settings/
    ...

// Sonraki (birlestirilmis)
features/
  profile/
    ui/
      ProfileView.tsx
      ProfileSettings.tsx
    model/
      profileStore.ts
      settingsStore.ts
    index.ts
```

#### Strateji B: Domain Akislarini Entities'e Tasiyin

Paylasilan alan mantogini `entities` katmanina tasiyin:

```
// Onceki (cross-import)
features/cart -> features/auth import ediyor

// Sonraki
entities/
  session/
    model/
      sessionStore.ts    # Auth durumu burada
    index.ts

features/
  cart/
    ...  # entities/session'dan import yapar
  auth/
    ...  # entities/session'dan import yapar
```

#### Strateji C: Ust Katmanda Birlestirme (Composition)

Slice'lari ust katmanlarda (`pages`/`app`) Inversion of Control pattern'leri kullanarak bir araya getirin:

**React Render Props ile**:

```typescript
// features/commentList/ui/CommentList.tsx
interface CommentListProps {
  comments: Comment[];
  renderUserAvatar?: (userId: string) => React.ReactNode;
}

export function CommentList({ comments, renderUserAvatar }: CommentListProps) {
  return (
    <ul>
      {comments.map((comment) => (
        <li key={comment.id}>
          {renderUserAvatar?.(comment.userId)}
          <span>{comment.text}</span>
        </li>
      ))}
    </ul>
  );
}

// pages/PostPage.tsx (ust katmanda birlestirme)
import { CommentList } from "@/features/commentList";
import { UserAvatar } from "@/features/userProfile";

export function PostPage() {
  return (
    <CommentList
      comments={comments}
      renderUserAvatar={(userId) => <UserAvatar userId={userId} />}
    />
  );
}
```

**Vue Slots ile**:

```vue
<!-- features/commentList/ui/CommentList.vue -->
<template>
  <ul>
    <li v-for="comment in comments" :key="comment.id">
      <slot name="avatar" :userId="comment.userId" />
      <span>{{ comment.text }}</span>
    </li>
  </ul>
</template>

<!-- pages/PostPage.vue -->
<template>
  <CommentList :comments="comments">
    <template #avatar="{ userId }">
      <UserAvatar :userId="userId" />
    </template>
  </CommentList>
</template>
```

#### Strateji D: Yalnizca Public API Uzerinden

Feature'lar arasi yeniden kullanimi yalnizca acik Public API'ler araciligiyla saglayin:

```typescript
// features/auth/index.ts
export { useAuth } from "./model/useAuth";
export { AuthButton } from "./ui/AuthButton";

// features/profile/ui/ProfileMenu.tsx
import { useAuth, AuthButton } from "@/features/auth";
```

### 9.4 Uyari Isaretleri

Sorunlu cross-import'larin belirtileri:

- Baska bir slice'in store/model/is mantigina dogrudan bagimlilik
- Ic dosyalara derinlemesine import (public API'yi atlama)
- Cift yonlu bagimliliklar
- Bir slice'daki degisikliklerin sik sik digerini bozmassi
- Ayni katmanda cross-import'a zorlanan akislar (bunlar `pages`/`app`'te olmali)

### 9.5 Takim Baglami

Katillik proje turune baglidir:
- Erken asamadaki urunler hiz icin pragmatik olarak bazi cross-import'lari kabul edebilir
- Uzun omurlu veya duzenlemeye tabi sistemler daha kati sinirlardan faydalanir
- Takimlar zorlama seviyelerini belirlemeli ve cross-import eklendiginde nedenini belgelemeli

---

## 10. Naming Conventions

### 10.1 FSD Standart Terminolojisi

Metodoloji, gelistiricilerin tutarli sekilde kullanmasi gereken belirli terimler olusturur:

**Katman isimleri**: `app`, `processes`, `pages`, `widgets`, `features`, `entities`, `shared`

**Segment isimleri**: `ui`, `model`, `lib`, `api`, `config`

### 10.2 Isimlendirme Catismalari

FSD terminolojisi is alani diliyle cakistiginda sorunlar ortaya cikar:

| FSD Terimi | Olasi Is Alani Catismasi |
|------------|------------------------|
| `process` katmani | Is surecleri (business processes) |
| `page` katmani | Log sayfalari, urun sayfalari |
| `model` segmenti | Urun modelleri, makine ogrenimi modelleri |
| `feature` katmani | Urun ozellikleri (product features) |

### 10.3 Iletisim Onerileri

**Dahili takim tartismalari**: Metodoloji terimlerinin onune "FSD" ekleyin:
- "Bu sureci FSD features katmanina koyabiliriz"
- "FSD model segmentinde dogrulama semasi tanimlayalim"

**Teknik olmayan paydalar**: FSD terminolojisini sinirli tutun ve dahili kod yapisi ayrintilarin tartismayin.

### 10.4 Dosya ve Klasor Isimlendirme Kurallari

**Slice isimleri**: Kebab-case kullanin, is alanindan turetilmis isimler verin:
```
features/
  add-to-cart/
  search-products/
  toggle-favorite/
  write-comment/

entities/
  cart-item/
  user-profile/
  product/
```

**Segment isimleri**: Amac bazli, kucuk harf:
```
ui/
model/
api/
lib/
config/
```

**Bilesen dosyalari**: PascalCase:
```
ui/
  ProductCard.tsx
  UserAvatar.tsx
  LoginForm.tsx
```

**Fonksiyon/hook dosyalari**: camelCase:
```
model/
  useAuth.ts
  productStore.ts
api/
  getUser.ts
  listProducts.ts
lib/
  formatPrice.ts
  formatDate.ts
```

**Public API dosyasi**: Her zaman `index.ts`:
```
entities/user/index.ts
features/auth/index.ts
```

### 10.5 Kacinilmasi Gereken Isimlendirmeler

Segment seviyesinde:
- `components` -> `ui` kullanin
- `hooks` -> `model` veya `lib` kullanin
- `types` -> ilgili segmente dagitin
- `helpers` / `utils` -> `lib` kullanin
- `constants` -> `config` kullanin
- `containers` -> `ui` kullanin
- `modals` -> `ui` kullanin

Dosya seviyesinde:
- `types.ts` (genel) -> Ilgili dosyalara dagitin
- `utils.ts` (genel) -> Isleve gore bolun
- `helpers.ts` (genel) -> Isleve gore bolun
- `endpoints.ts` (genel) -> API fonksiyonlarina bolun

---

## 11. Alternatifler ve Karsilastirma

### 11.1 Big Ball of Mud (Buyuk Camur Topu)

Mimari bir anti-pattern. Belirli bir organizasyon olmadan buyuyen, zaman icinde bakimi zorlasan kod tabanlari.

**FSD bunu nasil cozer**: Katmanlar, slice'lar ve segment'ler araciligiyla net sinirlar olusturarak kodun "camur topu" haline gelmesini onler.

### 11.2 Smart & Dumb Components

Dan Abramov'un "Sunum ve Container Bilesenleri" yaklasimi. Artik resmi olarak kullanim disi (deprecated) olarak kabul edilmektedir.

**FSD pozisyonu**: FSD, bilesen rollerini katman ve segment yapisi icerisinde dogal olarak ayirir.

### 11.3 SOLID, GRASP, KISS, YAGNI

Tasarim prensipleri pratikte birlikte iyi calismazlar.

**FSD pozisyonu**: FSD, bu prensipleri tek bir tutarli metodoloji icerisinde bir araya getirir.

### 11.4 Domain-Driven Design (DDD)

**FSD pozisyonu**: DDD'nin uygulanabilirligini artirirken, alan odakli pratikleri benimser. Entities ve Features katmanlari, DDD'nin alan modeli kavramindan esinlenmistir.

### 11.5 Clean Architecture (Temiz Mimari)

**FSD pozisyonu**: Benzerlikler ve farkliliklar tasir. Her iki yaklasim da katmanli mimari ve bagimlilik yonu kurallarini kullanir.

### 11.6 Atomic Design

Atomic Design, bilesenleri 5 katmana ayirir:

| Atomic Design | FSD Karsiligi |
|---------------|--------------|
| Pages | Pages katmani |
| Templates | Widgets veya Pages icinde |
| Organisms | Widgets veya Features |
| Molecules | Shared/ui veya Entities/ui |
| Atoms | Shared/ui |

**Temel fark**: Atomic Design gorsel bilesenlere ve kompozisyonlarina yoneliktir. FSD ise uygulamanin islevselligini bagimsiz modullere bolmeye ve bunlarin iliskilerine odaklanir.

**Atomic Design'in temel sorunu**: Is mantigi icin net bir sorumluluk seviyesi saglamaz, bu da mantgin cesitli bilesenlere ve seviyelere dagitilmasina yol acar.

**FSD ile entegrasyon**: Atomic Design'in `atoms` ve `molecules` katmanlari FSD'nin `shared/ui` katmanina eslenebilir:

```
shared/
  ui/
    atoms/
      Button.tsx
      Input.tsx
      Icon.tsx
    molecules/
      SearchBar.tsx
      FormField.tsx
```

### 11.7 Feature-Driven Development

FSD'nin ilham kaynaklarindan biri. Uyumluluk ve tarihsel gelisim acisindan baglantilidir.

### 11.8 Karsilastirma Ozet Tablosu

| Ozellik | FSD | Atomic Design | Clean Architecture | DDD |
|---------|-----|---------------|-------------------|-----|
| Frontend odakli | Evet | Evet | Hayir (genel) | Hayir (genel) |
| Katmanli yapi | 7 katman | 5 katman | 4+ katman | Degisken |
| Is mantigi yeri | Net (features/entities) | Belirsiz | Net (use cases) | Net (domain) |
| Import kurallari | Kati (tek yon) | Gevşek | Kati (iceriden disariya) | Degisken |
| Framework bagimisiz | Evet | Evet | Evet | Evet |
| Migrasyon kolayligi | Kademeli | Kolay | Zor | Zor |
| Tooling destegi | Steiger linter | Yok | Yok | Degisken |

---

## Ek: Desegmentasyon Anti-Pattern'i

### Desegmentasyon Nedir?

Desegmentasyon (yatay dilimleme veya katmana gore paketleme), dosyalarin hizmet ettikleri is alanlari yerine **teknik rollerine** gore gruplandirilmasi pattern'idir.

### Anti-Pattern Yapisi

```
src/
  components/           # YANLIS: Teknik gruplama
    DeliveryCard.tsx
    RegionSelector.tsx
    UserProfile.tsx
  actions/
    deliveryActions.ts
    regionActions.ts
    userActions.ts
  stores/
    deliveryStore.ts
    regionStore.ts
    userStore.ts
```

### Sorunlar

1. **Dusuk Kohezyon**: Tek bir ozelligi degistirmek, kod tabani genelinde birden fazla buyuk klasoru duzenlemeyi gerektirir
2. **Siki Baglanti**: Beklenmeyen bilesen bagimliliklari karmasik, dolanmis zincirler olusturur
3. **Zor Refactoring**: Alana ozel kodu cikartinak buyuk manual caba gerektirir

### Dogru Yaklasim

```
pages/
  delivery/
    ui/
      DeliveryPage.tsx
      DeliveryCard.tsx
      DeliveryChoice.tsx
    model/
      deliveryStore.ts
    api/
      deliveryApi.ts
    index.ts
  region/
    ui/
      RegionPage.tsx
      RegionSelector.tsx
    model/
      regionStore.ts
    index.ts
```

---

## Ek: FSD CLI Araci

FSD, hizli baslangiclama icin CLI araci sunar:

```bash
# Sayfa slice'lari olusturma
npx fsd pages feed sign-in article-read --segments ui

# Entity slice'lari olusturma
npx fsd entities user product order --segments ui model api
```

---

## Ek: Steiger - Mimari Linter

[Steiger](https://github.com/feature-sliced/steiger), FSD uyumlulugunu zorlayan bir mimari linter'dir:

- Import kurallarinin dogrulanmasi
- Public API ihlallerinin tespiti
- Yanlis segment isimlendirmelerinin uyarisi
- Cross-import tespiti

---

## Sonuc

Feature-Sliced Design, frontend projelerinde:

1. **Net sinirlar** olusturarak kodun anlasilabilirligini arttirir
2. **Tek yonlu bagimlilik** kuraliyla dongusel bagimliliklari onler
3. **Kademeli benimseme** ile mevcut projelere uygulanabilir
4. **Framework bagimisiz** olup React, Vue, Angular, Svelte ve diger framework'lerle calisir
5. **Tooling destegi** (Steiger linter, FSD CLI) ile kurallarin uygulanmasini kolaylastirir

FSD'yi basariyla uygulamanin anahtari, katmanlar arasi import kuralina kesinlikle uymak, slice'lari is alanindan turetmek ve segment'leri amac bazli isimlendirmektir.

---

> **Kaynaklar**: Bu dokuman tamamen [feature-sliced.design](https://feature-sliced.design/) resmi dokumantasyonundan derlenmistir. En guncel bilgiler icin resmi web sitesini ziyaret edin.
