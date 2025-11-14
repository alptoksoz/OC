# CarShare - Araba Paylaşım Platformu

Instagram tarzında, araba tutkunlarının arabalarını paylaşabileceği bir sosyal medya platformu.

## Özellikler

- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Araba fotoğrafı paylaşma
- ✅ Beğeni sistemi
- ✅ Yorum yapabilme
- ✅ Kullanıcı profilleri
- ✅ Ana akış (Feed)
- ✅ Hashtag desteği
- ✅ Marka, model ve yıl bilgileri

## Teknoloji Stack

- **Frontend & Backend:** Next.js 15 (App Router)
- **Dil:** TypeScript
- **Styling:** Tailwind CSS
- **Veritabanı:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **UI Components:** Lucide React (Icons)

## Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd car-sharing-platform
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables

`.env` dosyasını oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/car_sharing_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

**NEXTAUTH_SECRET** oluşturmak için:
```bash
openssl rand -base64 32
```

### 4. PostgreSQL Veritabanı Kurulumu

#### Docker ile PostgreSQL (Önerilen)

```bash
docker run --name carshare-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=car_sharing_db \
  -p 5432:5432 \
  -d postgres:15
```

#### Yerel PostgreSQL

PostgreSQL kurulumundan sonra veritabanı oluşturun:

```bash
createdb car_sharing_db
```

### 5. Prisma Migration

```bash
npx prisma generate
npx prisma db push
```

### 6. Uygulamayı Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Kullanım

### Kayıt Olma
1. [http://localhost:3000/register](http://localhost:3000/register) adresine gidin
2. Ad, kullanıcı adı, email ve şifre bilgilerini girin
3. "Sign Up" butonuna tıklayın

### Giriş Yapma
1. [http://localhost:3000/login](http://localhost:3000/login) adresine gidin
2. Email ve şifrenizi girin
3. "Sign In" butonuna tıklayın

### Araba Paylaşma
1. Giriş yaptıktan sonra üst menüden "+" ikonuna tıklayın
2. Araba marka, model ve yıl bilgilerini girin
3. Açıklama ve hashtag ekleyin
4. Resim URL'leri ekleyin (virgülle ayrılmış)
5. "Share Post" butonuna tıklayın

## Proje Yapısı

```
car-sharing-platform/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── register/       # Kayıt endpoint
│   │   └── posts/          # Post CRUD endpoints
│   ├── login/              # Giriş sayfası
│   ├── register/           # Kayıt sayfası
│   ├── create/             # Post oluşturma sayfası
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Ana sayfa (Feed)
├── components/
│   ├── auth/               # Auth bileşenleri
│   ├── layout/             # Layout bileşenleri (Navbar)
│   ├── posts/              # Post bileşenleri
│   └── providers/          # Context providers
├── lib/
│   ├── auth.ts             # NextAuth config
│   └── prisma.ts           # Prisma client
├── prisma/
│   └── schema.prisma       # Veritabanı şeması
└── types/
    └── index.ts            # TypeScript tipleri
```

## Veritabanı Şeması

- **User** - Kullanıcı bilgileri
- **Post** - Araba paylaşımları
- **Like** - Beğeniler
- **Comment** - Yorumlar
- **Follow** - Takip ilişkileri
- **Account** - NextAuth hesap bilgileri
- **Session** - Oturum bilgileri

## Gelecek Özellikler

- [ ] Profil sayfası
- [ ] Kullanıcı takip sistemi
- [ ] Gerçek dosya yükleme (Uploadthing/Cloudinary)
- [ ] Yorum gösterme ve ekleme
- [ ] Arama ve filtreleme
- [ ] Keşfet sayfası
- [ ] Bildirimler
- [ ] Mesajlaşma sistemi

## Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için lütfen önce bir issue açın.

## Lisans

MIT
