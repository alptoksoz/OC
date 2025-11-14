# CarShare - Araba Paylaşım Platformu

Instagram tarzında, araba tutkunlarının arabalarını paylaşabileceği bir sosyal medya platformu.

## Özellikler

### Kullanıcı Yönetimi
- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Kullanıcı profil sayfaları
- ✅ Profil düzenleme (ad, kullanıcı adı, bio)
- ✅ Takip/Takipten Çıkma (Follow/Unfollow)
- ✅ Profil istatistikleri (Posts, Followers, Following)

### Araba Paylaşımı
- ✅ Araba fotoğrafı paylaşma (URL desteği)
- ✅ Marka, model ve yıl bilgileri
- ✅ Açıklama ve hashtag desteği
- ✅ Ana akış (Feed) ile tüm gönderileri görüntüleme
- ✅ Post silme (sadece sahip silebilir)

### Sosyal Özellikler
- ✅ Beğeni sistemi (Like/Unlike)
- ✅ Yorum yapabilme ve görüntüleme
- ✅ Gerçek zamanlı yorum ekleme
- ✅ Bookmark/Save sistemi
- ✅ Kaydedilen postları görüntüleme
- ✅ Kullanıcı profil linkleri

### Keşfet & Arama
- ✅ Arama fonksiyonu (marka, model, açıklama, hashtag)
- ✅ Arama sonuçları sayfası
- ✅ Keşfet sayfası
- ✅ Popüler kullanıcılar listesi
- ✅ Trending postlar (son 7 gün en çok beğenilen)
- ✅ En yeni postlar

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

### Profil Görüntüleme ve Takip
1. Herhangi bir kullanıcı adına tıklayın
2. Kullanıcının profilini, istatistiklerini ve paylaşımlarını görün
3. "Follow" butonuyla kullanıcıyı takip edin
4. "Following" butonu ile takipten çıkın

### Yorum Yapma
1. Bir post'un altındaki "View all X comments" butonuna tıklayın
2. Yorumları görüntüleyin
3. Alt kısımdaki input alanına yorumunuzu yazın
4. Gönder ikonuna tıklayın

### Arama
1. Üst menüdeki arama çubuğuna marka, model veya hashtag yazın
2. Enter'a basın
3. Sonuçları görüntüleyin

## Proje Yapısı

```
car-sharing-platform/
├── app/
│   ├── api/
│   │   ├── auth/                    # NextAuth endpoints
│   │   ├── register/                # Kayıt endpoint
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   ├── like/            # Like/Unlike endpoint
│   │   │   │   └── comments/        # Yorum endpoint
│   │   │   └── route.ts             # Post oluşturma
│   │   └── users/
│   │       └── [id]/follow/         # Takip endpoint
│   ├── login/                       # Giriş sayfası
│   ├── register/                    # Kayıt sayfası
│   ├── create/                      # Post oluşturma sayfası
│   ├── profile/[username]/          # Kullanıcı profil sayfası
│   ├── search/                      # Arama sayfası
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Ana sayfa (Feed)
├── components/
│   ├── auth/                        # Auth bileşenleri
│   ├── layout/                      # Navbar
│   ├── posts/                       # PostCard (like & comment)
│   ├── profile/                     # ProfileHeader
│   └── providers/                   # SessionProvider
├── lib/
│   ├── auth.ts                      # NextAuth config
│   └── prisma.ts                    # Prisma client
├── prisma/
│   └── schema.prisma                # Veritabanı şeması
└── types/
    └── index.ts                     # TypeScript tipleri
```

## Veritabanı Şeması

- **User** - Kullanıcı bilgileri (name, username, email, bio, etc.)
- **Post** - Araba paylaşımları (brand, model, year, images, hashtags)
- **Like** - Beğeniler
- **Comment** - Yorumlar
- **SavedPost** - Kaydedilen postlar
- **Follow** - Takip ilişkileri
- **Account** - NextAuth hesap bilgileri
- **Session** - Oturum bilgileri

## Gelecek Özellikler

- [ ] Gerçek dosya yükleme (Uploadthing/Cloudinary)
- [ ] Bildirimler sistemi
- [ ] Mesajlaşma sistemi
- [ ] Post düzenleme
- [ ] Yorum silme
- [ ] Dark mode
- [ ] Responsive mobile tasarım iyileştirmeleri
- [ ] Email verification
- [ ] Password reset
- [ ] Advanced filtering (by brand, year range, etc.)
- [ ] Infinite scroll
- [ ] Stories özelliği

## Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için lütfen önce bir issue açın.

## Lisans

MIT
