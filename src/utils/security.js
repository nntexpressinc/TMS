// Xavfsizlik utility funksiyalari

// Developer tools'ni aniqlash va oldini olish




// Kod obfuscation uchun utility
export const obfuscateCode = (code) => {
  // Oddiy obfuscation - haqiqiy obfuscation uchun maxsus kutubxonalar kerak
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Kommentlarni o'chirish
    .replace(/\/\/.*$/gm, '') // Bir qatorli kommentlarni o'chirish
    .replace(/\s+/g, ' ') // Ortiqcha bo'shliqlarni olib tashlash
    .trim();
};

// Console'ni o'chirish
export const disableConsole = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};
  }
};

// Xavfsizlik sozlamalarini ishga tushirish
