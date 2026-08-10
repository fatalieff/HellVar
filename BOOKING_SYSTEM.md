# UstaTap — Sifariş (Booking) Sistemi

Bu sənəd UstaTap platforması üçün sifariş/rezervasiya sisteminin tam dizaynını izah edir.

---

## 1. Cari vəziyyət

Layihədə hazırda iki ayrı sistem var:

- **service_requests (elan taxtası)** — müştərinin yazdığı ehtiyac (kateqoriya, təsvir, büdcə). Bütün ustalar görüb qəbul/redd edə bilir.
  - **Yarımçıqdır:** `service_requests` üçün **insert (yazma) tərəfi yoxdur** — müştəri sorğu yarada bilmir.
  - Yalnız usta tərəfi var: oxuma (`provider-dashboard-client.tsx:31`), qəbul/redd (`:78`).
  - Migration faylı yoxdur — cədvəl yəqin ki Supabase SQL Editor-da əl ilə yaradılıb.
- **chat + notifications** — realtime mesajlaşma və bildirişlər tam işləkdir.

**Yeni sistem:** `service_requests`-ə toxunmadan, tam ayrı **`bookings`** cədvəli üzərində qurulacaq.

---

## 2. Məqsəd

Müştəri **konkret bir ustadan** tarix + saat seçib **sifariş verə** bilməlidir. Usta sifarişi **qəbul/redd** edir, iş bitdikdə **tamamlayır**. Bütün proses realtime yenilənir və tərəflərə bildiriş gedir.

---

## 3. İş axını (status maşını)

```
                    ┌─────────────────────────────┐
                    │  müştəri "Sifariş ver" düyməsi  │
                    └──────────────┬──────────────┘
                                   ▼
                              ┌────────────┐
                              │  PENDING   │  ← sifariş ustaya düşür
                              └─────┬──────┘
                  ┌───────────────┬──┴───────────┬───────────────┐
                  ▼               ▼              ▼               ▼
             ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐
             │ ACCEPTED │   │ REJECTED │   │ CANCELLED  │   │          │
             │ (qəbul)  │   │ (redd)   │   │ (müştəri   │   │          │
             └─────┬────┘   └──────────┘   │  ləğv edib) │   │          │
                   │                        └────────────┘   │          │
                   ▼                                        ▼
            ┌──────────┐                              ┌──────────┐
            │ COMPLETED│  ← usta "tamamlandı" etdi   │ EXPIRED  │
            │ (bitdi)  │                              │ (vaxtı   │
            └──────────┘                              │  keçdi,  │
                                                      │  müştəri │
                                                      │  cavab   │
                                                      │  vermədi)│
                                                      └──────────┘
```

| Status | Nə deməkdir | Kim dəyişir |
|---|---|---|
| `PENDING` | Yeni sifariş, ustaya gözükmür | Müştəri yaradır |
| `ACCEPTED` | Usta qəbul etdi | Usta |
| `REJECTED` | Usta redd etdi | Usta |
| `CANCELLED` | Müştəri ləğv etdi (yalnız PENDING/ACCEPTED ikən) | Müştəri |
| `COMPLETED` | İş tamamlandı | Usta |
| `EXPIRED` | PENDING sifariş 24 saat cavabsız qaldı (avtomatik) | DB trigger / cron |

---

## 4. DB struktur

### 4.1 Cədvəl `bookings`

```sql
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  service text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60
    check (duration_minutes in (30, 60, 90, 120, 180, 240)),
  price_offer numeric(10, 2) not null check (price_offer >= 0),
  address text,
  customer_note text check (customer_note is null or char_length(trim(customer_note)) <= 500),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bookings_customer_not_provider check (customer_id <> provider_id),
  constraint bookings_scheduled_in_future check (scheduled_at > timezone('utc', now()))
);
```

### 4.2 Index-lər

```sql
create index bookings_provider_status_idx on public.bookings (provider_id, status, scheduled_at);
create index bookings_customer_status_idx on public.bookings (customer_id, status, scheduled_at);
create index bookings_scheduled_at_idx on public.bookings (scheduled_at);
```

### 4.3 Status dəyişmə qaydaları (trigger)

- `updated_at` avtomatik yenilənir (reviews-dakı kimi).
- Status keçidləri trigger ilə qorunur:
  - `PENDING → ACCEPTED | REJECTED | CANCELLED | EXPIRED`
  - `ACCEPTED → COMPLETED | CANCELLED`
  - `REJECTED / COMPLETED / EXPIRED →` (final — dəyişdirilə bilməz)
  - Yalnız qanuni keçidlərə icazə verilir.

### 4.4 `completed_jobs` artımı

İlk dəfə status `COMPLETED` olduqda ustanın `provider_details.completed_jobs` dəyəri avtomatik +1 artırılır (trigger ilə).

---

## 5. Təhlükəsizlik (RLS)

| Əməliyyat | Kim | Qayda |
|---|---|---|
| SELECT | Müştəri | yalnız `customer_id = auth.uid()` |
| SELECT | Usta | yalnız `provider_id = auth.uid()` |
| INSERT | Müştəri | `customer_id = auth.uid()` və rol `CUSTOMER` |
| UPDATE | Müştəri | yalnız öz sifarişi + yalnız `CANCELLED` üçün |
| UPDATE | Usta | yalnız öz sifarişi + yalnız `ACCEPTED/REJECTED/COMPLETED` üçün |
| DELETE | Heç kim | tarix arxiv kimi saxlanılır |

---

## 6. Realtime

```sql
alter publication supabase_realtime add table public.bookings;
```

- Usta paneli `bookings` dəyişikliklərini realtime dinləyir → yeni sifariş **anında** görünür.
- Müştərinin "Sifarişlərim" səhifəsi də realtime yenilənir.

---

## 7. Bildirişlər

Mövcud `notifications` cədvəlindən istifadə edilir. `NotificationType` genişlənir.

| Hadisə | Alıcı | Tip |
|---|---|---|
| Yeni sifariş yarandı | Usta | `new_booking` |
| Usta sifarişi qəbul etdi | Müştəri | `booking_accepted` |
| Usta sifarişi redd etdi | Müştəri | `booking_rejected` |
| Usta sifarişi tamamladı | Müştəri | `booking_completed` |
| Müştəri sifarişi ləğv etdi | Usta | `booking_cancelled` |

Bildiriş yaradılması DB trigger + `security definer` funksiyası ilə edilir (çünki usta başqa istifadəçiyə bildiriş yaza bilməz — RLS buna mane olur).

---

## 8. UI səhifələri

### 8.1 Müştəri tərəfi

1. **Usta profili / popup** (`provider-profile-dialog.tsx`): yeni **"Sifariş ver"** düyməsi.
2. **Booking dialoqu** (`components/booking/booking-dialog.tsx`):
   - Xidmət adı (input)
   - Tarix seçimi (növbəti 14 gün)
   - Saat seçimi (09:00–21:00, 30 dəq interval)
   - Müddət (30/60/90/120 dəq)
   - Qiymət təklifi (₼) — ustanın `price_min`/`price_max` aralığına uyğun
   - Ünvan + əlavə qeyd
   - Göndər → `PENDING`
3. **"Sifarişlərim" səhifəsi** (`/bookings`):
   - Aktiv / tamamlanmış / ləğv olunmuş tablar
   - Status nişanları, tarix-saat, qiymət
   - Ləğv et düyməsi (PENDING/ACCEPTED ikən)
   - Usta ilə çata keçid

### 8.2 Usta tərəfi

1. **Panel** (`provider-dashboard-client.tsx`): yeni **"Sifarişlər"** tabı
   - Gələn (PENDING): Qəbul / Redd
   - Aktiv (ACCEPTED): Tamamla
   - Tamamlanmış / Ləğv edilmiş: keçmiş siyahı
   - Müştəri ilə çata keçid
2. Hər sifariş kartında: xidmət, tarix+saat (yerli vaxta çevrilir), müddət, qiymət, ünvan, qeyd, müştəri adı.

### 8.3 i18n

Bütün mətnlər 3 dildə (az/en/tr) `lib/i18n/dictionaries.ts`-ə əlavə olunur: `bookings` bölməsi.

---

## 9. Tip tərifləri (`lib/types/database.ts`)

```ts
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';

export type Booking = {
  id: string;
  customer_id: string;
  provider_id: string;
  service: string;
  scheduled_at: string;
  duration_minutes: number;
  price_offer: number;
  address?: string | null;
  customer_note?: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
};
```

`Database` interfaysinə `bookings` cədvəli əlavə olunur. `NotificationType` genişlənir:

```ts
export type NotificationType =
  | 'new_message' | 'new_review' | 'review_reply' | 'system'
  | 'new_booking' | 'booking_accepted' | 'booking_rejected'
  | 'booking_completed' | 'booking_cancelled';
```

---

## 10. Faza planı

### Faza 1 — MVP (hazırda təsdiqlənir)

- [x] Bu dizayn sənədi
- [ ] Migration: `bookings` cədvəli + index + RLS + triggerlər + realtime + notification triggerləri
- [ ] Tip tərifləri (`Booking`, `BookingStatus`, `NotificationType`)
- [ ] Müştəri: "Sifariş ver" dialoqu + usta profilinə əlaqə
- [ ] Müştəri: `/bookings` səhifəsi (statuslar + ləğv)
- [ ] Usta: paneldə "Sifarişlər" tabı (qəbul/redd/tamamla)
- [ ] Bildirişlər (5 hal)
- [ ] i18n (az/en/tr)
- [ ] Yoxlama: `tsc`, `next build`, manual test

### Faza 2 — İş saatları və təqvim

- [ ] `provider_availability` cədvəli: ustanın əlçatan gün/saatları
- [ ] Müştəri yalnız boş vaxtları görür
- [ ] Üst-üstə düşən sifarişlər avtomatik rədd olunur
- [ ] Usta panelində həftəlik təqvim

### Faza 3 — Ödəniş

- [ ] Kartla depozit/öncədən ödəniş
- [ ] Pulun iş bitənə qədər saxlanması (escrow)
- [ ] Tamamlanandan sonra ustanın hesabına keçir
- [ ] Faktura/çek

---

## 11. Qeyd

- Mövcud `service_requests` (elan taxtası) **dəyişdirilmir**. Booking sistemi ayrıca işləyir.
- Faza 1 ilk təsdiqdən sonra yaradılır. Faza 2 və 3 istifadəçi istədikdə əlavə olunur.
