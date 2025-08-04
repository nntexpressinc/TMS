// Xavfsizlik utility funksiyalari

// Developer tools'ni aniqlash va oldini olish
export const detectDevTools = () => {
  const threshold = 160;
  
  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      document.body.innerHTML = `
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: Arial, sans-serif;
          background: #f5f5f5;
        ">
          <div style="
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          ">
            <h2 style="color: #e74c3c;">Xavfsizlik ogohlantirishi</h2>
            <p>Developer tools ochiq. Iltimos, ularni yoping va sahifani yangilang.</p>
            <button onclick="window.location.reload()" style="
              background: #3498db;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
            ">Sahifani yangilash</button>
          </div>
        </div>
      `;
    }
  };

  // F12 tugmasini o'chirish
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      return false;
    }
  });

  // Context menu'ni o'chirish
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // DevTools'ni muntazam tekshirish
  setInterval(checkDevTools, 1000);
  
  // Boshlang'ich tekshiruv
  checkDevTools();
};

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
export const initializeSecurity = () => {
  detectDevTools();
  disableConsole();
  
  // Sahifa yuklanganda xavfsizlik tekshiruvlari
  window.addEventListener('load', () => {
    // Qo'shimcha xavfsizlik tekshiruvlari
    if (window.outerHeight - window.innerHeight > 200) {
      window.location.href = '/security-warning';
    }
  });
}; 