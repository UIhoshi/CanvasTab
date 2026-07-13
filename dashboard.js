// 早期重定向判定：如果已配置不将此插件用作新标签页，且当前是以默认新标签形式加载（无 mode 参数，即 Ctrl+T 触发），则立刻重定向至 Chrome 原生新标签页
(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (localStorage.getItem('isNewtabDisabled') === 'true' && !urlParams.has('mode')) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.update) {
      chrome.tabs.update({ url: 'chrome://new-tab-page/' });
    }
  }
})();

// ================= 状态持久化底层存储辅助函数 =================
function setStorageItem(key, value) {
  localStorage.setItem(key, value);
  // 直接写入 chrome.storage.local
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = {};
    data[key] = value;
    chrome.storage.local.set(data);
  }
  // 同时通过 service worker 中转写入（双保险）
  if (key === 'isHomepageSet' && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: 'setHomepageState', value: value }).catch(() => {});
  }
}

function removeStorageItem(key) {
  localStorage.removeItem(key);
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.remove(key);
  }
  // 同时通过 service worker 中转写入（双保险）
  if (key === 'isHomepageSet' && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: 'setHomepageState', value: null }).catch(() => {});
  }
}

// ================= 语言国际化系统 (i18n) =================
const i18n = {
  'en': {
    appName: '📌 CanvasTab Bookmarks',
    manageMode: '🗃️ Manage',
    visualMode: '🎨 Visual',
    viewCard: '🎴 Card',
    viewList: '📝 List',
    viewIcon: '📱 Icon',
    searchPlaceholder: 'Search bookmarks, links or folders...',
    loadingFolders: 'Loading folders...',
    versionTag: 'v1.7 | Wallpaper Slideshow',
    allBookmarks: 'All Bookmarks',
    folderStatsAll: 'Total of {count} bookmark links collected',
    folderStatsFolder: 'Contains {folders} folders, {links} links',
    folderStatsVisual: 'Visual Mode | {folders} folders, {links} links',
    emptyState: 'No subfolders or bookmark links found here~',
    modalFolderTitle: 'Folder Content',
    folderCardCount: '{count} items',
    statsSearch: 'Search | Found {folders} folders, {links} links',
    tooltipBack: 'Back to parent',
    tooltipClose: 'Close modal'
  },
  'zh-CN': {
    appName: '📌 CanvasTab 浏览器书签画布',
    manageMode: '🗃️ 极简管理',
    visualMode: '🎨 无界视觉',
    viewCard: '🎴 卡片',
    viewList: '📝 列表',
    viewIcon: '📱 图标',
    searchPlaceholder: '搜索书签、链接或关键词...',
    loadingFolders: '加载文件夹中...',
    versionTag: 'v1.7 | 幻灯壁纸版',
    allBookmarks: '所有书签',
    folderStatsAll: '共收录了 {count} 个网页链接',
    folderStatsFolder: '包含 {folders} 个子目录，{links} 个网页链接',
    folderStatsVisual: '看板视角 | 共有 {folders} 个主要文件夹，{links} 个直属链接',
    emptyState: '这里没有找到任何子文件夹或书签链接~',
    modalFolderTitle: '文件夹内容',
    folderCardCount: '{count} 个对象',
    statsSearch: '搜索结果：找到 {folders} 个文件夹，{links} 个网页',
    tooltipBack: '返回上一级',
    tooltipClose: '关闭弹窗'
  },
  'zh-TW': {
    appName: '📌 CanvasTab 瀏覽器書籤畫布',
    manageMode: '🗃️ 極簡管理',
    visualMode: '🎨 無界視覺',
    viewCard: '🎴 卡片',
    viewList: '📝 列表',
    viewIcon: '📱 圖標',
    searchPlaceholder: '搜尋書籤、連結或關鍵字...',
    loadingFolders: '載入資料夾中...',
    versionTag: 'v1.7 | 幻燈壁紙版',
    allBookmarks: '所有書籤',
    folderStatsAll: '共收錄了 {count} 個網頁連結',
    folderStatsFolder: '包含 {folders} 個子目錄，{links} 個網頁連結',
    folderStatsVisual: '看板視角 | 共有 {folders} 個主要資料夾，{links} 個直屬連結',
    emptyState: '這裡沒有找到任何子資料夾或書籤連結~',
    modalFolderTitle: '資料夾內容',
    folderCardCount: '{count} 個對象',
    statsSearch: '搜尋結果：找到 {folders} 個資料夾，{links} 個網頁',
    tooltipBack: '返回上一級',
    tooltipClose: '關閉彈窗'
  },
  'es': {
    appName: '📌 Marcadores Visuales',
    manageMode: '🗃️ Gestión',
    visualMode: '🎨 Visual',
    viewCard: '🎴 Tarjetas',
    viewList: '📝 Lista',
    viewIcon: '📱 Iconos',
    searchPlaceholder: 'Buscar marcadores, enlaces o carpetas...',
    loadingFolders: 'Cargando carpetas...',
    versionTag: 'v1.7 | Modo Diapositivas',
    allBookmarks: 'Todos los marcadores',
    folderStatsAll: 'Total de {count} enlaces recopilados',
    folderStatsFolder: 'Contiene {folders} carpetas, {links} enlaces',
    folderStatsVisual: 'Modo Visual | {folders} carpetas, {links} enlaces',
    emptyState: 'No se encontraron carpetas o enlaces aquí~',
    modalFolderTitle: 'Contenido de carpeta',
    folderCardCount: '{count} elementos',
    statsSearch: 'Búsqueda | {folders} carpetas, {links} enlaces encontrados',
    tooltipBack: 'Volver',
    tooltipClose: 'Cerrar'
  },
  'ja': {
    appName: '📌 ブックマーク看板',
    manageMode: '🗃️ 管理モード',
    visualMode: '🎨 ビジュアル',
    viewCard: '🎴 カード',
    viewList: '📝 リスト',
    viewIcon: '📱 アイコン',
    searchPlaceholder: 'ブックマーク、リンク、フォルダを検索...',
    loadingFolders: 'フォルダを読み込み中...',
    versionTag: 'v1.7 | スライドショー',
    allBookmarks: 'すべてのブックマーク',
    folderStatsAll: '合計 {count} 個のリンクが登録されています',
    folderStatsFolder: '{folders} 個のフォルダ、{links} 個のリンクが含まれています',
    folderStatsVisual: 'ビジュアル表示 | 主要フォルダ {folders} 個、直属リンク {links} 個',
    emptyState: 'サブフォルダまたはブックマークが見つかりませんでした~',
    modalFolderTitle: 'フォルダの内容',
    folderCardCount: '{count} 個の項目',
    statsSearch: '検索結果 | フォルダ {folders} 個、リンク {links} 個が見つかりました',
    tooltipBack: '戻る',
    tooltipClose: '閉じる'
  },
  'ko': {
    appName: '📌 북마크 대시보드',
    manageMode: '🗃️ 간편 관리',
    visualMode: '🎨 비주얼',
    viewCard: '🎴 카드',
    viewList: '📝 목록',
    viewIcon: '📱 아이콘',
    searchPlaceholder: '북마크, 링크 또는 폴더 검색...',
    loadingFolders: '폴더 로딩 중...',
    versionTag: 'v1.7 | 슬라이드 쇼',
    allBookmarks: '모든 북마크',
    folderStatsAll: '총 {count}개의 북마크 링크 수집됨',
    folderStatsFolder: '폴더 {folders}개, 링크 {links}개 포함',
    folderStatsVisual: '비주얼 모드 | 폴더 {folders}개, 링크 {links}개',
    emptyState: '하위 폴더 또는 북마크 링크를 찾을 수 없습니다~',
    modalFolderTitle: '폴더 내용',
    folderCardCount: '{count}개 항목',
    statsSearch: '검색 결과 | 폴더 {folders}개, 링크 {links}개 발견됨',
    tooltipBack: '뒤로 가기',
    tooltipClose: '닫기'
  },
  'fr': {
    appName: '📌 Signets Visuels',
    manageMode: '🗃️ Gestion',
    visualMode: '🎨 Visuel',
    viewCard: '🎴 Cartes',
    viewList: '📝 Liste',
    viewIcon: '📱 Icônes',
    searchPlaceholder: 'Rechercher des favoris, liens ou dossiers...',
    loadingFolders: 'Chargement des dossiers...',
    versionTag: 'v1.7 | Diaporama',
    allBookmarks: 'Tous les signets',
    folderStatsAll: 'Total de {count} liens collectés',
    folderStatsFolder: 'Contiene {folders} dossiers, {links} liens',
    folderStatsVisual: 'Mode Visuel | {folders} dossiers, {links} liens',
    emptyState: 'Aucun sous-dossier ou signet trouvé ici~',
    modalFolderTitle: 'Contenu du dossier',
    folderCardCount: '{count} éléments',
    statsSearch: 'Recherche | {folders} dossiers, {links} liens trouvés',
    tooltipBack: 'Retour',
    tooltipClose: 'Fermer'
  },
  'de': {
    appName: '📌 Visuelle Lesezeichen',
    manageMode: '🗃️ Verwaltung',
    visualMode: '🎨 Visuell',
    viewCard: '🎴 Karten',
    viewList: '📝 Liste',
    viewIcon: '📱 Icons',
    searchPlaceholder: 'Lesezeichen, Links oder Ordner suchen...',
    loadingFolders: 'Ordner werden geladen...',
    versionTag: 'v1.7 | Diashow',
    allBookmarks: 'Alle Lesezeichen',
    folderStatsAll: 'Insgesamt {count} Links gesammelt',
    folderStatsFolder: 'Enthält {folders} Ordner, {links} Links',
    folderStatsVisual: 'Visueller Modus | {folders} Ordner, {links} Links',
    emptyState: 'Keine Unterordner oder Lesezeichen-Links gefunden~',
    modalFolderTitle: 'Ordnerinhalt',
    folderCardCount: '{count} Elemente',
    statsSearch: 'Suche | {folders} Ordner, {links} Links gefunden',
    tooltipBack: 'Zurück',
    tooltipClose: 'Schließen'
  }
};

// 全局状态管理
const SVGS = {
  logo: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="8" x2="22" y2="12"/><line x1="12" y1="2" x2="22" y2="12"/><polyline points="12 2 20 10 12 18"/><line x1="6" y1="12" x2="12" y2="18"/><line x1="2" y1="22" x2="11" y2="13"/></svg>`,
  folder: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  star: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  manage: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  visual: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/></svg>`,
  homepage: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  wallpaper: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  themeDark: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  themeLight: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  themeAurora: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  viewCard: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  viewList: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  viewIcon: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  back: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  close: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  world: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  search: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  add: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  empty: `<svg class="svg-icon" style="width:48px;height:48px;opacity:0.45;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`
};

const THEMES_LIST = [
  { id: 'dark', name: 'Midnight Dark', nameZh: '极夜暗黑', color: '#06070a' },
  { id: 'light', name: 'Light Glass', nameZh: '晨曦明亮', color: '#ffffff' },
  { id: 'aurora', name: 'Neon Aurora', nameZh: '极光流彩', color: '#ec4899' },
  { id: 'ocean', name: 'Deep Ocean', nameZh: '深海幽蓝', color: '#06b6d4' },
  { id: 'forest', name: 'Forest Green', nameZh: '森野绿意', color: '#10b981' },
  { id: 'sunset', name: 'Sunset Orange', nameZh: '落日余晖', color: '#f97316' },
  { id: 'sakura', name: 'Sakura Rose', nameZh: '樱色浪漫', color: '#db2777' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', nameZh: '赛博朋克', color: '#facc15' }
];

const LANGUAGES_LIST = [
  { id: 'zh-CN', name: '简体中文' },
  { id: 'zh-TW', name: '繁體中文' },
  { id: 'en', name: 'English' },
  { id: 'ja', name: '日本語' },
  { id: 'ko', name: '한국어' },
  { id: 'es', name: 'Español' },
  { id: 'fr', name: 'Français' },
  { id: 'de', name: 'Deutsch' }
];

let currentLang = 'en';
let allFolders = [];
let activeFolderId = null;
let bookmarksCache = {}; // 缓存各文件夹直属链接
let foldersCache = {}; // 缓存各文件夹直属子文件夹
let expandedFolderIds = new Set(['1', '2']); // 缓存树形文件夹的展开折叠状态 (默认展开书签栏和开发资源根节点)
let viewMode = 'card'; // 'card' | 'list' | 'icon'
let currentMode = ''; // 'manage' | 'visual' (极简管理 vs 无界视觉)
let theme = 'dark'; // 'dark' | 'light' | 'aurora' (配色主题)

// 背景壁纸与幻灯片控制变量
let wallpaperEnabled = false;
let slideshowEnabled = false;
let wallpaperFit = 'cover'; // 'cover' | 'contain' | 'repeat'
let wallpaperOpacity = 70; // 默认 70% 壁纸不透明度 (10-100)
let customBgList = []; // 存储 Base64 壁纸数组
let currentBgIndex = 0;
let slideshowInterval = null;

// 搜索引擎配置
let currentSearchEngine = 'browser';
let customEngines = [];

// 弹窗状态管理
let modalRootFolderId = null;
let modalActiveFolderId = null;

// 拖拽悬停触发弹窗/导航的定时器 (Spring-loaded Folders)
let dragHoverTimer = null;
let currentHoveredFolderId = null;

document.addEventListener('DOMContentLoaded', () => {
  setupControlSurface();
  const urlParams = new URLSearchParams(window.location.search);
  const isHomepageMode = urlParams.get('mode') === 'homepage';

  // 第一步：从 chrome.storage.local 恢复状态到 localStorage（解决停用/启用插件后 localStorage 被清空的问题）
  const restoreAndInit = () => {
    // 第二步：如果当前 URL 带有 ?mode=homepage，说明 Chrome 确实在"启动时"加载了此页面
    // 这是最可靠的事实来源，无条件标记为已设置
    if (isHomepageMode) {
      setStorageItem('isHomepageSet', 'true');
    }

    // 第三步：检查 onboarding 引导状态
    const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
    if (!onboardingCompleted) {
      const onboardingOverlay = document.getElementById('onboarding-modal-overlay');
      if (onboardingOverlay) onboardingOverlay.classList.add('active');
    }

    // 第四步：初始化应用
    setupLanguage();
    initApp();
    setupEventListeners();
    loadSavedSettings();
  };

  // 尝试从 chrome.storage.local 恢复关键状态
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['isHomepageSet', 'isNewtabDisabled', 'onboarding_completed'], (data) => {
      if (data.isHomepageSet !== undefined) localStorage.setItem('isHomepageSet', String(data.isHomepageSet));
      if (data.isNewtabDisabled !== undefined) localStorage.setItem('isNewtabDisabled', String(data.isNewtabDisabled));
      if (data.onboarding_completed !== undefined) localStorage.setItem('onboarding_completed', String(data.onboarding_completed));
      restoreAndInit();
    });
  } else {
    restoreAndInit();
  }
});

// 自动识别语言
function setupLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  currentLang = 'en';

  if (browserLang) {
    const langKeys = Object.keys(i18n);
    if (langKeys.includes(browserLang)) {
      currentLang = browserLang;
    } else {
      const prefix = browserLang.split('-')[0];
      if (prefix === 'zh') {
        if (browserLang.toLowerCase().includes('tw') || browserLang.toLowerCase().includes('hk')) {
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

// 动态载入多国语言词条
function applyTranslations() {
  const t = i18n[currentLang];
  const emojiRegex = /^[\u2000-\u2BFF\uFE0F\uD83C-\uD83E\uDC00-\uDFFF\s]+/;
  
  const logoTextEl = document.querySelector('.logo-text');
  if (logoTextEl) {
    const text = t.appName.replace(emojiRegex, '');
    logoTextEl.innerHTML = `${SVGS.logo} <span>${text}</span>`;
  }
  document.querySelector('.version-tag').textContent = t.versionTag;

  const manageBtn = document.querySelector('.mode-btn[data-mode="manage"]');
  if (manageBtn) {
    const text = t.manageMode.replace(emojiRegex, '');
    manageBtn.innerHTML = `${SVGS.manage} <span class="btn-text">${text}</span>`;
  }
  
  const visualBtn = document.querySelector('.mode-btn[data-mode="visual"]');
  if (visualBtn) {
    const text = t.visualMode.replace(emojiRegex, '');
    visualBtn.innerHTML = `${SVGS.visual} <span class="btn-text">${text}</span>`;
  }
  
  const viewCardBtn = document.querySelector('.view-btn[data-mode="card"]');
  if (viewCardBtn) {
    const text = t.viewCard.replace(emojiRegex, '');
    viewCardBtn.innerHTML = `${SVGS.viewCard} <span class="btn-text">${text}</span>`;
  }
  
  const viewListBtn = document.querySelector('.view-btn[data-mode="list"]');
  if (viewListBtn) {
    const text = t.viewList.replace(emojiRegex, '');
    viewListBtn.innerHTML = `${SVGS.viewList} <span class="btn-text">${text}</span>`;
  }
  
  const viewIconBtn = document.querySelector('.view-btn[data-mode="icon"]');
  if (viewIconBtn) {
    const text = t.viewIcon.replace(emojiRegex, '');
    viewIconBtn.innerHTML = `${SVGS.viewIcon} <span class="btn-text">${text}</span>`;
  }
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;
  
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.title = t.tooltipClose;
  
  const modalBack = document.getElementById('modal-back-btn');
  if (modalBack) modalBack.title = t.tooltipBack;

  // 返回上一级按钮翻译
  const universalBackText = document.querySelector('#universal-folder-back-btn span');
  if (universalBackText) {
    universalBackText.textContent = currentLang.startsWith('zh') ? '返回上一层' : 'Back';
  }
  const googleBackText = document.getElementById('google-back-folder-text');
  if (googleBackText) {
    googleBackText.textContent = currentLang.startsWith('zh') ? '返回上一级' : 'Back';
  }

  // 壁纸翻译
  const lblEnableBg = document.getElementById('lbl-enable-bg') || document.getElementById('drawer-lbl-enable-bg');
  if (lblEnableBg) lblEnableBg.textContent = currentLang.startsWith('zh') ? '启用壁纸背景' : 'Enable Wallpaper';
  
  const lblEnableSlideshow = document.getElementById('lbl-enable-slideshow') || document.getElementById('drawer-lbl-enable-slideshow');
  if (lblEnableSlideshow) lblEnableSlideshow.textContent = currentLang.startsWith('zh') ? '幻灯片播放' : 'Slideshow Mode';
  
  const lblBgFit = document.getElementById('lbl-bg-fit') || document.getElementById('drawer-lbl-bg-fit');
  if (lblBgFit) lblBgFit.textContent = currentLang.startsWith('zh') ? '展示效果' : 'Display Mode';

  const lblBgOpacity = document.getElementById('lbl-bg-opacity') || document.getElementById('drawer-lbl-bg-opacity');
  if (lblBgOpacity) lblBgOpacity.textContent = currentLang.startsWith('zh') ? '壁纸清晰度' : 'Wallpaper Clarity';
  
  const optFitCover = document.getElementById('opt-fit-cover') || document.getElementById('drawer-opt-fit-cover');
  if (optFitCover) optFitCover.textContent = currentLang.startsWith('zh') ? '拉伸填充' : 'Cover';
  
  const optFitContain = document.getElementById('opt-fit-contain') || document.getElementById('drawer-opt-fit-contain');
  if (optFitContain) optFitContain.textContent = currentLang.startsWith('zh') ? '适应缩放' : 'Contain';
  
  const optFitTile = document.getElementById('opt-fit-tile') || document.getElementById('drawer-opt-fit-tile');
  if (optFitTile) optFitTile.textContent = currentLang.startsWith('zh') ? '复制平铺' : 'Tile';
  
  const bgUploadTrigger = document.getElementById('bg-upload-trigger') || document.getElementById('drawer-bg-upload-trigger');
  if (bgUploadTrigger) bgUploadTrigger.textContent = currentLang.startsWith('zh') ? '上传图片 (最多6张)' : 'Upload Images (Max 6)';

  // 首次安装向导弹窗多语言翻译
  const onboardingTitle = document.getElementById('onboarding-title');
  if (onboardingTitle) {
    if (currentLang === 'zh-CN') onboardingTitle.textContent = '🎉 感谢安装 CanvasTab！';
    else if (currentLang === 'zh-TW') onboardingTitle.textContent = '🎉 感謝安裝 CanvasTab！';
    else if (currentLang === 'es') onboardingTitle.textContent = '🎉 ¡Bienvenido a CanvasTab!';
    else if (currentLang === 'ja') onboardingTitle.textContent = '🎉 CanvasTab へようこそ！';
    else if (currentLang === 'ko') onboardingTitle.textContent = '🎉 CanvasTab 설치를 환영합니다!';
    else if (currentLang === 'fr') onboardingTitle.textContent = '🎉 Bienvenue sur CanvasTab !';
    else if (currentLang === 'de') onboardingTitle.textContent = '🎉 Willkommen bei CanvasTab!';
    else onboardingTitle.textContent = '🎉 Welcome to CanvasTab!';
  }

  const onboardingDesc = document.getElementById('onboarding-desc');
  if (onboardingDesc) {
    if (currentLang === 'zh-CN') onboardingDesc.innerHTML = '本插件已就绪。为了符合你的浏览习惯，请选择是否将本看板作为你的<b>默认新标签页</b>？';
    else if (currentLang === 'zh-TW') onboardingDesc.innerHTML = '本插件已就緒。為了符合你的瀏覽習慣，請選擇是否將本看板作為你的<b>預設新分頁</b>？';
    else if (currentLang === 'es') onboardingDesc.innerHTML = 'La extensión está lista. Para adaptarse a tus habitudes de navegación, ¿deseas configurar CanvasTab como tu <b>página de inicio predeterminada</b>?';
    else if (currentLang === 'ja') onboardingDesc.innerHTML = '拡張機能の準備ができました。ブラウジングの習慣に合わせて、CanvasTab を<b>デフォルトのホームページ</b>に設定しますか？';
    else if (currentLang === 'ko') onboardingDesc.innerHTML = '확장 프로그램이 준비되었습니다. 브라우징 습관에 맞추어 CanvasTab을 <b>기본 홈페이지</b>로 설정하시겠습니까?';
    else if (currentLang === 'fr') onboardingDesc.innerHTML = 'L\'extension est prête. Pour s\'adapter à vos habitudes de navigation, souhaitez-vous définir CanvasTab comme <b>page d\'accueil par défaut</b> ?';
    else if (currentLang === 'de') onboardingDesc.innerHTML = 'Die Erweiterung ist bereit. Möchten Sie CanvasTab als <b>Standard-Startseite</b> festlegen, um sie an Ihre Surfgewohnheiten anzupassen?';
    else onboardingDesc.innerHTML = 'CanvasTab is ready. To match your browsing habits, would you like to set CanvasTab as your <b>default homepage</b>?';
  }

  const btnOnboardingKeep = document.getElementById('btn-onboarding-keep');
  if (btnOnboardingKeep) {
    if (currentLang === 'zh-CN') btnOnboardingKeep.textContent = '🏠 是的，设置为首页';
    else if (currentLang === 'zh-TW') btnOnboardingKeep.textContent = '🏠 是的，設置為首頁';
    else if (currentLang === 'es') btnOnboardingKeep.textContent = '🏠 Sí, establecer como página de inicio';
    else if (currentLang === 'ja') btnOnboardingKeep.textContent = '🏠 はい、ホームページに設定する';
    else if (currentLang === 'ko') btnOnboardingKeep.textContent = '🏠 예, 홈페이지로 설정';
    else if (currentLang === 'fr') btnOnboardingKeep.textContent = '🏠 Oui, définir comme page d\'accueil';
    else if (currentLang === 'de') btnOnboardingKeep.textContent = '🏠 Ja, als Startseite festlegen';
    else btnOnboardingKeep.textContent = '🏠 Yes, set as homepage';
  }

  const btnOnboardingHomepage = document.getElementById('btn-onboarding-homepage');
  if (btnOnboardingHomepage) {
    if (currentLang === 'zh-CN') btnOnboardingHomepage.textContent = '🎴 不，仅作为新标签页';
    else if (currentLang === 'zh-TW') btnOnboardingHomepage.textContent = '🎴 不，僅作為新分頁';
    else if (currentLang === 'es') btnOnboardingHomepage.textContent = '🎴 No, solo como nueva pestaña';
    else if (currentLang === 'ja') btnOnboardingHomepage.textContent = '🎴 いいえ、新しいタブとしてのみ使用する';
    else if (currentLang === 'ko') btnOnboardingHomepage.textContent = '🎴 아니오, 새 탭으로만 사용';
    else if (currentLang === 'fr') btnOnboardingHomepage.textContent = '🎴 Non, seulement comme nouvel onglet';
    else if (currentLang === 'de') btnOnboardingHomepage.textContent = '🎴 Nein, nur als neuen Tab verwenden';
    else btnOnboardingHomepage.textContent = '🎴 No, only as new tab';
  }

  // 新建文件夹按钮翻译
  const txtAddFolderBtn = document.getElementById('txt-add-folder-btn');
  if (txtAddFolderBtn) {
    txtAddFolderBtn.textContent = currentLang.startsWith('zh') ? '新建文件夹' : 'New Folder';
  }
  const addGlobalBtn = document.getElementById('add-folder-global-btn');
  if (addGlobalBtn) {
    addGlobalBtn.title = currentLang.startsWith('zh') ? '在当前目录下新建文件夹' : 'Create new folder in current directory';
  }

  // 动态渲染语言和主题下拉菜单内容
  renderLanguageSelector();
  renderThemeSelector();
}

// 检测并切换顶部“新标签页接管”按钮的显示状态与面板指示器状态
function checkNewtabVisibility() {
  // 同步判定：基于当前 localStorage 立即渲染
  const isDisabled = localStorage.getItem('isNewtabDisabled') === 'true';
  renderNewtabState(!isDisabled);

  // 异步自愈：从 chrome.storage.local 二次校验，若有差异则自动修正 UI
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['isNewtabDisabled'], (data) => {
      const storedDisabled = data.isNewtabDisabled === true || data.isNewtabDisabled === 'true';
      if (storedDisabled !== isDisabled) {
        localStorage.setItem('isNewtabDisabled', String(storedDisabled));
        renderNewtabState(!storedDisabled);
      }
    });
  }
}

// 根据新标签页启用状态渲染按钮、指示灯和面板的实际 UI
function renderNewtabState(isEnabled) {
  const btn = document.getElementById('header-set-homepage-btn');
  const statusDot = document.getElementById('homepage-status-dot');
  const statusText = document.getElementById('homepage-status-text');
  const resetBtn = document.getElementById('btn-homepage-reset');
  const drawerNewtabToggle = document.getElementById('drawer-btn-newtab-toggle');

  // 1. 始终保持顶部主按钮显示，更新内容与状态类名以展示已设置/取消接管交互
  if (btn) {
    btn.style.display = 'flex';
    if (isEnabled) {
      btn.classList.add('is-homepage-active'); // 复用原本的 CSS 高亮样式
      btn.innerHTML = `
        <span class="btn-icon">${SVGS.check}</span>
        <span class="btn-text-normal">${currentLang.startsWith('zh') ? '新标签页已开启' : 'New Tab Enabled'}</span>
        <span class="btn-text-hover" style="display: none;">${currentLang.startsWith('zh') ? '取消接管' : 'Disable'}</span>
      `;
      btn.title = currentLang.startsWith('zh') ? '点击恢复使用浏览器默认新标签页' : 'Click to restore system default New Tab page';
    } else {
      btn.classList.remove('is-homepage-active');
      btn.innerHTML = `
        <span class="btn-icon">${SVGS.homepage}</span>
        <span class="btn-text">${currentLang.startsWith('zh') ? '开启新标签页' : 'Enable New Tab'}</span>
      `;
      btn.title = currentLang.startsWith('zh') ? '开启 CanvasTab 接管浏览器新标签页' : 'Enable CanvasTab as your New Tab page';
    }
  }

  // 2. 更新壁纸设置面板中的指示器状态
  if (statusDot && statusText) {
    if (isEnabled) {
      statusDot.style.backgroundColor = '#10b981'; // 亮绿灯
      statusText.textContent = currentLang.startsWith('zh') ? '已由 CanvasTab 接管' : 'Taken over by CanvasTab';
      statusText.style.color = '#10b981';
    } else {
      statusDot.style.backgroundColor = '#9ca3af'; // 灰色
      statusText.textContent = currentLang.startsWith('zh') ? '系统默认新标签页' : 'System Default New Tab';
      statusText.style.color = 'var(--text-secondary)';
    }
  }

  // 3. 更新设置侧栏底部的接管状态控制按钮文本
  if (drawerNewtabToggle) {
    drawerNewtabToggle.textContent = isEnabled
      ? (currentLang.startsWith('zh') ? '恢复浏览器原生新标签页' : 'Restore Native New Tab')
      : (currentLang.startsWith('zh') ? '开启 CanvasTab 新标签页' : 'Enable CanvasTab New Tab');
  }

  // 隐藏无用的主页重置按钮
  if (resetBtn) {
    resetBtn.style.display = 'none';
  }
}

// 加载用户配置
function loadSavedSettings() {
  checkNewtabVisibility();

  const savedMode = localStorage.getItem('viewMode') || 'card';
  setViewMode(savedMode);

  const savedMainMode = localStorage.getItem('mainMode') || 'manage';
  setMainMode(savedMainMode);

  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  // 加载独立壁纸参数
  wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';
  slideshowEnabled = localStorage.getItem('slideshowEnabled') === 'true';
  wallpaperFit = localStorage.getItem('wallpaperFit') || 'cover';
  wallpaperOpacity = parseInt(localStorage.getItem('wallpaperOpacity') || '70', 10);
  currentBgIndex = parseInt(localStorage.getItem('currentBgIndex') || '0', 10);
  
  try {
    customBgList = JSON.parse(localStorage.getItem('customBgList')) || [];
  } catch(e) {
    customBgList = [];
  }

  // 同步控件 UI 状态
  const enableChk = document.getElementById('bg-enable-toggle');
  if (enableChk) enableChk.checked = wallpaperEnabled;

  const slideshowChk = document.getElementById('bg-slideshow-toggle');
  if (slideshowChk) slideshowChk.checked = slideshowEnabled;

  const fitSelect = document.getElementById('bg-fit-select');
  if (fitSelect) fitSelect.value = wallpaperFit;

  const opacitySlider = document.getElementById('bg-opacity-slider');
  if (opacitySlider) opacitySlider.value = wallpaperOpacity;

  const opacityVal = document.getElementById('bg-opacity-val');
  if (opacityVal) opacityVal.textContent = `${wallpaperOpacity}%`;

  // 加载搜索引擎配置
  currentSearchEngine = localStorage.getItem('searchEngine') || 'bookmarks';
  try {
    customEngines = JSON.parse(localStorage.getItem('customSearchEngines')) || [];
  } catch(e) {
    customEngines = [];
  }
  renderSearchEngineSelector();

  applyBackgroundSettings();
}

// 初始化应用
function initApp() {
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    loadBookmarksTree();
    setupSyncListeners();
  } else {
    loadMockData();
  }
}

// 加载书签树
function loadBookmarksTree() {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    allFolders = [];
    bookmarksCache = {};
    foldersCache = {};
    
    parseBookmarkNode(bookmarkTreeNodes[0]);

    // 清理已不存在的文件夹展开状态缓存
    const validIds = new Set(allFolders.map(f => f.id));
    expandedFolderIds.forEach(id => {
      if (id !== '1' && id !== '2' && !validIds.has(id)) {
        expandedFolderIds.delete(id);
      }
    });

    const allBookmarks = getAllFlatBookmarks();
    bookmarksCache['all'] = allBookmarks;
    foldersCache['all'] = []; 

    // 动态初始化默认选中的文件夹（优先选书签栏 '1'，否则取第一个根级文件夹）
    if (!activeFolderId) {
      const rootFoldersList = allFolders.filter(folder => 
        folder.parentId === '0' || 
        folder.parentId === 'root' || 
        !allFolders.some(f => f.id === folder.parentId)
      );
      if (rootFoldersList.length > 0) {
        const bookmarkBar = rootFoldersList.find(f => f.id === '1');
        activeFolderId = bookmarkBar ? bookmarkBar.id : rootFoldersList[0].id;
      } else {
        activeFolderId = '1';
      }
    }

    renderSidebar();
    refreshMainView();

    const modalOverlay = document.getElementById('folder-modal-overlay');
    if (modalOverlay && modalOverlay.classList.contains('active') && modalActiveFolderId) {
      loadModalFolderContent(modalActiveFolderId);
    }
  });
}

// 递归解析节点
function parseBookmarkNode(node) {
  if (node.children) {
    if (node.id !== '0') {
      allFolders.push({
        id: node.id,
        title: node.title || (node.id === '1' ? (currentLang.startsWith('zh') ? '书签栏' : 'Bookmark Bar') : node.id === '2' ? (currentLang.startsWith('zh') ? '其他书签' : 'Other Bookmarks') : 'Folder'),
        parentId: node.parentId
      });
    }

    const subFolders = node.children.filter(child => child.children);
    const links = node.children.filter(child => !child.children);

    foldersCache[node.id] = subFolders;
    bookmarksCache[node.id] = links;

    node.children.forEach(child => parseBookmarkNode(child));
  }
}

// 获取全部书签
function getAllFlatBookmarks() {
  let list = [];
  Object.keys(bookmarksCache).forEach(key => {
    if (key !== 'all') {
      list = list.concat(bookmarksCache[key]);
    }
  });
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

// 渲染树形侧边栏
function renderSidebar() {
  const folderList = document.getElementById('folder-list');
  folderList.innerHTML = '';

  // 查找根级文件夹 (parentId === '0' 或不在 allFolders 的 parentId 列表中)
  const rootFolders = allFolders.filter(folder => 
    folder.parentId === '0' || 
    folder.parentId === 'root' || 
    !allFolders.some(f => f.id === folder.parentId)
  );

  rootFolders.forEach(folder => {
    const treeNode = buildFolderTreeNode(folder);
    folderList.appendChild(treeNode);
  });

  if (activeFolderId) {
    expandToFolder(activeFolderId);
  }
}

// 递归构建树节点
function buildFolderTreeNode(folder) {
  const nodeEl = document.createElement('div');
  nodeEl.className = 'folder-tree-node';
  nodeEl.id = `node-${folder.id}`;

  const linkCount = (bookmarksCache[folder.id] || []).length;
  const subFolders = foldersCache[folder.id] || [];
  const iconSvg = folder.id === '1' ? SVGS.star : SVGS.folder;

  let countBadge = '';
  if (linkCount > 0 || subFolders.length > 0) {
    countBadge = ` (${linkCount + subFolders.length})`;
  }

  // 构建栏目本身
  const itemEl = document.createElement('div');
  itemEl.className = 'folder-item';
  if (folder.id === activeFolderId) itemEl.classList.add('active');
  itemEl.dataset.id = folder.id;

  const hasSubfolders = subFolders.length > 0;
  const isCurrentlyExpanded = expandedFolderIds.has(folder.id);
  const toggleSymbol = hasSubfolders ? (isCurrentlyExpanded ? '▲' : '▼') : '';
  const toggleClass = hasSubfolders ? (isCurrentlyExpanded ? ' expanded' : '') : ' leaf';

  const isSystemFolder = folder.id === '0' || folder.id === '1' || folder.id === '2' || folder.id === '3' || folder.parentId === '0' || folder.parentId === 'root';

  itemEl.innerHTML = `
    <span class="folder-toggle${toggleClass}">${toggleSymbol}</span>
    <span class="folder-icon">${iconSvg}</span>
    <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 4px;">${folder.title}${countBadge}</span>
    <div class="folder-actions" style="display: flex; gap: 4px; align-items: center; opacity: 0; transition: opacity 0.2s ease;">
      <button class="sidebar-action-btn add-subfolder-btn" title="${currentLang.startsWith('zh') ? '新建子文件夹' : 'Create Subfolder'}" data-id="${folder.id}">
        <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      ${!isSystemFolder ? `
      <button class="sidebar-action-btn delete-folder-btn" title="${currentLang.startsWith('zh') ? '删除此文件夹' : 'Delete Folder'}" data-id="${folder.id}">
        <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
      ` : ''}
    </div>
  `;

  // 支持拖拽自身（非系统文件夹）
  if (folder.id !== 'all' && !isSystemFolder) {
    itemEl.draggable = true;
    itemEl.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      e.dataTransfer.setData('folderId', folder.id);
      itemEl.classList.add('dragging');
    });
    itemEl.addEventListener('dragend', () => {
      itemEl.classList.remove('dragging');
      clearTimeout(dragHoverTimer);
      currentHoveredFolderId = null;
    });
  }

  // 点击选中目录，并且如果有子目录则同时执行展开/折叠
  const toggleEl = itemEl.querySelector('.folder-toggle');
  itemEl.addEventListener('click', (e) => {
    // 排除点击动作按钮
    if (e.target.closest('.sidebar-action-btn')) return;
    
    closeFolderModal();
    setMainMode('manage');
    selectFolder(folder.id, true);

    if (hasSubfolders) {
      const childrenContainer = nodeEl.querySelector('.folder-children');
      if (childrenContainer) {
        const isCollapsed = childrenContainer.classList.toggle('collapsed');
        if (isCollapsed) {
          toggleEl.classList.remove('expanded');
          toggleEl.textContent = '▼'; // 收起时显示向下 ▼
          expandedFolderIds.delete(folder.id);
        } else {
          toggleEl.classList.add('expanded');
          toggleEl.textContent = '▲'; // 展开时显示向上 ▲
          expandedFolderIds.add(folder.id);
        }
      }
    }
  });

  // 支持拖拽接收
  if (folder.id !== 'all') {
    itemEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      itemEl.classList.add('drag-over');

      if (currentHoveredFolderId !== folder.id) {
        clearTimeout(dragHoverTimer);
        currentHoveredFolderId = folder.id;
        dragHoverTimer = setTimeout(() => {
          setMainMode('manage');
          selectFolder(folder.id);
        }, 800);
      }
    });

    itemEl.addEventListener('dragleave', () => {
      itemEl.classList.remove('drag-over');
      if (currentHoveredFolderId === folder.id) {
        clearTimeout(dragHoverTimer);
        currentHoveredFolderId = null;
      }
    });

    itemEl.addEventListener('drop', (e) => {
      e.preventDefault();
      itemEl.classList.remove('drag-over');
      clearTimeout(dragHoverTimer);
      currentHoveredFolderId = null;

      const bookmarkId = e.dataTransfer.getData('bookmarkId');
      const draggedFolderId = e.dataTransfer.getData('folderId');
      if (bookmarkId && bookmarkId !== folder.id) {
        moveBookmark(bookmarkId, folder.id);
      } else if (draggedFolderId && draggedFolderId !== folder.id) {
        if (!isDescendant(draggedFolderId, folder.id)) {
          moveFolder(draggedFolderId, folder.id);
        }
      }
    });
  }

  nodeEl.appendChild(itemEl);

  // 递归子级
  if (hasSubfolders) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = `folder-children${isCurrentlyExpanded ? '' : ' collapsed'}`;
    childrenContainer.id = `children-${folder.id}`;

    subFolders.forEach(sub => {
      const subFolderData = allFolders.find(f => f.id === sub.id);
      if (subFolderData) {
        const childNode = buildFolderTreeNode(subFolderData);
        childrenContainer.appendChild(childNode);
      }
    });

    nodeEl.appendChild(childrenContainer);
  }

  return nodeEl;
}

// 自动向父级展开树以显示当前选中目录
function expandToFolder(folderId) {
  let currentId = folderId;
  while (currentId) {
    const folder = allFolders.find(f => f.id === currentId);
    if (folder) {
      expandedFolderIds.add(folder.id); // 保证其状态被记录在展开缓存中
      const nodeEl = document.getElementById(`node-${folder.id}`);
      if (nodeEl) {
        const toggle = nodeEl.querySelector(`.folder-item[data-id="${folder.id}"] > .folder-toggle`);
        const childrenContainer = document.getElementById(`children-${folder.id}`);
        if (toggle && childrenContainer) {
          toggle.classList.add('expanded');
          toggle.textContent = '▲';
          childrenContainer.classList.remove('collapsed');
        }
      }
      currentId = folder.parentId;
    } else {
      break;
    }
  }
}

// ================= 主运行模式切换 =================
function setMainMode(mode) {
  if (currentMode === mode) return;
  currentMode = mode;
  localStorage.setItem('mainMode', mode);

  document.querySelectorAll('.mode-btn').forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const sidebar = document.getElementById('sidebar');

  if (mode === 'visual') {
    if (sidebar) sidebar.classList.add('collapsed');
    loadVisualRootLayer();
  } else {
    if (sidebar) sidebar.classList.remove('collapsed');
    if (!activeFolderId) activeFolderId = '1';
    selectFolder(activeFolderId);
  }
}

function refreshMainView() {
  if (currentMode === 'visual') {
    loadVisualRootLayer();
  } else {
    selectFolder(activeFolderId || '1');
  }
}

// 渲染无界视觉首层
function loadVisualRootLayer() {
  closeFolderModal();

  // 动态获取所有的根级目录（避免不同账户或浏览器下的根级目录 ID 不为 '1', '2', '3'）
  const rootFoldersList = allFolders.filter(folder => 
    folder.parentId === '0' || 
    folder.parentId === 'root' || 
    !allFolders.some(f => f.id === folder.parentId)
  );

  let rootFolders = [];
  let rootBookmarks = [];

  rootFoldersList.forEach(folder => {
    if (foldersCache[folder.id]) {
      rootFolders = rootFolders.concat(foldersCache[folder.id]);
    }
    if (bookmarksCache[folder.id]) {
      rootBookmarks = rootBookmarks.concat(bookmarksCache[folder.id]);
    }
  });

  const statsEl = document.getElementById('folder-stats');
  if (statsEl) {
    statsEl.textContent = i18n[currentLang].folderStatsVisual
      .replace('{folders}', rootFolders.length)
      .replace('{links}', rootBookmarks.length);
  }

  renderItems(rootFolders, rootBookmarks, 'cards-grid');
}

// 选中具体目录
function selectFolder(id, fromSidebar = false) {
  activeFolderId = id;
  
  if (id) {
    if (fromSidebar) {
      // 侧边栏点击：只展开其所有父级以展示结构线，不改变当前选中目录自身的折叠状态（防止与下面的折叠切换逻辑冲突）
      const folder = allFolders.find(f => f.id === id);
      if (folder && folder.parentId) {
        expandToFolder(folder.parentId);
      }
    } else {
      // 外部卡片点击或初始化：强制将自身及其父目录全部展开
      expandToFolder(id);
    }
  }
  
  document.querySelectorAll('.folder-item').forEach(item => {
    if (item.dataset.id === id) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const statsEl = document.getElementById('folder-stats');
  const t = i18n[currentLang];

  if (id === 'all') {
    // "所有书签"已移除，但保留分支以防被其他代码引用
    // 降级为显示书签栏内容
    id = '1';
    activeFolderId = '1';
  }

  if (statsEl) {
    const foldersCount = (foldersCache[id] || []).length;
    const linksCount = (bookmarksCache[id] || []).length;
    statsEl.textContent = t.folderStatsFolder.replace('{folders}', foldersCount).replace('{links}', linksCount);
  }
  renderItems(foldersCache[id] || [], bookmarksCache[id] || [], 'cards-grid');
  updateBackFolderButtons();
}

// 统一渲染网格列表
function renderItems(subFolders, bookmarks, targetContainerId = 'cards-grid') {
  const grid = document.getElementById(targetContainerId);
  if (!grid) return;

  grid.innerHTML = '';
  grid.scrollTop = 0;

  const searchInput = document.getElementById('search-input');
  const googleSearchInput = document.getElementById('google-search-input');
  const isSearching = (searchInput && searchInput.value.trim() !== '') || 
                      (googleSearchInput && googleSearchInput.value.trim() !== '');

  if (isSearching && subFolders.length === 0 && bookmarks.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${SVGS.empty}</div>
        <p>${i18n[currentLang].emptyState}</p>
      </div>
    `;
    return;
  }

  const animationOffset = isSearching ? 0 : 1;

  // 1. 如果非搜索状态，在每一层首位追加“新建文件夹”卡片
  if (!isSearching) {
    const newFolderCard = document.createElement('div');
    newFolderCard.className = 'new-folder-card';
    newFolderCard.innerHTML = `
      <div class="new-folder-card-icon">${SVGS.add}</div>
      <div class="new-folder-card-label">${currentLang.startsWith('zh') ? '新建文件夹' : 'New Folder'}</div>
    `;
    
    newFolderCard.addEventListener('click', () => {
      let parentId = '1';
      if (targetContainerId === 'modal-cards-grid') {
        parentId = modalActiveFolderId || '1';
      } else if (currentMode === 'manage') {
        parentId = activeFolderId || '1';
      } else {
        parentId = '1';
      }
      
      const addGlobalBtn = document.getElementById('add-folder-global-btn');
      if (addGlobalBtn) {
        if (targetContainerId === 'modal-cards-grid') {
          modalActiveFolderId = parentId;
        } else {
          activeFolderId = parentId;
        }
        addGlobalBtn.click();
      }
    });
    
    grid.appendChild(newFolderCard);
  }

  // 2. 优先渲染子文件夹
  subFolders.forEach((folder, index) => {
    const card = document.createElement('div');
    card.className = 'folder-card';
    card.dataset.id = folder.id;
    card.style.animationDelay = `${(index + animationOffset) * 20}ms`;

    const subItemCount = (foldersCache[folder.id] || []).length + (bookmarksCache[folder.id] || []).length;
    const textBadge = i18n[currentLang].folderCardCount.replace('{count}', subItemCount);

    const isSystemFolder = folder.id === '0' || folder.id === '1' || folder.id === '2' || folder.id === '3' || folder.parentId === '0' || folder.parentId === 'root';

    card.innerHTML = `
      <div class="card-actions" style="position: absolute; top: 12px; right: 12px; display: flex; gap: 6px; opacity: 0; transition: opacity 0.2s ease; z-index: 10;">
        <button class="card-action-btn add-subfolder-btn" title="${currentLang.startsWith('zh') ? '新建子文件夹' : 'Create Subfolder'}" data-id="${folder.id}">
          <svg style="width:13px;height:13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        ${!isSystemFolder ? `
        <button class="card-action-btn delete-folder-btn" title="${currentLang.startsWith('zh') ? '删除此文件夹' : 'Delete Folder'}" data-id="${folder.id}">
          <svg style="width:13px;height:13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
        ` : ''}
      </div>
      <div class="card-top">
        <div class="favicon-wrapper">
          <span class="favicon-fallback">${SVGS.folder}</span>
        </div>
        <div class="bookmark-title">${folder.title || '...'}</div>
      </div>
      <div class="folder-card-indicator">${textBadge}</div>
    `;

    // 拖拽自身
    card.draggable = true;
    card.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      e.dataTransfer.setData('folderId', folder.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      clearTimeout(dragHoverTimer);
      currentHoveredFolderId = null;
    });

    // 拖拽悬停自动展开
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('drag-over');

      if (currentHoveredFolderId !== folder.id) {
        clearTimeout(dragHoverTimer);
        currentHoveredFolderId = folder.id;
        dragHoverTimer = setTimeout(() => {
          if (targetContainerId === 'modal-cards-grid') {
            navigateInsideModal(folder.id, folder.title);
          } else {
            openFolderModal(folder.id, folder.title);
          }
        }, 800);
      }
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
      if (currentHoveredFolderId === folder.id) {
        clearTimeout(dragHoverTimer);
        currentHoveredFolderId = null;
      }
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      clearTimeout(dragHoverTimer);
      currentHoveredFolderId = null;

      const bookmarkId = e.dataTransfer.getData('bookmarkId');
      const draggedFolderId = e.dataTransfer.getData('folderId');
      if (bookmarkId && bookmarkId !== folder.id) {
        moveBookmark(bookmarkId, folder.id);
      } else if (draggedFolderId && draggedFolderId !== folder.id) {
        if (!isDescendant(draggedFolderId, folder.id)) {
          moveFolder(draggedFolderId, folder.id);
        }
      }
    });

    card.addEventListener('click', (e) => {
      // 排除点击动作按钮
      if (e.target.closest('.card-action-btn')) return;

      e.preventDefault();
      if (targetContainerId === 'modal-cards-grid') {
        navigateInsideModal(folder.id, folder.title);
      } else {
        if (currentMode === 'manage') {
          selectFolder(folder.id);
        } else {
          openFolderModal(folder.id, folder.title);
        }
      }
    });

    grid.appendChild(card);
  });

  // 3. 渲染网页书签
  bookmarks.forEach((bookmark, index) => {
    const card = document.createElement('a');
    card.className = 'bookmark-card';
    card.href = bookmark.url;
    card.target = '_blank';
    card.title = bookmark.title;
    card.style.animationDelay = `${(subFolders.length + index + animationOffset) * 20}ms`;

    card.draggable = true;
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('bookmarkId', bookmark.id);
      card.classList.add('dragging');
      
      if (targetContainerId === 'modal-cards-grid') {
        const modal = document.getElementById('folder-modal');
        if (modal) modal.style.opacity = '0.45';
      }
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      clearTimeout(dragHoverTimer);
      currentHoveredFolderId = null;
      
      const modal = document.getElementById('folder-modal');
      if (modal) modal.style.opacity = '1';
    });

    let hostname = '';
    try {
      hostname = new URL(bookmark.url).hostname;
    } catch (err) {
      hostname = bookmark.url.startsWith('javascript:') ? 'Script Link' : 'Local Link';
    }

    let faviconUrl = '';
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      const urlObj = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
      urlObj.searchParams.set('pageUrl', bookmark.url);
      urlObj.searchParams.set('size', '32');
      faviconUrl = urlObj.toString();
    } else {
      faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    }

    const initial = bookmark.title ? bookmark.title.charAt(0).toUpperCase() : '?';

    card.innerHTML = `
      <div class="card-top">
        <div class="favicon-wrapper">
          <img class="favicon-img" src="${faviconUrl}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" alt="">
          <span class="favicon-fallback" style="display: none;">${initial}</span>
        </div>
        <div class="bookmark-title">${bookmark.title || 'No Title'}</div>
      </div>
      <div class="card-bottom">${hostname}</div>
    `;

    grid.appendChild(card);
  });
}

// 移动文件夹
function moveFolder(draggedFolderId, targetFolderId) {
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    chrome.bookmarks.move(draggedFolderId, { parentId: targetFolderId }, () => {
      loadBookmarksTree();
    });
  } else {
    alert(`Mock mode: Moved folder ${draggedFolderId} to target ${targetFolderId}`);
  }
}

// 检查是否为后代节点以防止循环移动
function isDescendant(parentId, childId) {
  let temp = allFolders.find(f => f.id === childId);
  while (temp && temp.parentId) {
    if (temp.parentId === parentId) return true;
    temp = allFolders.find(f => f.id === temp.parentId);
  }
  return false;
}

// 删除文件夹
function handleDeleteFolder(folderId) {
  const folder = allFolders.find(f => f.id === folderId);
  if (!folder) return;

  const isZh = currentLang.startsWith('zh');
  const confirmMsg = isZh 
    ? `确定要删除文件夹 "${folder.title}" 及其包含的所有书签吗？` 
    : `Are you sure you want to delete the folder "${folder.title}" and all its bookmarks?`;

  if (confirm(confirmMsg)) {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.removeTree(folderId, () => {
        loadBookmarksTree();
      });
    } else {
      // Mock mode
      allFolders = allFolders.filter(f => f.id !== folderId);
      delete foldersCache[folderId];
      delete bookmarksCache[folderId];
      // remove from parent
      for (const parentId in foldersCache) {
        foldersCache[parentId] = foldersCache[parentId].filter(f => f.id !== folderId);
      }
      renderSidebar();
      refreshMainView();
    }
  }
}

// 创建文件夹
function handleCreateSubfolder(parentFolderId) {
  const isZh = currentLang.startsWith('zh');
  const promptMsg = isZh ? '请输入新建文件夹的名称：' : 'Please enter new folder name:';
  const defaultName = isZh ? '新建文件夹' : 'New Folder';
  
  const folderName = prompt(promptMsg, defaultName);
  if (folderName && folderName.trim()) {
    const finalTitle = folderName.trim();
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.create({
        parentId: parentFolderId,
        title: finalTitle
      }, () => {
        loadBookmarksTree();
      });
    } else {
      // Mock mode
      const newId = `custom-${Date.now()}`;
      allFolders.push({
        id: newId,
        title: finalTitle,
        parentId: parentFolderId
      });
      if (!foldersCache[parentFolderId]) {
        foldersCache[parentFolderId] = [];
      }
      foldersCache[parentFolderId].push({ id: newId, title: finalTitle });
      foldersCache[newId] = [];
      bookmarksCache[newId] = [];
      renderSidebar();
      refreshMainView();
    }
  }
}

// 移动书签核心逻辑
function moveBookmark(bookmarkId, targetFolderId) {
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    chrome.bookmarks.move(bookmarkId, { parentId: targetFolderId }, () => {
      loadBookmarksTree();
    });
  } else {
    // Mock 本地移动
    let foundBookmark = null;
    
    for (const folderId in bookmarksCache) {
      if (folderId === 'all') continue;
      const index = bookmarksCache[folderId].findIndex(b => b.id === bookmarkId);
      if (index !== -1) {
        foundBookmark = bookmarksCache[folderId][index];
        bookmarksCache[folderId].splice(index, 1);
        break;
      }
    }

    if (foundBookmark) {
      if (!bookmarksCache[targetFolderId]) {
        bookmarksCache[targetFolderId] = [];
      }
      bookmarksCache[targetFolderId].push(foundBookmark);

      const allBookmarks = getAllFlatBookmarks();
      bookmarksCache['all'] = allBookmarks;

      renderSidebar();
      refreshMainView();
      
      const modalOverlay = document.getElementById('folder-modal-overlay');
      if (modalOverlay && modalOverlay.classList.contains('active') && modalActiveFolderId) {
        loadModalFolderContent(modalActiveFolderId);
      }
    }
  }
}

// ================= 主题控制 (性能优化：瞬间秒切消除卡顿) =================
function setTheme(newTheme) {
  theme = newTheme;

  // 【性能调优】：临时挂载禁用 transition 的类，消除百余张卡片背景/阴影/边框渐变动画造成的严重卡顿
  document.body.classList.add('disable-transitions');
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // 强制触发重绘 (reflow) 使其立刻应用新变量而不生成 CSS 过渡
  document.body.offsetHeight;

  // 下一帧立刻移去类名，不影响后续 Hover 等常规动作
  requestAnimationFrame(() => {
    document.body.classList.remove('disable-transitions');
  });

  // 收起下拉
  const container = document.getElementById('theme-dropdown-container');
  if (container) container.classList.remove('active');
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.classList.remove('active');

  renderThemeSelector();
}

// ================= 语言和主题下拉菜单控制 =================
function renderLanguageSelector() {
  const menu = document.getElementById('lang-dropdown-menu');
  if (!menu) return;

  menu.innerHTML = '';
  LANGUAGES_LIST.forEach(lang => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    if (lang.id === currentLang) item.classList.add('active');
    item.textContent = lang.name;
    item.addEventListener('click', () => {
      selectLanguage(lang.id);
    });
    menu.appendChild(item);
  });
}

function selectLanguage(langId) {
  currentLang = langId;
  localStorage.setItem('language', langId);
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ language: langId });
  }

  // 收起下拉
  const container = document.getElementById('lang-dropdown-container');
  if (container) container.classList.remove('active');
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.classList.remove('active');

  applyTranslations();
  renderLanguageSelector();
  renderThemeSelector(); // 重新渲染主题列表以更新语言翻译
  refreshMainView();
  renderSearchEngineSelector();
}

function renderThemeSelector() {
  const menu = document.getElementById('theme-dropdown-menu');
  if (!menu) return;

  menu.innerHTML = '';
  THEMES_LIST.forEach(t => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    if (t.id === theme) item.classList.add('active');
    
    // 主题原点指示色
    const dot = document.createElement('span');
    dot.className = 'theme-dot';
    dot.style.backgroundColor = t.color;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = currentLang.startsWith('zh') ? t.nameZh : t.name;

    item.appendChild(dot);
    item.appendChild(textSpan);
    
    item.addEventListener('click', () => {
      setTheme(t.id);
    });
    menu.appendChild(item);
  });
}

// ================= 壁纸与幻灯片核心业务逻辑 (应用到独立底层图层) =================
function applyBackgroundSettings() {
  // 1. 保存壁纸设置
  localStorage.setItem('wallpaperEnabled', wallpaperEnabled);
  localStorage.setItem('slideshowEnabled', slideshowEnabled);
  localStorage.setItem('wallpaperFit', wallpaperFit);
  localStorage.setItem('wallpaperOpacity', wallpaperOpacity);
  localStorage.setItem('currentBgIndex', currentBgIndex);
  localStorage.setItem('customBgList', JSON.stringify(customBgList));

  // 2. 状态映射到 body，便于切换磨砂模糊等效果
  const hasWallpaperState = wallpaperEnabled && customBgList.length > 0;
  document.body.classList.toggle('has-wallpaper', hasWallpaperState);

  // 3. 应用背景与适应样式到独立的 wallpaper-overlay 节点上
  const wpOverlay = document.getElementById('wallpaper-overlay');
  const wpMask = document.getElementById('wallpaper-mask');
  if (wpOverlay) {
    if (hasWallpaperState) {
      if (currentBgIndex >= customBgList.length) {
        currentBgIndex = 0;
      }
      const currentBg = customBgList[currentBgIndex];
      wpOverlay.style.backgroundImage = `url(${currentBg})`;
      wpOverlay.style.opacity = 1; // 独立背景层始终保持 100% 不透明度
      
      // 平铺模式映射
      if (wallpaperFit === 'cover') {
        wpOverlay.style.backgroundSize = 'cover';
        wpOverlay.style.backgroundRepeat = 'no-repeat';
      } else if (wallpaperFit === 'contain') {
        wpOverlay.style.backgroundSize = 'contain';
        wpOverlay.style.backgroundRepeat = 'no-repeat';
      } else if (wallpaperFit === 'repeat') {
        wpOverlay.style.backgroundSize = 'auto';
        wpOverlay.style.backgroundRepeat = 'repeat';
      }
    } else {
      wpOverlay.style.backgroundImage = 'none';
      wpOverlay.style.opacity = 0;
    }
  }

  // 独立控制遮罩层的透明度，彻底避免触发全局布局计算，保障性能
  if (wpMask) {
    if (hasWallpaperState) {
      const maskOpacity = 0.90 - (wallpaperOpacity / 100) * 0.90;
      wpMask.style.opacity = maskOpacity;
    } else {
      wpMask.style.opacity = 0;
    }
  }

  // 4. 重载自动幻灯定时器
  clearInterval(slideshowInterval);
  if (hasWallpaperState && slideshowEnabled && customBgList.length > 1) {
    slideshowInterval = setInterval(nextSlide, 12000); // 12秒切图
  }

  // 5. 更新缩略图网络
  renderThumbnails();
}

// ================= 搜索引擎动态渲染与更新 =================
function renderSearchEngineSelector() {
  const dropdown = document.getElementById('engine-dropdown');
  const currentIconEl = document.getElementById('engine-current-icon');
  const googleDropdown = document.getElementById('google-engine-dropdown');
  const googleCurrentIconEl = document.getElementById('google-engine-current-icon');
  
  if (!dropdown || !currentIconEl) return;

  dropdown.innerHTML = '';
  if (googleDropdown) googleDropdown.innerHTML = '';

  // 默认网页搜索引擎列表
  const defaultEngines = [
    { id: 'browser', name: currentLang.startsWith('zh') ? '默认浏览器' : 'Default Browser', iconSvg: SVGS.world },
    { id: 'google', name: 'Google', iconSvg: SVGS.search },
    { id: 'bing', name: 'Bing', iconSvg: SVGS.search }
  ];

  // 合并默认和自定义搜索引擎
  const allEngines = [...defaultEngines, ...customEngines];

  // 校验当前选中的引擎是否有效，失效则回退 browser (默认浏览器)
  const activeEngineExists = allEngines.some(e => e.id === currentSearchEngine);
  if (!activeEngineExists) {
    currentSearchEngine = 'browser';
    localStorage.setItem('searchEngine', 'browser');
  }

  // 渲染所有引擎选项
  allEngines.forEach(engine => {
    const iconHtml = engine.iconSvg || `<span>${engine.icon || '🔍'}</span>`;
    
    // 1. 经典下拉菜单选项
    const opt = document.createElement('div');
    opt.className = 'engine-option';
    if (engine.id === currentSearchEngine) {
      opt.classList.add('active');
      currentIconEl.innerHTML = iconHtml; // 更新当前选中的图标
    }
    opt.dataset.engine = engine.id;
    if (engine.id.startsWith('custom-')) {
      opt.innerHTML = `
        <div class="engine-info-wrap">
          <span class="engine-icon-wrapper">${iconHtml}</span> <span>${engine.name}</span>
        </div>
        <span class="engine-delete-btn" title="${currentLang.startsWith('zh') ? '删除此引擎' : 'Delete Engine'}">&times;</span>
      `;
      opt.querySelector('.engine-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCustomSearchEngine(engine.id);
      });
    } else {
      opt.innerHTML = `<span class="engine-icon-wrapper">${iconHtml}</span> <span>${engine.name}</span>`;
    }
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      selectSearchEngine(engine.id);
    });
    dropdown.appendChild(opt);

    // 2. Google 下拉菜单选项
    if (googleDropdown && googleCurrentIconEl) {
      const gOpt = document.createElement('div');
      gOpt.className = 'engine-option';
      if (engine.id === currentSearchEngine) {
        gOpt.classList.add('active');
        googleCurrentIconEl.innerHTML = iconHtml;
      }
      gOpt.dataset.engine = engine.id;
      if (engine.id.startsWith('custom-')) {
        gOpt.innerHTML = `
          <div class="engine-info-wrap">
            <span class="engine-icon-wrapper">${iconHtml}</span> <span>${engine.name}</span>
          </div>
          <span class="engine-delete-btn" title="${currentLang.startsWith('zh') ? '删除此引擎' : 'Delete Engine'}">&times;</span>
        `;
        gOpt.querySelector('.engine-delete-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomSearchEngine(engine.id);
        });
      } else {
        gOpt.innerHTML = `<span class="engine-icon-wrapper">${iconHtml}</span> <span>${engine.name}</span>`;
      }
      gOpt.addEventListener('click', (e) => {
        e.stopPropagation();
        selectSearchEngine(engine.id);
      });
      googleDropdown.appendChild(gOpt);
    }
  });

  // 追加“自定义新增按钮”
  const addBtn = document.createElement('div');
  addBtn.className = 'engine-option custom-add-btn';
  addBtn.innerHTML = `<span class="engine-icon-wrapper">${SVGS.add}</span> <span>${currentLang.startsWith('zh') ? '自定义追加' : 'Add Custom'}</span>`;
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    promptAddCustomEngine();
  });
  dropdown.appendChild(addBtn);

  if (googleDropdown) {
    const gAddBtn = document.createElement('div');
    gAddBtn.className = 'engine-option custom-add-btn';
    gAddBtn.innerHTML = `<span class="engine-icon-wrapper">${SVGS.add}</span> <span>${currentLang.startsWith('zh') ? '自定义追加' : 'Add Custom'}</span>`;
    gAddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      promptAddCustomEngine();
    });
    googleDropdown.appendChild(gAddBtn);
  }

  // 动态更新搜索输入框 Placeholder
  const searchInput = document.getElementById('search-input');
  const googleSearchInput = document.getElementById('google-search-input');
  const activeEngine = allEngines.find(e => e.id === currentSearchEngine);
  const name = activeEngine ? activeEngine.name : 'Web';
  const placeholderText = currentLang.startsWith('zh') ? `在 ${name} 或书签中搜索...` : `Search in ${name} or bookmarks...`;
  
  if (searchInput) searchInput.placeholder = placeholderText;
  if (googleSearchInput) googleSearchInput.placeholder = placeholderText;
}

function selectSearchEngine(engineId) {
  currentSearchEngine = engineId;
  localStorage.setItem('searchEngine', engineId);
  
  // 收起下拉菜单
  const selector = document.getElementById('search-engine-selector');
  if (selector) selector.classList.remove('active');
  const googleSelector = document.getElementById('google-search-engine-selector');
  if (googleSelector) googleSelector.classList.remove('active');

  renderSearchEngineSelector();

  // 聚焦当前显示的输入框
  const searchInput = document.getElementById('search-input');
  if (searchInput && window.getComputedStyle(searchInput).display !== 'none') {
    searchInput.focus();
  }
  const googleSearchInput = document.getElementById('google-search-input');
  if (googleSearchInput && window.getComputedStyle(googleSearchInput).display !== 'none') {
    googleSearchInput.focus();
  }
}

// 自定义搜索引擎添加弹窗 (带智能自动纠错与详尽实例引导)
function promptAddCustomEngine() {
  const name = prompt(
    currentLang.startsWith('zh') 
      ? '请输入搜索引擎名称 (例如: B站, 淘宝, GitHub):' 
      : 'Enter search engine name (e.g. Bilibili, Taobao, GitHub):'
  );
  if (!name) return;

  // 详尽的范例引导提示
  const examplePrompt = currentLang.startsWith('zh')
    ? '请输入搜索 URL（使用 %s 代替你的搜索词）\n\n常用网站范例：\n- 百度：https://www.baidu.com/s?wd=%s\n- 淘宝：https://s.taobao.com/search?q=%s\n- B站：https://search.bilibili.com/all?keyword=%s\n- 知乎：https://www.zhihu.com/search?q=%s'
    : 'Enter search URL (use %s for query)\n\nExamples:\n- Google: https://www.google.com/search?q=%s\n- GitHub: https://github.com/search?q=%s\n- YouTube: https://www.youtube.com/results?search_query=%s';

  const url = prompt(examplePrompt);
  if (!url) return;

  let finalUrl = url.trim();
  
  // 【超级友好优化】：如果用户只输入了域名或主页，自动根据常见大厂域名补全其搜索查询字段
  if (!finalUrl.includes('%s')) {
    const lowerUrl = finalUrl.toLowerCase();
    if (lowerUrl.includes('baidu.com')) {
      finalUrl = 'https://www.baidu.com/s?wd=%s';
    } else if (lowerUrl.includes('google.com')) {
      finalUrl = 'https://www.google.com/search?q=%s';
    } else if (lowerUrl.includes('bing.com')) {
      finalUrl = 'https://www.bing.com/search?q=%s';
    } else if (lowerUrl.includes('github.com')) {
      finalUrl = 'https://github.com/search?q=%s';
    } else if (lowerUrl.includes('bilibili.com')) {
      finalUrl = 'https://search.bilibili.com/all?keyword=%s';
    } else if (lowerUrl.includes('taobao.com')) {
      finalUrl = 'https://s.taobao.com/search?q=%s';
    } else if (lowerUrl.includes('zhihu.com')) {
      finalUrl = 'https://www.zhihu.com/search?type=content&q=%s';
    } else if (lowerUrl.includes('youtube.com')) {
      finalUrl = 'https://www.youtube.com/results?search_query=%s';
    }
  }

  // 再次校验，如果仍然缺失占位符，弹出友好警告格式
  if (!finalUrl.includes('%s')) {
    const errorMsg = currentLang.startsWith('zh')
      ? '添加失败！输入的 URL 必须包含 %s 占位符，以便我们能将你的搜索词填入链接中。\n\n正确范例：https://www.baidu.com/s?wd=%s'
      : 'Failed! URL must contain %s placeholder to insert your search query.\n\nCorrect Example: https://www.google.com/search?q=%s';
    alert(errorMsg);
    return;
  }

  const newEngine = {
    id: `custom-${Date.now()}`,
    name: name.trim(),
    url: finalUrl,
    icon: '🌐'
  };

  customEngines.push(newEngine);
  localStorage.setItem('customSearchEngines', JSON.stringify(customEngines));

  selectSearchEngine(newEngine.id);
}

// 删除自定义搜索引擎
function deleteCustomSearchEngine(engineId) {
  customEngines = customEngines.filter(e => e.id !== engineId);
  localStorage.setItem('customSearchEngines', JSON.stringify(customEngines));

  // 如果被删的恰好是当前选中的引擎，则回退为默认浏览器搜索引擎
  if (currentSearchEngine === engineId) {
    selectSearchEngine('browser');
  } else {
    renderSearchEngineSelector();
  }
}

// 执行网页搜索
function triggerWebSearch(query) {
  if (currentSearchEngine === 'browser') {
    if (typeof chrome !== 'undefined' && chrome.search && chrome.search.query) {
      chrome.search.query({ text: query, disposition: 'NEW_TAB' });
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  } else if (currentSearchEngine === 'google') {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  } else if (currentSearchEngine === 'bing') {
    window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank');
  } else {
    // 自定义搜索引擎
    const engine = customEngines.find(e => e.id === currentSearchEngine);
    if (engine && engine.url) {
      const searchUrl = engine.url.replace('%s', encodeURIComponent(query));
      window.open(searchUrl, '_blank');
    }
  }
}

// 幻灯下一张
function nextSlide() {
  if (customBgList.length <= 1) return;
  currentBgIndex = (currentBgIndex + 1) % customBgList.length;
  localStorage.setItem('currentBgIndex', currentBgIndex);
  
  const currentBg = customBgList[currentBgIndex];
  const wpOverlay = document.getElementById('wallpaper-overlay');
  if (wpOverlay) {
    wpOverlay.style.backgroundImage = `url(${currentBg})`;
  }

  // 刷新高亮缩略图状态
  const thumbs = document.querySelectorAll('.thumb-wrapper');
  thumbs.forEach((t, index) => {
    if (index === currentBgIndex) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
}

// 处理上传
function handleBgUploads(files) {
  const pendingFiles = Array.from(files);
  let processedCount = 0;

  pendingFiles.forEach(file => {
    if (customBgList.length >= 6) {
      alert(currentLang.startsWith('zh') ? "最多仅支持添加 6 张幻灯片背景哦！" : "Maximum 6 wallpapers supported!");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1920;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          customBgList.push(compressedDataUrl);
          
          processedCount++;
          if (processedCount === pendingFiles.length || customBgList.length >= 6) {
            currentBgIndex = customBgList.length - 1; 
            applyBackgroundSettings();
          }
        } catch (err) {
          console.error("Canvas compression error", err);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// 删除壁纸
function deleteWallpaper(index, e) {
  if (e) e.stopPropagation();
  
  customBgList.splice(index, 1);
  if (currentBgIndex >= customBgList.length) {
    currentBgIndex = 0;
  }
  applyBackgroundSettings();
}

// 渲染缩略图
function renderThumbnails() {
  const grid = document.getElementById('bg-thumbs-grid');
  if (!grid) return;

  grid.innerHTML = '';
  customBgList.forEach((bg, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'thumb-wrapper';
    if (index === currentBgIndex) wrapper.classList.add('active');
    
    wrapper.innerHTML = `
      <img src="${bg}" class="thumb-img">
      <button class="thumb-delete">&times;</button>
    `;

    wrapper.addEventListener('click', () => {
      currentBgIndex = index;
      applyBackgroundSettings();
    });

    wrapper.querySelector('.thumb-delete').addEventListener('click', (e) => {
      deleteWallpaper(index, e);
    });

    grid.appendChild(wrapper);
  });
}

// ================= 视图模式控制 =================
function setViewMode(mode) {
  viewMode = mode;
  localStorage.setItem('viewMode', mode);

  // 1. 更新按钮高亮
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  const grid = document.getElementById('cards-grid');
  const modalGrid = document.getElementById('modal-cards-grid');

  // 2. 启用淡出过渡效果，防止闪烁
  if (grid) grid.classList.add('view-switching');
  if (modalGrid) modalGrid.classList.add('view-switching');

  // 120ms 后执行类名变更并淡入，消除布局跃变，保障 60fps 极速响应
  setTimeout(() => {
    if (grid) {
      grid.className = 'cards-grid';
      grid.classList.add(`view-mode-${mode}`);
      grid.classList.remove('view-switching');
    }
    if (modalGrid) {
      modalGrid.className = 'cards-grid';
      modalGrid.classList.add(`view-mode-${mode}`);
      modalGrid.classList.remove('view-switching');
    }
  }, 120);
}

// ================= 弹窗管理 =================
function openFolderModal(folderId, folderTitle) {
  modalRootFolderId = folderId;
  modalActiveFolderId = folderId;

  const modalTitle = document.getElementById('modal-folder-title');
  if (modalTitle) modalTitle.textContent = folderTitle;

  const modalBack = document.getElementById('modal-back-btn');
  if (modalBack) modalBack.style.display = 'none';

  loadModalFolderContent(folderId);

  const overlay = document.getElementById('folder-modal-overlay');
  if (overlay) overlay.classList.add('active');
}

function navigateInsideModal(folderId, folderTitle) {
  modalActiveFolderId = folderId;

  const modalTitle = document.getElementById('modal-folder-title');
  if (modalTitle) modalTitle.textContent = folderTitle;

  const modalBack = document.getElementById('modal-back-btn');
  if (modalBack) modalBack.style.display = 'inline-block';

  loadModalFolderContent(folderId);
}

function loadModalFolderContent(folderId) {
  const modalGrid = document.getElementById('modal-cards-grid');
  if (modalGrid) {
    modalGrid.className = 'cards-grid';
    modalGrid.classList.add(`view-mode-${viewMode}`);
  }
  
  renderItems(foldersCache[folderId] || [], bookmarksCache[folderId] || [], 'modal-cards-grid');
}

function handleModalBack() {
  if (modalActiveFolderId === modalRootFolderId) return;

  const currentFolder = allFolders.find(f => f.id === modalActiveFolderId);
  if (currentFolder && currentFolder.parentId) {
    const parentFolderId = currentFolder.parentId;
    
    if (parentFolderId === modalRootFolderId) {
      document.getElementById('modal-back-btn').style.display = 'none';
    }

    let parentTitle = i18n[currentLang].modalFolderTitle;
    if (parentFolderId === '1') parentTitle = currentLang.startsWith('zh') ? '书签栏' : 'Bookmark Bar';
    else if (parentFolderId === '2') parentTitle = currentLang.startsWith('zh') ? '其他书签' : 'Other Bookmarks';
    else {
      const parentNode = allFolders.find(f => f.id === parentFolderId);
      if (parentNode) parentTitle = parentNode.title;
    }

    modalActiveFolderId = parentFolderId;
    document.getElementById('modal-folder-title').textContent = parentTitle;
    loadModalFolderContent(parentFolderId);
  }
}

function closeFolderModal() {
  const overlay = document.getElementById('folder-modal-overlay');
  if (overlay) overlay.classList.remove('active');
  modalRootFolderId = null;
  modalActiveFolderId = null;
}

// ================= 事件监听 =================
function setupEventListeners() {
  // 控制中心：直接展开，不使用遮罩层
  const collapseToggle = document.getElementById('google-collapse-toggle-btn');
  if (collapseToggle) collapseToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('google-collapse-board-open');
    const text = document.getElementById('google-collapse-toggle-text');
    if (text) text.textContent = open
      ? (currentLang.startsWith('zh') ? '收起书签看板' : 'Hide bookmark board')
      : (currentLang.startsWith('zh') ? '展开书签看板' : 'Show bookmark board');
    collapseToggle.querySelector('.toggle-arrow-icon')?.style.setProperty('transform', open ? 'rotate(180deg)' : 'rotate(0deg)');
  });

  const drawerModeSwitcher = document.getElementById('drawer-mode-switcher');
  if (drawerModeSwitcher) drawerModeSwitcher.addEventListener('click', (event) => {
    const btn = event.target.closest('.drawer-opt-btn[data-mode]');
    if (btn) setMainMode(btn.dataset.mode);
    syncDrawerControls();
  });

  const drawerLayoutSwitcher = document.getElementById('drawer-layout-switcher');
  if (drawerLayoutSwitcher) drawerLayoutSwitcher.addEventListener('click', (event) => {
    const btn = event.target.closest('.drawer-opt-btn[data-layout]');
    if (btn) setSearchLayout(btn.dataset.layout);
  });

  const drawerViewSwitcher = document.getElementById('drawer-view-switcher');
  if (drawerViewSwitcher) drawerViewSwitcher.addEventListener('click', (event) => {
    const btn = event.target.closest('.drawer-opt-btn[data-view]');
    if (btn) setViewMode(btn.dataset.view);
    syncDrawerControls();
  });

  const drawerLangSelect = document.getElementById('drawer-lang-select');
  if (drawerLangSelect) drawerLangSelect.addEventListener('change', (event) => {
    selectLanguage(event.target.value);
    syncDrawerControls();
  });

  const drawerBgEnable = document.getElementById('drawer-bg-enable-toggle');
  if (drawerBgEnable) drawerBgEnable.addEventListener('change', (event) => {
    wallpaperEnabled = event.target.checked;
    applyBackgroundSettings();
  });
  const drawerBgSlideshow = document.getElementById('drawer-bg-slideshow-toggle');
  if (drawerBgSlideshow) drawerBgSlideshow.addEventListener('change', (event) => {
    slideshowEnabled = event.target.checked;
    applyBackgroundSettings();
  });
  const drawerBgFit = document.getElementById('drawer-bg-fit-select');
  if (drawerBgFit) drawerBgFit.addEventListener('change', (event) => {
    wallpaperFit = event.target.value;
    applyBackgroundSettings();
  });
  const drawerBgOpacity = document.getElementById('drawer-bg-opacity-slider');
  if (drawerBgOpacity) drawerBgOpacity.addEventListener('input', (event) => {
    wallpaperOpacity = Number(event.target.value);
    const value = document.getElementById('drawer-bg-opacity-val');
    if (value) value.textContent = `${wallpaperOpacity}%`;
    applyBackgroundSettings();
  });
  const drawerUploadTrigger = document.getElementById('drawer-bg-upload-trigger');
  const drawerFileInput = document.getElementById('drawer-bg-file-inputs');
  if (drawerUploadTrigger && drawerFileInput) {
    drawerUploadTrigger.addEventListener('click', () => drawerFileInput.click());
    drawerFileInput.addEventListener('change', event => {
      if (event.target.files.length) handleBgUploads(event.target.files);
    });
  }
  
  const googleAddFolderBtn = document.getElementById('google-add-folder-btn');
  if (googleAddFolderBtn) {
    const addGlobalBtn = document.getElementById('add-folder-global-btn');
    if (addGlobalBtn) {
      googleAddFolderBtn.addEventListener('click', () => addGlobalBtn.click());
    }
  }

  syncDrawerControls();

  // 文件夹增删及事件委托监听
  const folderList = document.getElementById('folder-list');
  if (folderList) {
    folderList.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-folder-btn');
      const addBtn = e.target.closest('.add-subfolder-btn');
      if (deleteBtn) {
        e.stopPropagation();
        handleDeleteFolder(deleteBtn.dataset.id);
        return;
      }
      if (addBtn) {
        e.stopPropagation();
        handleCreateSubfolder(addBtn.dataset.id);
        return;
      }
    });
  }

  const cardsGrid = document.getElementById('cards-grid');
  if (cardsGrid) {
    cardsGrid.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-folder-btn');
      const addBtn = e.target.closest('.add-subfolder-btn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        handleDeleteFolder(deleteBtn.dataset.id);
        return;
      }
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        handleCreateSubfolder(addBtn.dataset.id);
        return;
      }
    });
  }

  const modalGrid = document.getElementById('modal-cards-grid');
  if (modalGrid) {
    modalGrid.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-folder-btn');
      const addBtn = e.target.closest('.add-subfolder-btn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        handleDeleteFolder(deleteBtn.dataset.id);
        return;
      }
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        handleCreateSubfolder(addBtn.dataset.id);
        return;
      }
    });
  }

  const addGlobalBtn = document.getElementById('add-folder-global-btn');
  if (addGlobalBtn) {
    addGlobalBtn.addEventListener('click', () => {
      let parentId = '1';
      if (currentMode === 'visual') {
        const rootFoldersList = allFolders.filter(folder => 
          folder.parentId === '0' || 
          folder.parentId === 'root' || 
          !allFolders.some(f => f.id === folder.parentId)
        );
        if (rootFoldersList.length > 0) {
          const bookmarkBar = rootFoldersList.find(f => f.id === '1');
          parentId = bookmarkBar ? bookmarkBar.id : rootFoldersList[0].id;
        }
      } else {
        if (activeFolderId && activeFolderId !== 'all') {
          parentId = activeFolderId;
        }
      }
      handleCreateSubfolder(parentId);
    });
  }

  // 1. 侧边栏折叠
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
  }

  // 2. 模式切换
  const modeSwitcher = document.getElementById('main-mode-switcher');
  if (modeSwitcher) {
    modeSwitcher.addEventListener('click', (e) => {
      const btn = e.target.closest('.mode-btn');
      if (btn) {
        setMainMode(btn.dataset.mode);
      }
    });
  }

  // 3. 视图模式切换 (Card, List, Icon)
  const viewSwitcher = document.getElementById('view-switcher');
  if (viewSwitcher) {
    viewSwitcher.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-btn');
      if (btn) {
        setViewMode(btn.dataset.mode);
      }
    });
  }

  // 4. 配色主题与语言下拉菜单事件绑定
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeContainer = document.getElementById('theme-dropdown-container');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langContainer = document.getElementById('lang-dropdown-container');
  const bgToggle = document.getElementById('bg-settings-toggle');
  const bgPanel = document.getElementById('bg-settings-panel');

  if (themeToggleBtn && themeContainer) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeToggleBtn.classList.toggle('active');
      themeContainer.classList.toggle('active');
      
      // 关闭语言下拉菜单
      if (langToggleBtn && langContainer) {
        langToggleBtn.classList.remove('active');
        langContainer.classList.remove('active');
      }
      // 关闭壁纸设置面板
      if (bgToggle && bgPanel) {
        bgToggle.classList.remove('active');
        bgPanel.classList.remove('active');
      }
    });
  }

  if (langToggleBtn && langContainer) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langToggleBtn.classList.toggle('active');
      langContainer.classList.toggle('active');
      
      // 关闭主题下拉菜单
      if (themeToggleBtn && themeContainer) {
        themeToggleBtn.classList.remove('active');
        themeContainer.classList.remove('active');
      }
      // 关闭壁纸设置面板
      if (bgToggle && bgPanel) {
        bgToggle.classList.remove('active');
        bgPanel.classList.remove('active');
      }
    });
  }

  // 点击外部收起下拉菜单
  document.addEventListener('click', (e) => {
    if (themeContainer && !themeContainer.contains(e.target)) {
      if (themeToggleBtn) themeToggleBtn.classList.remove('active');
      themeContainer.classList.remove('active');
    }
    if (langContainer && !langContainer.contains(e.target)) {
      if (langToggleBtn) langToggleBtn.classList.remove('active');
      langContainer.classList.remove('active');
    }
  });

  // 5. 独立背景壁纸设置面板显示/隐藏
  if (bgToggle && bgPanel) {
    bgToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      bgToggle.classList.toggle('active');
      bgPanel.classList.toggle('active');

      // 关闭主题下拉菜单
      if (themeToggleBtn && themeContainer) {
        themeToggleBtn.classList.remove('active');
        themeContainer.classList.remove('active');
      }
      // 关闭语言下拉菜单
      if (langToggleBtn && langContainer) {
        langToggleBtn.classList.remove('active');
        langContainer.classList.remove('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (!bgPanel.contains(e.target) && e.target !== bgToggle) {
        bgToggle.classList.remove('active');
        bgPanel.classList.remove('active');
      }
    });
  }

  // 6. 壁纸面板内部控件绑定
  const bgEnableToggle = document.getElementById('bg-enable-toggle');
  if (bgEnableToggle) {
    bgEnableToggle.addEventListener('change', (e) => {
      wallpaperEnabled = e.target.checked;
      applyBackgroundSettings();
    });
  }

  const bgSlideshowToggle = document.getElementById('bg-slideshow-toggle');
  if (bgSlideshowToggle) {
    bgSlideshowToggle.addEventListener('change', (e) => {
      slideshowEnabled = e.target.checked;
      applyBackgroundSettings();
    });
  }

  const bgFitSelect = document.getElementById('bg-fit-select');
  if (bgFitSelect) {
    bgFitSelect.addEventListener('change', (e) => {
      wallpaperFit = e.target.value;
      applyBackgroundSettings();
    });
  }

  // 壁纸透明度滑动条
  const bgOpacitySlider = document.getElementById('bg-opacity-slider');
  const bgOpacityVal = document.getElementById('bg-opacity-val');
  if (bgOpacitySlider) {
    // 拖动过程中：仅在内存中即时改变样式，不执行耗时的 localStorage 写入，确保 60fps 丝滑渲染
    bgOpacitySlider.addEventListener('input', (e) => {
      wallpaperOpacity = parseInt(e.target.value, 10);
      if (bgOpacityVal) {
        bgOpacityVal.textContent = `${wallpaperOpacity}%`;
      }

      // 即时反映遮罩不透明度，无重绘延迟
      if (wallpaperEnabled && customBgList.length > 0) {
        const maskOpacity = 0.90 - (wallpaperOpacity / 100) * 0.90;
        const wpMask = document.getElementById('wallpaper-mask');
        if (wpMask) wpMask.style.opacity = maskOpacity;
      }
    });

    // 拖动结束释放鼠标时：才向 localStorage 同步写入持久化数据，完全规避磁盘 I/O 带来的画面掉帧
    bgOpacitySlider.addEventListener('change', (e) => {
      wallpaperOpacity = parseInt(e.target.value, 10);
      localStorage.setItem('wallpaperOpacity', wallpaperOpacity);
    });
  }

  // 触发选择文件按钮
  const uploadTrigger = document.getElementById('bg-upload-trigger');
  const fileInputs = document.getElementById('bg-file-inputs');
  if (uploadTrigger && fileInputs) {
    uploadTrigger.addEventListener('click', () => {
      fileInputs.click();
    });

    fileInputs.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleBgUploads(e.target.files);
      }
    });
  }
  // 首次安装引导 Onboarding 弹窗事件
  const btnOnboardingKeep = document.getElementById('btn-onboarding-keep');
  const btnOnboardingHomepage = document.getElementById('btn-onboarding-homepage');
  const onboardingOverlay = document.getElementById('onboarding-modal-overlay');

  if (btnOnboardingKeep) {
    btnOnboardingKeep.addEventListener('click', () => {
      setStorageItem('onboarding_completed', 'true');
      setStorageItem('isNewtabDisabled', 'false');
      checkNewtabVisibility();
      alert(currentLang.startsWith('zh') ? '新标签页设置成功！CanvasTab 已接管新标签页。' : 'Set successfully! CanvasTab has taken over the New Tab page.');
      if (onboardingOverlay) onboardingOverlay.classList.remove('active');
    });
  }

  if (btnOnboardingHomepage) {
    btnOnboardingHomepage.addEventListener('click', () => {
      setStorageItem('onboarding_completed', 'true');
      setStorageItem('isNewtabDisabled', 'true');
      checkNewtabVisibility();
      alert(currentLang.startsWith('zh') ? '已设定为使用浏览器默认新标签页。后续可在控制中心修改。' : 'Set to use system default New Tab page. You can change this later in settings.');
      if (onboardingOverlay) onboardingOverlay.classList.remove('active');
    });
  }

  // 顶部/设置栏“新标签页接管”切换事件
  const toggleNewtabState = () => {
    const currentDisabled = localStorage.getItem('isNewtabDisabled') === 'true';
    if (currentDisabled) {
      setStorageItem('isNewtabDisabled', 'false');
      checkNewtabVisibility();
      alert(currentLang.startsWith('zh')
        ? 'CanvasTab 已成功接管新标签页！'
        : 'CanvasTab has successfully taken over the New Tab page!');
    } else {
      setStorageItem('isNewtabDisabled', 'true');
      checkNewtabVisibility();
      alert(currentLang.startsWith('zh')
        ? '已取消接管，已恢复浏览器默认新标签页。在新开标签页时生效。'
        : 'New Tab override disabled. System default New Tab page restored.');
    }
  };

  const headerSetHomepageBtn = document.getElementById('header-set-homepage-btn');
  if (headerSetHomepageBtn) {
    headerSetHomepageBtn.addEventListener('click', toggleNewtabState);
  }

  const drawerNewtab = document.getElementById('drawer-btn-newtab-toggle');
  if (drawerNewtab) {
    drawerNewtab.addEventListener('click', toggleNewtabState);
  }

  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeFolderModal);
  }

  const modalOverlay = document.getElementById('folder-modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeFolderModal();
      }
    });
  }

  const modalBack = document.getElementById('modal-back-btn');
  if (modalBack) {
    modalBack.addEventListener('click', handleModalBack);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFolderModal();
    }
  });

  // 全局安全性 dragend 监听
  document.addEventListener('dragend', () => {
    clearTimeout(dragHoverTimer);
    currentHoveredFolderId = null;
  });

  // 8. 搜索引擎下拉选择逻辑
  const selector = document.getElementById('search-engine-selector');
  const dropdown = document.getElementById('engine-dropdown');
  if (selector && dropdown) {
    selector.addEventListener('click', (e) => {
      e.stopPropagation();
      selector.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!selector.contains(e.target)) {
        selector.classList.remove('active');
      }
    });
  }

  const googleSelector = document.getElementById('google-search-engine-selector');
  const googleDropdown = document.getElementById('google-engine-dropdown');
  if (googleSelector && googleDropdown) {
    googleSelector.addEventListener('click', (e) => {
      e.stopPropagation();
      googleSelector.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!googleSelector.contains(e.target)) {
        googleSelector.classList.remove('active');
      }
    });
  }

  // 9. 搜索框输入与回车处理
  const searchInput = document.getElementById('search-input');
  const googleSearchInput = document.getElementById('google-search-input');

  const handleSearchInput = (e, otherInput) => {
    const query = e.target.value.toLowerCase().trim();
    if (otherInput) otherInput.value = e.target.value; // 双向同步输入框内容

    if (!query) {
      refreshMainView();
      return;
    }

    closeFolderModal();

    const matchedFolders = allFolders.filter(folder => 
      folder.title.toLowerCase().includes(query)
    );
    
    const allBookmarks = bookmarksCache['all'] || [];
    const matchedLinks = allBookmarks.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.url.toLowerCase().includes(query)
    );

    document.getElementById('folder-stats').textContent = i18n[currentLang].statsSearch
      .replace('{folders}', matchedFolders.length)
      .replace('{links}', matchedLinks.length);
    renderItems(matchedFolders, matchedLinks, 'cards-grid');
  };

  const handleSearchKeydown = (e, inputEl) => {
    if (e.key === 'Enter') {
      const query = inputEl.value.trim();
      if (query) {
        triggerWebSearch(query);
        inputEl.value = '';
        if (searchInput) searchInput.value = '';
        if (googleSearchInput) googleSearchInput.value = '';
        refreshMainView();
      }
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearchInput(e, googleSearchInput));
    searchInput.addEventListener('keydown', (e) => handleSearchKeydown(e, searchInput));
  }

  if (googleSearchInput) {
    googleSearchInput.addEventListener('input', (e) => handleSearchInput(e, searchInput));
    googleSearchInput.addEventListener('keydown', (e) => handleSearchKeydown(e, googleSearchInput));
  }

  // 键盘快捷键 / 自动聚焦当前显示的搜索框
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== googleSearchInput) {
      const isPureVisual = document.body.getAttribute('data-search-layout') === 'pure-visual';
      const inputToFocus = isPureVisual ? searchInput : googleSearchInput;
      if (inputToFocus) {
        e.preventDefault();
        inputToFocus.focus();
        inputToFocus.select();
      }
    }
  });

  // 10. 目录面包屑 / 返回上一级按钮逻辑
  const handleBackFolder = () => {
    const currentFolder = allFolders.find(f => f.id === activeFolderId);
    if (currentFolder && currentFolder.parentId) {
      selectFolder(currentFolder.parentId);
    }
  };

  const universalBackBtn = document.getElementById('universal-folder-back-btn');
  if (universalBackBtn) {
    universalBackBtn.addEventListener('click', handleBackFolder);
  }

  const googleBackBtn = document.getElementById('google-back-folder-btn');
  if (googleBackBtn) {
    googleBackBtn.addEventListener('click', handleBackFolder);
  }
}

// 监听书签变动，保持实时同步
function setupSyncListeners() {
  const handleUpdate = () => {
    loadBookmarksTree();
  };

  chrome.bookmarks.onCreated.addListener(handleUpdate);
  chrome.bookmarks.onRemoved.addListener(handleUpdate);
  chrome.bookmarks.onChanged.addListener(handleUpdate);
  chrome.bookmarks.onMoved.addListener(handleUpdate);
  chrome.bookmarks.onChildrenReordered.addListener(handleUpdate);
}

// 模拟调试数据 (为拖动整理增加了 Mock ID)
function loadMockData() {
  allFolders = [
    { id: '1', title: currentLang.startsWith('zh') ? '书签栏' : 'Bookmark Bar', parentId: '0' },
    { id: '2', title: currentLang.startsWith('zh') ? '开发资源' : 'Development', parentId: '0' },
    { id: '3', title: currentLang.startsWith('zh') ? '设计灵感' : 'Design', parentId: '0' },
    { id: 'sub1', title: 'Web前端工具', parentId: '2' },
    { id: 'sub2', title: 'UI组件库', parentId: '2' },
    { id: 'sub3', title: '灵感画廊', parentId: '3' },
    { id: 'sub_sub1', title: 'React 19 工具子级', parentId: 'sub2' }
  ];

  foldersCache = {
    'all': [],
    '1': [],
    '2': [
      { id: 'sub1', title: 'Web前端工具' },
      { id: 'sub2', title: 'UI组件库' }
    ],
    '3': [
      { id: 'sub3', title: '灵感画廊' }
    ],
    'sub1': [],
    'sub2': [
      { id: 'sub_sub1', title: 'React 19 工具子级' }
    ],
    'sub3': [],
    'sub_sub1': []
  };

  bookmarksCache = {
    'all': [
      { id: 'b1', title: 'Google 搜索', url: 'https://www.google.com' },
      { id: 'b2', title: 'GitHub 代码托管', url: 'https://github.com' },
      { id: 'b3', title: 'MDN Web Docs 技术文档', url: 'https://developer.mozilla.org' },
      { id: 'b4', title: 'Bilibili 视频分享网', url: 'https://www.bilibili.com' },
      { id: 'b5', title: 'Dribbble 设计交流', url: 'https://dribbble.com' },
      { id: 'b6', title: 'TailwindCSS 官网', url: 'https://tailwindcss.com' },
      { id: 'b7', title: 'React 官方网站', url: 'https://react.dev' }
    ],
    '1': [
      { id: 'b1', title: 'Google 搜索', url: 'https://www.google.com' },
      { id: 'b2', title: 'GitHub 代码托管', url: 'https://github.com' }
    ],
    '2': [
      { id: 'b3', title: 'MDN Web Docs 技术文档', url: 'https://developer.mozilla.org' }
    ],
    '3': [
      { id: 'b4', title: 'Bilibili 视频分享网', url: 'https://www.bilibili.com' }
    ],
    'sub1': [
      { id: 'b6', title: 'TailwindCSS 官网', url: 'https://tailwindcss.com' }
    ],
    'sub2': [
      { id: 'b7', title: 'React 官方网站', url: 'https://react.dev' }
    ],
    'sub3': [
      { id: 'b5', title: 'Dribbble 设计交流', url: 'https://dribbble.com' }
    ]
  };

  activeFolderId = '1';
  renderSidebar();
  refreshMainView();
}


function setSearchLayout(layout) {
  const allowed = ['google-visual', 'google-collapse', 'pure-visual'];
  if (!allowed.includes(layout)) return;
  localStorage.setItem('searchLayout', layout);
  document.body.setAttribute('data-search-layout', layout);
  document.querySelectorAll('#drawer-layout-switcher .drawer-opt-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layout === layout);
  });
}

function syncDrawerControls() {
  const layout = localStorage.getItem('searchLayout') || 'google-visual';
  setSearchLayout(layout);
  document.querySelectorAll('#drawer-mode-switcher .drawer-opt-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === currentMode);
  });
  document.querySelectorAll('#drawer-view-switcher .drawer-opt-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewMode);
  });

  const themeGrid = document.getElementById('drawer-theme-grid');
  if (themeGrid) {
    themeGrid.innerHTML = '';
    THEMES_LIST.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'drawer-opt-btn';
      btn.dataset.theme = item.id;
      btn.innerHTML = `<span class="theme-dot" style="background:${item.color}"></span>${currentLang.startsWith('zh') ? item.nameZh : item.name}`;
      btn.classList.toggle('active', item.id === theme);
      btn.addEventListener('click', () => setTheme(item.id));
      themeGrid.appendChild(btn);
    });
  }

  const langSelect = document.getElementById('drawer-lang-select');
  if (langSelect) {
    langSelect.innerHTML = '';
    LANGUAGES_LIST.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.name;
      option.selected = item.id === currentLang;
      langSelect.appendChild(option);
    });
  }

  const bgEnabled = document.getElementById('drawer-bg-enable-toggle');
  const bgSlideshow = document.getElementById('drawer-bg-slideshow-toggle');
  const bgFit = document.getElementById('drawer-bg-fit-select');
  const bgOpacity = document.getElementById('drawer-bg-opacity-slider');
  const bgOpacityVal = document.getElementById('drawer-bg-opacity-val');
  if (bgEnabled) bgEnabled.checked = wallpaperEnabled;
  if (bgSlideshow) bgSlideshow.checked = slideshowEnabled;
  if (bgFit) bgFit.value = wallpaperFit;
  if (bgOpacity) bgOpacity.value = wallpaperOpacity;
  if (bgOpacityVal) bgOpacityVal.textContent = `${wallpaperOpacity}%`;
}

function setupControlSurface() {
  const body = document.body;
  const drawer = document.getElementById('control-drawer');
  const settings = document.getElementById('settings-drawer-btn');
  const close = document.getElementById('drawer-close-btn');
  const overlay = document.getElementById('control-drawer-overlay');
  const group = document.getElementById('floating-control-group');
  if (!drawer || !settings) return;

  const sides = ['left', 'right'];
  const getSide = () => sides.includes(localStorage.getItem('drawerSide')) ? localStorage.getItem('drawerSide') : 'right';
  const getTop = () => Math.max(12, Math.min(window.innerHeight - 70, Number(localStorage.getItem('floatingTop')) || 80));
  const setSide = side => {
    const safeSide = sides.includes(side) ? side : 'right';
    body.setAttribute('data-drawer-side', safeSide);
    localStorage.setItem('drawerSide', safeSide);
    if (group) {
      group.style.top = `${getTop()}px`;
      group.style.bottom = 'auto';
      group.style.transform = 'none';
      if (safeSide === 'left') {
        group.style.left = '12px';
        group.style.right = 'auto';
      } else {
        group.style.left = 'auto';
        group.style.right = '12px';
      }
    }
  };
  const openDrawer = () => {
    const side = getSide();
    ['left', 'right', 'top', 'bottom'].forEach(item => body.classList.remove(`drawer-open-${item}`));
    body.classList.add(`drawer-open-${side}`);
    drawer.classList.add('active');
  };
  const closeDrawer = () => {
    ['left', 'right', 'top', 'bottom'].forEach(item => body.classList.remove(`drawer-open-${item}`));
    drawer.classList.remove('active');
  };

  setSide(getSide());

  // 绑定设置抽屉的打开/关闭点击事件
  settings.addEventListener('click', openDrawer);
  if (close) close.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  if (!group || group.dataset.dragBound === 'true') return;
  group.dataset.dragBound = 'true';
  let pointerId = null;
  let dragging = false;
  let suppressClick = false;
  let grabX = 0;
  let grabY = 0;
  let startTop = 0;
  let startX = 0;
  let startY = 0;

  group.addEventListener('pointerdown', event => {
    pointerId = event.pointerId;
    dragging = false;
    suppressClick = false;
    startX = event.clientX;
    startY = event.clientY;
    
    const rect = group.getBoundingClientRect();
    grabX = event.clientX - rect.left;
    grabY = event.clientY - rect.top;
    startTop = rect.top;
  });
  group.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!dragging) {
      if (Math.hypot(dx, dy) < 5) return;
      dragging = true;
      suppressClick = true;
      try { group.setPointerCapture(pointerId); } catch (_) {}
    }
    event.preventDefault();
    const rect = group.getBoundingClientRect();
    const top = Math.max(8, Math.min(window.innerHeight - rect.height - 8, event.clientY - grabY));
    const side = event.clientX < window.innerWidth / 2 ? 'left' : 'right';
    group.style.top = `${top}px`;
    group.style.bottom = 'auto';
    group.style.transform = 'none';
    if (side === 'left') {
      group.style.left = '12px'; group.style.right = 'auto';
    } else {
      group.style.left = 'auto'; group.style.right = '12px';
    }
    body.setAttribute('data-drawer-side', side);
    localStorage.setItem('floatingTop', String(Math.round(top)));
  });
  group.addEventListener('pointerup', event => {
    if (event.pointerId !== pointerId) return;
    if (dragging) {
      try { group.releasePointerCapture(pointerId); } catch (_) {}
      const side = event.clientX < window.innerWidth / 2 ? 'left' : 'right';
      setSide(side);
      localStorage.setItem('floatingTop', String(Math.round(parseFloat(group.style.top) || startTop)));
    }
    pointerId = null;
    dragging = false;
    window.setTimeout(() => { suppressClick = false; }, 80);
  });
  group.addEventListener('pointercancel', () => {
    pointerId = null;
    dragging = false;
    suppressClick = false;
    setSide(getSide());
  });
  group.addEventListener('click', event => {
    if (suppressClick) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

function updateBackFolderButtons() {
  const universalBtn = document.getElementById('universal-folder-back-btn');
  const googleBtn = document.getElementById('google-back-folder-btn');
  
  const rootIds = ['1', '2', '3', 'root', '0'];
  const isAtRoot = rootIds.includes(activeFolderId) || !activeFolderId;

  if (isAtRoot) {
    if (universalBtn) universalBtn.setAttribute('hidden', '');
    if (googleBtn) googleBtn.setAttribute('hidden', '');
  } else {
    const currentFolder = allFolders.find(f => f.id === activeFolderId);
    if (currentFolder && currentFolder.parentId) {
      if (universalBtn) universalBtn.removeAttribute('hidden');
      if (googleBtn) googleBtn.removeAttribute('hidden');
    } else {
      if (universalBtn) universalBtn.setAttribute('hidden', '');
      if (googleBtn) googleBtn.setAttribute('hidden', '');
    }
  }
}
