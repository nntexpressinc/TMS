# TMS Xavfsizlik Sozlamalari

## Qo'llanilgan xavfsizlik choralari

### 1. Source Map'larni o'chirish
- Production build'da `GENERATE_SOURCEMAP=false` sozlamasi qo'llanilgan
- Webpack konfiguratsiyasida `devtool: false` sozlamasi

### 2. Kod Obfuscation
- TerserPlugin orqali kodlarni minify qilish
- Console.log va debugger'larini o'chirish
- Kommentlarni olib tashlash

### 3. Developer Tools'ni himoyalash
- F12 tugmasini o'chirish
- Ctrl+Shift+I kombinatsiyasini bloklash
- Context menu'ni o'chirish
- Developer tools ochiqligini aniqlash

### 4. Xavfsizlik Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict referrer policy

### 5. HTTPS majburiy qilish
- Production'da HTTPS'ga yo'naltirish
- Localhost'da ruxsat berish

## Build qilish

```bash
# Development
npm start

# Production (xavfsizlik bilan)
npm run build
```

## Qo'shimcha xavfsizlik choralari

1. **Server-side xavfsizlik**: API endpoint'larini himoyalash
2. **Rate limiting**: So'rovlar sonini cheklash
3. **Input validation**: Foydalanuvchi kiritishlarini tekshirish
4. **Authentication**: Kuchli autentifikatsiya
5. **Authorization**: Ruxsatlar tizimini kuchaytirish

## Eslatma

Bu choralar frontend xavfsizligini kuchaytiradi, lekin to'liq xavfsizlik uchun backend xavfsizligi ham muhimdir. 