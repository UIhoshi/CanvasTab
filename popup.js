// 全局状态管理
// HTML 字符转义辅助函数，防止 XSS 注入漏洞
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const SVGS = {
  folder: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  star: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  empty: `<svg class="svg-icon" style="width:48px;height:48px;opacity:0.45;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`
};

let allFolders = [];
let activeFolderId = null;
let bookmarksCache = {}; // 缓存各文件夹下的书签

const i18n = {
  "en": {
    "appName": "Bookmarks",
    "openDashboard": "Open CanvasTab",
    "searchPlaceholder": "Search bookmarks or links...",
    "loadingFolders": "Loading folders...",
    "allBookmarks": "All Bookmarks",
    "bookmarkBar": "Bookmark Bar",
    "otherBookmarks": "Other Bookmarks",
    "untitledFolder": "Folder",
    "emptyState": "This folder is empty~",
    "untitledBookmark": "No Title",
    "unknownFolder": "Unknown Folder",
    "searchResult": "Search results: \"{query}\""
  },
  "zh-CN": {
    "appName": "书签",
    "openDashboard": "打开 CanvasTab",
    "searchPlaceholder": "搜索书签或链接...",
    "loadingFolders": "加载文件夹中...",
    "allBookmarks": "所有书签",
    "bookmarkBar": "书签栏",
    "otherBookmarks": "其他书签",
    "untitledFolder": "未命名文件夹",
    "emptyState": "这个文件夹空空如也~",
    "untitledBookmark": "无标题",
    "unknownFolder": "未知目录",
    "searchResult": "搜索结果: \"{query}\""
  },
  "zh-TW": {
    "appName": "書籤",
    "openDashboard": "打開 CanvasTab",
    "searchPlaceholder": "搜尋書籤或連結...",
    "loadingFolders": "載入資料夾中...",
    "allBookmarks": "所有書籤",
    "bookmarkBar": "書籤欄",
    "otherBookmarks": "其他書籤",
    "untitledFolder": "未命名資料夾",
    "emptyState": "這個資料夾空空如也~",
    "untitledBookmark": "無標題",
    "unknownFolder": "未知目錄",
    "searchResult": "搜尋結果: \"{query}\""
  },
  "es": {
    "appName": "Marcadores",
    "openDashboard": "Abrir CanvasTab",
    "searchPlaceholder": "Buscar marcadores o enlaces...",
    "loadingFolders": "Cargando carpetas...",
    "allBookmarks": "Todos los marcadores",
    "bookmarkBar": "Barra de marcadores",
    "otherBookmarks": "Otros marcadores",
    "untitledFolder": "Nueva carpeta",
    "emptyState": "Esta carpeta está vacía~",
    "untitledBookmark": "Sin título",
    "unknownFolder": "Carpeta desconocida",
    "searchResult": "Resultados de búsqueda: \"{query}\""
  },
  "ja": {
    "appName": "ブックマーク",
    "openDashboard": "CanvasTab を開く",
    "searchPlaceholder": "ブックマークやリンクを検索...",
    "loadingFolders": "フォルダを読み込み中...",
    "allBookmarks": "すべてのブックマーク",
    "bookmarkBar": "ブックマークバー",
    "otherBookmarks": "その他のブックマーク",
    "untitledFolder": "新規フォルダ",
    "emptyState": "このフォルダは空です~",
    "untitledBookmark": "無題",
    "unknownFolder": "不明なフォルダ",
    "searchResult": "検索結果: \"{query}\""
  },
  "ko": {
    "appName": "북마크",
    "openDashboard": "CanvasTab 열기",
    "searchPlaceholder": "북마크 또는 링크 검색...",
    "loadingFolders": "폴더 로드 중...",
    "allBookmarks": "모든 북마크",
    "bookmarkBar": "북마크바",
    "otherBookmarks": "기타 북마크",
    "untitledFolder": "새 폴더",
    "emptyState": "이 폴더는 비어 있습니다~",
    "untitledBookmark": "제목 없음",
    "unknownFolder": "알 수 없는 폴더",
    "searchResult": "검색 결과: \"{query}\""
  },
  "fr": {
    "appName": "Signets",
    "openDashboard": "Ouvrir CanvasTab",
    "searchPlaceholder": "Rechercher des favoris...",
    "loadingFolders": "Chargement des dossiers...",
    "allBookmarks": "Tous les signets",
    "bookmarkBar": "Barre de favoris",
    "otherBookmarks": "Autres favoris",
    "untitledFolder": "Nouveau dossier",
    "emptyState": "Ce dossier est vide~",
    "untitledBookmark": "Sans titre",
    "unknownFolder": "Dossier inconnu",
    "searchResult": "Résultats de recherche: \"{query}\""
  },
  "de": {
    "appName": "Lesezeichen",
    "openDashboard": "CanvasTab Öffnen",
    "searchPlaceholder": "Lesezeichen oder Links suchen...",
    "loadingFolders": "Ordner werden geladen...",
    "allBookmarks": "Alle Lesezeichen",
    "bookmarkBar": "Lesezeichenleiste",
    "otherBookmarks": "Andere Lesezeichen",
    "untitledFolder": "Neuer Ordner",
    "emptyState": "Dieser Ordner ist leer~",
    "untitledBookmark": "Unbenannt",
    "unknownFolder": "Unbekannter Ordner",
    "searchResult": "Suchergebnisse: \"{query}\""
  },
  "it": {
    "appName": "Segnalibri",
    "openDashboard": "Apri CanvasTab",
    "searchPlaceholder": "Cerca segnalibri o collegamenti...",
    "loadingFolders": "Caricamento cartelle...",
    "allBookmarks": "Tutti i segnalibri",
    "bookmarkBar": "Barra dei segnalibri",
    "otherBookmarks": "Altri segnalibri",
    "untitledFolder": "Nuova cartella",
    "emptyState": "Questa cartella è vuota~",
    "untitledBookmark": "Senza titolo",
    "unknownFolder": "Cartella sconosciuta",
    "searchResult": "Risultati della ricerca: \"{query}\""
  },
  "ru": {
    "appName": "Закладки",
    "openDashboard": "Открыть CanvasTab",
    "searchPlaceholder": "Поиск закладок или ссылок...",
    "loadingFolders": "Загрузка папок...",
    "allBookmarks": "Все закладки",
    "bookmarkBar": "Панель закладок",
    "otherBookmarks": "Другие закладки",
    "untitledFolder": "Новая папка",
    "emptyState": "Эта папка пуста~",
    "untitledBookmark": "Без названия",
    "unknownFolder": "Неизвестная папка",
    "searchResult": "Результаты поиска: \"{query}\""
  },
  "pt": {
    "appName": "Favoritos",
    "openDashboard": "Abrir CanvasTab",
    "searchPlaceholder": "Pesquisar favoritos ou links...",
    "loadingFolders": "Carregando pastas...",
    "allBookmarks": "Todos os favoritos",
    "bookmarkBar": "Barra de favoritos",
    "otherBookmarks": "Outros favoritos",
    "untitledFolder": "Nova pasta",
    "emptyState": "Esta pasta está vazia~",
    "untitledBookmark": "Sem título",
    "unknownFolder": "Pasta desconhecida",
    "searchResult": "Resultados da pesquisa: \"{query}\""
  },
  "nl": {
    "appName": "Bladwijzers",
    "openDashboard": "CanvasTab Openen",
    "searchPlaceholder": "Zoek bladwijzers of links...",
    "loadingFolders": "Mappen laden...",
    "allBookmarks": "Alle bladwijzers",
    "bookmarkBar": "Bladwijzerbalk",
    "otherBookmarks": "Andere bladwijzers",
    "untitledFolder": "Nieuwe map",
    "emptyState": "Deze map is leeg~",
    "untitledBookmark": "Naamloos",
    "unknownFolder": "Onbekende map",
    "searchResult": "Zoekresultaten: \"{query}\""
  },
  "pl": {
    "appName": "Zakładki",
    "openDashboard": "Otwórz CanvasTab",
    "searchPlaceholder": "Szukaj zakładek lub linków...",
    "loadingFolders": "Ładowanie folderów...",
    "allBookmarks": "Wszystkie zakładki",
    "bookmarkBar": "Pasek zakładek",
    "otherBookmarks": "Inne zakładki",
    "untitledFolder": "Nowy folder",
    "emptyState": "Ten folder jest pusty~",
    "untitledBookmark": "Bez tytułu",
    "unknownFolder": "Nieznany folder",
    "searchResult": "Wyniki wyszukiwania: \"{query}\""
  },
  "tr": {
    "appName": "Yer İmleri",
    "openDashboard": "CanvasTab'ı Aç",
    "searchPlaceholder": "Yer imlerinde veya bağlantılarda ara...",
    "loadingFolders": "Klasörler yükleniyor...",
    "allBookmarks": "Tüm Yer İmleri",
    "bookmarkBar": "Yer İmleri Çubuğu",
    "otherBookmarks": "Diğer Yer İmleri",
    "untitledFolder": "Yeni Klasör",
    "emptyState": "Bu klasör boş~",
    "untitledBookmark": "Başlıksız",
    "unknownFolder": "Bilinmeyen Klasör",
    "searchResult": "Arama sonuçları: \"{query}\""
  },
  "ar": {
    "appName": "الإشارات المرجعية",
    "openDashboard": "افتح CanvasTab",
    "searchPlaceholder": "البحث عن الإشارات المرجعية أو الروابط...",
    "loadingFolders": "جاري تحميل المجلدات...",
    "allBookmarks": "جميع الإشارات المرجعية",
    "bookmarkBar": "شريط الإشارات المرجعية",
    "otherBookmarks": "إشارات مرجعية أخرى",
    "untitledFolder": "مجلد جديد",
    "emptyState": "هذا المجلد فارغ~",
    "untitledBookmark": "بلا عنوان",
    "unknownFolder": "مجلد غير معروف",
    "searchResult": "نتائج البحث عن: \"{query}\""
  },
  "hi": {
    "appName": "बुकमार्क",
    "openDashboard": "CanvasTab खोलें",
    "searchPlaceholder": "बुकमार्क या लिंक खोजें...",
    "loadingFolders": "फ़ोल्डर लोड हो रहे हैं...",
    "allBookmarks": "सभी बुकमार्क",
    "bookmarkBar": "बुकमार्क पट्टी",
    "otherBookmarks": "अन्य बुकमार्क",
    "untitledFolder": "नया फ़ोल्डर",
    "emptyState": "यह फ़ोल्डर खाली है~",
    "untitledBookmark": "बिना शीर्षक",
    "unknownFolder": "अज्ञात फ़ोल्डर",
    "searchResult": "खोज परिणाम: \"{query}\""
  },
  "th": {
    "appName": "บุ๊กมาร์ก",
    "openDashboard": "เปิด CanvasTab",
    "searchPlaceholder": "ค้นหาบุ๊กมาร์กหรือลิงก์...",
    "loadingFolders": "กำลังโหลดโฟลเดอร์...",
    "allBookmarks": "บุ๊กมาร์กทั้งหมด",
    "bookmarkBar": "แถบบุ๊กมาร์ก",
    "otherBookmarks": "บุ๊กมาร์กอื่น ๆ",
    "untitledFolder": "โฟลเดอร์ใหม่",
    "emptyState": "โฟลเดอร์นี้ว่างเปล่า~",
    "untitledBookmark": "ไม่มีชื่อ",
    "unknownFolder": "โฟลเดอร์ที่ไม่รู้จัก",
    "searchResult": "ผลการค้นหาสำหรับ: \"{query}\""
  },
  "vi": {
    "appName": "Dấu trang",
    "openDashboard": "Mở CanvasTab",
    "searchPlaceholder": "Tìm kiếm dấu trang hoặc liên kết...",
    "loadingFolders": "Đang tải thư mục...",
    "allBookmarks": "Tất cả dấu trang",
    "bookmarkBar": "Thanh dấu trang",
    "otherBookmarks": "Dấu trang khác",
    "untitledFolder": "Thư mục mới",
    "emptyState": "Thư mục này trống~",
    "untitledBookmark": "Không có tiêu đề",
    "unknownFolder": "Thư mục không xác định",
    "searchResult": "Kết quả tìm kiếm: \"{query}\""
  },
  "id": {
    "appName": "Markah",
    "openDashboard": "Buka CanvasTab",
    "searchPlaceholder": "Cari markah atau tautan...",
    "loadingFolders": "Memuat folder...",
    "allBookmarks": "Semua Markah",
    "bookmarkBar": "Bilah Markah",
    "otherBookmarks": "Markah Lainnya",
    "untitledFolder": "Folder Baru",
    "emptyState": "Folder ini kosong~",
    "untitledBookmark": "Tanpa Judul",
    "unknownFolder": "Folder Tidak Dikenal",
    "searchResult": "Hasil pencarian: \"{query}\""
  },
  "ms": {
    "appName": "Penanda Buku",
    "openDashboard": "Buka CanvasTab",
    "searchPlaceholder": "Cari penanda buku atau pautan...",
    "loadingFolders": "Memuatkan folder...",
    "allBookmarks": "Semua Penanda Buku",
    "bookmarkBar": "Bilah Penanda Buku",
    "otherBookmarks": "Penanda Buku Lain",
    "untitledFolder": "Folder Baru",
    "emptyState": "Folder ini kosong~",
    "untitledBookmark": "Tiada Tajuk",
    "unknownFolder": "Folder Tidak Diketahui",
    "searchResult": "Hasil carian: \"{query}\""
  },
  "sv": {
    "appName": "Bokmärken",
    "openDashboard": "Öppna CanvasTab",
    "searchPlaceholder": "Sök efter bokmärken eller länkar...",
    "loadingFolders": "Laddar mappar...",
    "allBookmarks": "Alla bokmärken",
    "bookmarkBar": "Bokmärkesfältet",
    "otherBookmarks": "Andra bokmärken",
    "untitledFolder": "Ny mapp",
    "emptyState": "Den här mappen är tom~",
    "untitledBookmark": "Namnlös",
    "unknownFolder": "Okänd mapp",
    "searchResult": "Sökresultat: \"{query}\""
  },
  "no": {
    "appName": "Bokmerker",
    "openDashboard": "Åpne CanvasTab",
    "searchPlaceholder": "Søk etter bokmerker eller lenker...",
    "loadingFolders": "Laster mapper...",
    "allBookmarks": "Alle bokmerker",
    "bookmarkBar": "Bokmerkelinje",
    "otherBookmarks": "Andre bokmerker",
    "untitledFolder": "Ny mappe",
    "emptyState": "Denne mappen er tom~",
    "untitledBookmark": "Uten tittel",
    "unknownFolder": "Ukjent mappe",
    "searchResult": "Søkeresultater: \"{query}\""
  },
  "da": {
    "appName": "Bogmærker",
    "openDashboard": "Åbn CanvasTab",
    "searchPlaceholder": "Søg i bogmærker eller links...",
    "loadingFolders": "Indlæser mapper...",
    "allBookmarks": "Alle bogmærker",
    "bookmarkBar": "Bogmærkelinje",
    "otherBookmarks": "Andre bogmærker",
    "untitledFolder": "Ny mappe",
    "emptyState": "Denne mappe er tom~",
    "untitledBookmark": "Uden titel",
    "unknownFolder": "Ukendt mappe",
    "searchResult": "Søgeresultater: \"{query}\""
  },
  "fi": {
    "appName": "Kirjanmerkit",
    "openDashboard": "Avaa CanvasTab",
    "searchPlaceholder": "Etsi kirjanmerkkejä tai linkkejä...",
    "loadingFolders": "Ladataan kansioita...",
    "allBookmarks": "Kaikki kirjanmerkit",
    "bookmarkBar": "Kirjanmerkkipalkki",
    "otherBookmarks": "Muut kirjanmerkit",
    "untitledFolder": "Uusi kansio",
    "emptyState": "Tämä kansio on tyhjä~",
    "untitledBookmark": "Nimetön",
    "unknownFolder": "Tuntematon kansio",
    "searchResult": "Hakutulokset: \"{query}\""
  },
  "cs": {
    "appName": "Záložky",
    "openDashboard": "Otevřít CanvasTab",
    "searchPlaceholder": "Hledat záložky nebo odkazy...",
    "loadingFolders": "Načítání složek...",
    "allBookmarks": "Všechny záložky",
    "bookmarkBar": "Lišta záložek",
    "otherBookmarks": "Ostatní záložky",
    "untitledFolder": "Nová složka",
    "emptyState": "Tato složka je prázdná~",
    "untitledBookmark": "Bez názvu",
    "unknownFolder": "Neznámá složka",
    "searchResult": "Výsledky vyhledávání: \"{query}\""
  },
  "el": {
    "appName": "Σελιδοδείκτες",
    "openDashboard": "Άνοιγμα CanvasTab",
    "searchPlaceholder": "Αναζήτηση σελιδοδεικτών ή συνδέσμων...",
    "loadingFolders": "Φόρτωση φακέλων...",
    "allBookmarks": "Όλοι οι σελιδοδείκτες",
    "bookmarkBar": "Γραμμή σελιδοδεικτών",
    "otherBookmarks": "Άλλοι σελιδοδείκτες",
    "untitledFolder": "Νέος φάκελος",
    "emptyState": "Αυτός ο φάκελος είναι άδειος~",
    "untitledBookmark": "Χωρίς τίτλο",
    "unknownFolder": "Άγνωστος φάκελος",
    "searchResult": "Αποτελέσματα αναζήτησης: \"{query}\""
  },
  "he": {
    "appName": "סימניות",
    "openDashboard": "פתח את CanvasTab",
    "searchPlaceholder": "חיפוש סימניות או קישורים...",
    "loadingFolders": "טוען תיקיות...",
    "allBookmarks": "כל הסימניות",
    "bookmarkBar": "סרגל הסימניות",
    "otherBookmarks": "סיมניות אחרות",
    "untitledFolder": "תיקייה חדשה",
    "emptyState": "תיקייה זו ריקה~",
    "untitledBookmark": "ללא כותרת",
    "unknownFolder": "תיקייה לא ידועה",
    "searchResult": "תוצאות חיפوش עבור: \"{query}\""
  },
  "hu": {
    "appName": "Könyvjelzők",
    "openDashboard": "CanvasTab megnyitása",
    "searchPlaceholder": "Könyvjelzők vagy linkek keresése...",
    "loadingFolders": "Mappák betöltése...",
    "allBookmarks": "Összes könyvjelző",
    "bookmarkBar": "Könyvjelzősáv",
    "otherBookmarks": "Egyéb könyvjelzők",
    "untitledFolder": "Új mappa",
    "emptyState": "Ez a mappa üres~",
    "untitledBookmark": "Névtelen",
    "unknownFolder": "Ismeretlen mappa",
    "searchResult": "Keresési eredmények: \"{query}\""
  },
  "ro": {
    "appName": "Semne de carte",
    "openDashboard": "Deschide CanvasTab",
    "searchPlaceholder": "Caută semne de carte sau linkuri...",
    "loadingFolders": "Se încarcă dosarele...",
    "allBookmarks": "Toate semnele de carte",
    "bookmarkBar": "Bara de semne de carte",
    "otherBookmarks": "Alte semne de carte",
    "untitledFolder": "Dosar nou",
    "emptyState": "Acest dosar este gol~",
    "untitledBookmark": "Fără titlu",
    "unknownFolder": "Dosar necunoscut",
    "searchResult": "Rezultatele căutării: \"{query}\""
  },
  "uk": {
    "appName": "Закладки",
    "openDashboard": "Відкрити CanvasTab",
    "searchPlaceholder": "Пошук закладок або посилань...",
    "loadingFolders": "Завантаження папок...",
    "allBookmarks": "Усі закладки",
    "bookmarkBar": "Панель закладок",
    "otherBookmarks": "Інші закладки",
    "untitledFolder": "Нова папка",
    "emptyState": "Ця папка порожня~",
    "untitledBookmark": "Без назви",
    "unknownFolder": "Невідома папка",
    "searchResult": "Результати пошуку: \"{query}\""
  }
};

let currentLang = 'en';

function setupLanguage(langCode) {
  currentLang = 'en';
  if (langCode) {
    const langKeys = Object.keys(i18n);
    if (langKeys.includes(langCode)) {
      currentLang = langCode;
    } else {
      const prefix = langCode.split('-')[0];
      if (prefix === 'zh') {
        if (langCode.toLowerCase().includes('tw') || langCode.toLowerCase().includes('hk')) {
          currentLang = 'zh-TW';
        } else {
          currentLang = 'zh-CN';
        }
      } else if (langKeys.includes(prefix)) {
        currentLang = prefix;
      }
    }
  }
  applyTranslations();
}

function applyTranslations() {
  const t = i18n[currentLang] || i18n.en;
  
  const logoText = document.querySelector('.logo-text');
  if (logoText) {
    logoText.innerHTML = `<svg style="width:1.15em;height:1.15em;vertical-align:middle;display:inline-flex;margin-right:8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="8" x2="22" y2="12"/><line x1="12" y1="2" x2="22" y2="12"/><polyline points="12 2 20 10 12 18"/><line x1="6" y1="12" x2="12" y2="18"/><line x1="2" y1="22" x2="11" y2="13"/></svg> ${t.appName}`;
  }

  const openDashboardBtn = document.getElementById('open-dashboard-btn');
  if (openDashboardBtn) openDashboardBtn.textContent = t.openDashboard;

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;

  const loadingPlaceholder = document.querySelector('.loading-placeholder');
  if (loadingPlaceholder) loadingPlaceholder.textContent = t.loadingFolders;
}

document.addEventListener('DOMContentLoaded', () => {
  // 先异步初始化语言，再调用初始化和绑定
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['language'], (data) => {
      let lang = data.language;
      if (!lang && chrome.i18n) {
        lang = chrome.i18n.getUILanguage();
      }
      setupLanguage(lang);
      initApp();
      setupEventListeners();
    });
  } else {
    const browserLang = navigator.language || navigator.userLanguage;
    setupLanguage(browserLang);
    initApp();
    setupEventListeners();
  }

  const openDashboardBtn = document.getElementById('open-dashboard-btn');
  if (openDashboardBtn) {
    openDashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html?mode=dashboard') });
      window.close();
    });
  }

  // 新标签页接管激活引导逻辑
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['isNewtabDisabled'], (data) => {
      const disabled = data.isNewtabDisabled === true || data.isNewtabDisabled === 'true';
      const banner = document.getElementById('newtab-promo-banner');
      if (disabled && banner) {
        const isChinese = currentLang.startsWith('zh');
        const textSpan = document.getElementById('promo-text-span');
        const btn = document.getElementById('enable-newtab-btn');
        if (textSpan) {
          textSpan.textContent = isChinese ? '💡 CanvasTab 新标签页接管已停用。' : '💡 CanvasTab New Tab takeover is disabled.';
        }
        if (btn) {
          btn.textContent = isChinese ? '重新启用接管' : 'Enable Takeover';
          btn.addEventListener('click', () => {
            chrome.storage.local.set({ isNewtabDisabled: false, onboarding_completed: true }, () => {
              chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html?mode=dashboard') });
              window.close();
            });
          });
        }
        banner.style.display = 'flex';
      }
    });
  }
});

// 初始化应用
function initApp() {
  // 检查是否在 Chrome 插件环境中运行
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    loadBookmarksTree();
    setupSyncListeners();
  } else {
    // 调试模拟数据（如果直接在浏览器里打开 HTML 查看效果）
    loadMockData();
  }
}

// 加载真实书签树
function loadBookmarksTree() {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    allFolders = [];
    bookmarksCache = {};
    
    // 递归解析书签树，提取文件夹和书签
    parseBookmarkNode(bookmarkTreeNodes[0]);

    // 默认添加一个“所有书签”虚拟文件夹，ID 设为 'all'
    const allBookmarks = getAllFlatBookmarks();
    bookmarksCache['all'] = allBookmarks;

    // 渲染侧边栏
    renderSidebar();

    // 默认选中“所有书签”
    selectFolder('all');
  });
}

// 递归解析节点
function parseBookmarkNode(node) {
  if (node.children) {
    // 如果节点有子节点，说明是文件夹
    // 排除根节点本身（根节点的 title 通常为空）
    if (node.id !== '0') {
      const t = i18n[currentLang] || i18n.en;
      allFolders.push({
        id: node.id,
        title: node.title || (node.id === '1' ? t.bookmarkBar : node.id === '2' ? t.otherBookmarks : t.untitledFolder)
      });
    }

    // 提取该文件夹下的直属书签链接
    const links = node.children.filter(child => !child.children);
    bookmarksCache[node.id] = links;

    // 递归遍历子项
    node.children.forEach(child => parseBookmarkNode(child));
  }
}

// 获取展平的所有书签
function getAllFlatBookmarks() {
  let list = [];
  Object.keys(bookmarksCache).forEach(key => {
    if (key !== 'all') {
      list = list.concat(bookmarksCache[key]);
    }
  });
  // 去重
  const uniqueList = [];
  const visitedUrls = new Set();
  list.forEach(item => {
    if (!visitedUrls.has(item.url)) {
      visitedUrls.add(item.url);
      uniqueList.push(item);
    }
  });
  return uniqueList;
}

// 渲染侧边栏目录
function renderSidebar() {
  const folderList = document.getElementById('folder-list');
  folderList.innerHTML = '';

  // 渲染“所有书签”项
  const t = i18n[currentLang] || i18n.en;
  const allItem = createSidebarItem('all', SVGS.folder, t.allBookmarks);
  folderList.appendChild(allItem);

  // 渲染实际文件夹项
  allFolders.forEach(folder => {
    // 只渲染有书签或有子集概念的文件夹
    const iconSvg = folder.id === '1' ? SVGS.star : SVGS.folder;
    const item = createSidebarItem(folder.id, iconSvg, folder.title);
    folderList.appendChild(item);
  });
}

function createSidebarItem(id, emoji, title) {
  const item = document.createElement('div');
  item.className = 'folder-item';
  if (id === activeFolderId) item.classList.add('active');
  item.dataset.id = id;
  
  item.innerHTML = `
    <span class="folder-icon">${emoji}</span>
    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(title)}</span>
  `;

  item.addEventListener('click', () => selectFolder(id));
  return item;
}

// 选中某个文件夹
function selectFolder(id) {
  activeFolderId = id;
  
  // 更新侧边栏高亮
  document.querySelectorAll('.folder-item').forEach(item => {
    if (item.dataset.id === id) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 更新标题
  const folderTitle = document.getElementById('current-folder-title');
  const t = i18n[currentLang] || i18n.en;
  if (id === 'all') {
    folderTitle.textContent = t.allBookmarks;
  } else {
    const folder = allFolders.find(f => f.id === id);
    folderTitle.textContent = folder ? folder.title : t.unknownFolder;
  }

  // 渲染对应的书签卡片
  renderBookmarks(bookmarksCache[id] || []);
}

// 渲染书签卡片
function renderBookmarks(bookmarksList) {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';

  const t = i18n[currentLang] || i18n.en;
  if (bookmarksList.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${SVGS.empty}</div>
        <p>${t.emptyState}</p>
      </div>
    `;
    return;
  }

  bookmarksList.forEach(bookmark => {
    const card = document.createElement('a');
    card.className = 'bookmark-card';
    card.href = bookmark.url;
    card.target = '_blank';
    card.title = bookmark.title;

    let hostname = '';
    try {
      hostname = new URL(bookmark.url).hostname;
    } catch (err) {
      hostname = bookmark.url.startsWith('javascript:') ? 'Script Link' : 'Local Link';
    }

    // 获取 Favicon 地址 (Manifest V3 推荐方式)
    let faviconUrl = '';
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      const urlObj = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
      urlObj.searchParams.set('pageUrl', bookmark.url);
      urlObj.searchParams.set('size', '32');
      faviconUrl = urlObj.toString();
    } else {
      // 模拟或者备用加载
      faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    }

    // 获取首字母作为图标备份
    const initial = bookmark.title ? bookmark.title.charAt(0).toUpperCase() : '?';

    card.innerHTML = `
      <div class="card-top">
        <div class="favicon-wrapper">
          <img class="favicon-img" src="${faviconUrl}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" alt="">
          <span class="favicon-fallback" style="display: none;">${initial}</span>
        </div>
        <div class="bookmark-title">${escapeHtml(bookmark.title || t.untitledBookmark)}</div>
      </div>
      <div class="card-bottom">${escapeHtml(hostname)}</div>
    `;

    grid.appendChild(card);
  });
}

// 事件监听设置
function setupEventListeners() {
  // 搜索框过滤逻辑
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      // 恢复显示当前文件夹
      selectFolder(activeFolderId);
      return;
    }

    // 在所有书签中进行模糊匹配搜索
    const allBookmarks = bookmarksCache['all'] || [];
    const filtered = allBookmarks.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.url.toLowerCase().includes(query)
    );

    const t = i18n[currentLang] || i18n.en;
    document.getElementById('current-folder-title').textContent = t.searchResult.replace('{query}', query);
    renderBookmarks(filtered);
  });

  // 快捷键聚焦搜索框 (按下 / 键)
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
}

// 实时同步浏览器书签的变化
function setupSyncListeners() {
  // 监听书签新建、删除、修改、移动事件
  const handleUpdate = () => {
    loadBookmarksTree();
  };

  chrome.bookmarks.onCreated.addListener(handleUpdate);
  chrome.bookmarks.onRemoved.addListener(handleUpdate);
  chrome.bookmarks.onChanged.addListener(handleUpdate);
  chrome.bookmarks.onMoved.addListener(handleUpdate);
  chrome.bookmarks.onChildrenReordered.addListener(handleUpdate);
}

// 模拟调试数据 (用于非插件环境预览)
function loadMockData() {
  allFolders = [
    { id: '1', title: '书签栏' },
    { id: '2', title: '工作工具' },
    { id: '3', title: '学习娱乐' }
  ];

  bookmarksCache = {
    'all': [
      { title: 'Google', url: 'https://www.google.com' },
      { title: 'GitHub', url: 'https://github.com' },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
      { title: 'Bilibili', url: 'https://www.bilibili.com' },
      { title: 'Chrome Developer Console', url: 'https://developer.chrome.com' }
    ],
    '1': [
      { title: 'Google', url: 'https://www.google.com' },
      { title: 'GitHub', url: 'https://github.com' }
    ],
    '2': [
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' }
    ],
    '3': [
      { title: 'Bilibili', url: 'https://www.bilibili.com' }
    ]
  };

  renderSidebar();
  selectFolder('all');
}
