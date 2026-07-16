// 早期重定向判定：如果已配置不将此插件用作新标签页，且当前是以默认新标签形式加载（无 mode 参数，即 Ctrl+T 触发），则立刻重定向至 Chrome 原生新标签页
(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (localStorage.getItem('isNewtabDisabled') === 'true' && !urlParams.has('mode')) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.update) {
      chrome.tabs.update({ url: 'chrome://new-tab-page/' });
    }
  }
})();

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
  "en": {
    "ctxAdd": "Create Subfolder",
    "ctxRename": "Rename Folder",
    "ctxDelete": "Delete Folder",
    "appName": "📌 CanvasTab Bookmarks",
    "manageMode": "🗃️ Manage",
    "visualMode": "🎨 Visual",
    "viewCard": "🎴 Card",
    "viewList": "📝 List",
    "viewIcon": "📱 Icon",
    "searchPlaceholder": "Search bookmarks, links or folders...",
    "loadingFolders": "Loading folders...",
    "versionTag": "v1.7 | Wallpaper Slideshow",
    "allBookmarks": "All Bookmarks",
    "folderStatsAll": "Total of {count} bookmark links collected",
    "folderStatsFolder": "Contains {folders} folders, {links} links",
    "folderStatsVisual": "Visual Mode | {folders} folders, {links} links",
    "emptyState": "No subfolders or bookmark links found here~",
    "modalFolderTitle": "Folder Content",
    "folderCardCount": "{count} items",
    "statsSearch": "Search | Found {folders} folders, {links} links",
    "tooltipBack": "Back to parent",
    "tooltipClose": "Close modal",
    "drawerTitle": "Control Center",
    "secMode": "Dashboard Mode",
    "secModeDesc": "Switch between simplified manager and borderless visual dashboard",
    "secLayout": "Search Bar Layout",
    "secLayoutDesc": "Adjust search box position and dashboard visibility",
    "layoutGoogleVisual": "Search + Dashboard",
    "layoutGoogleCollapse": "Search + Drawer",
    "layoutPureVisual": "Classic Bookmark Bar",
    "secView": "Bookmark Style",
    "secViewDesc": "Switch bookmark card grid layout",
    "secTheme": "Personalized Theme",
    "secThemeDesc": "Select global system color theme",
    "secLang": "Language",
    "secWallpaper": "Wallpaper Background Settings",
    "wallpaperDrawerDesc": "Toggles, display modes, clarity, and slideshow settings are managed in the gallery.",
    "btnUploadBg": "Upload Wallpaper",
    "btnManageBg": "Manage Gallery",
    "newtabStatusLabel": "New Tab State",
    "btnHomepageReset": "Restore Header Button",
    "btnNewtabToggle": "Restore Default New Tab",
    "btnDeadLink": "Dead Link Checker",
    "btnCreateFolder": "New Folder",
    "brandLogoSubtitle": "Browser Bookmark Canvas",
    "googleVoiceTitle": "Voice Search",
    "googleLensTitle": "Search by Image",
    "googleAiModeText": "AI Mode",
    "googleAiModeTitle": "Toggle display mode",
    "btnNewtabToggleEnable": "Enable CanvasTab New Tab",
    "newtabActiveNormal": "New Tab Enabled",
    "newtabActiveHover": "Disable",
    "newtabActiveTitle": "Click to restore system default New Tab page",
    "newtabInactiveText": "Enable New Tab",
    "newtabInactiveTitle": "Enable CanvasTab as your New Tab page",
    "newtabStatusActive": "Taken over by CanvasTab",
    "newtabStatusInactive": "System Default New Tab",
    "theme_dark": "Midnight Dark",
    "theme_light": "Light Glass",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Deep Ocean",
    "theme_forest": "Forest Green",
    "theme_sunset": "Sunset Orange",
    "theme_sakura": "Sakura Rose",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "zh-CN": {
    "ctxAdd": "新建子文件夹",
    "ctxRename": "重命名文件夹",
    "ctxDelete": "删除此文件夹",
    "appName": "📌 CanvasTab 浏览器书签画布",
    "manageMode": "🗃️ 极简管理",
    "visualMode": "🎨 无界视觉",
    "viewCard": "🎴 卡片",
    "viewList": "📝 列表",
    "viewIcon": "📱 图标",
    "searchPlaceholder": "搜索书签、链接或关键词...",
    "loadingFolders": "加载文件夹中...",
    "versionTag": "v1.7 | 幻灯壁纸版",
    "allBookmarks": "所有书签",
    "folderStatsAll": "共收录了 {count} 个网页链接",
    "folderStatsFolder": "包含 {folders} 个子目录，{links} 个网页链接",
    "folderStatsVisual": "看板视角 | 共有 {folders} 个主要文件夹，{links} 个直属链接",
    "emptyState": "这里没有找到任何子文件夹或书签链接~",
    "modalFolderTitle": "文件夹内容",
    "folderCardCount": "{count} 个对象",
    "statsSearch": "搜索视图 | 找到 {folders} 个文件夹，{links} 个网页链接",
    "tooltipBack": "返回上一级",
    "tooltipClose": "关闭弹窗",
    "drawerTitle": "控制中心",
    "secMode": "看板工作模式",
    "secModeDesc": "切换极简管理与无界视觉模式",
    "secLayout": "搜索框排版",
    "secLayoutDesc": "调整搜索栏在看板中的位置与展开状态",
    "layoutGoogleVisual": "搜索框 + 书签看板",
    "layoutGoogleCollapse": "搜索框 + 抽屉式侧栏",
    "layoutPureVisual": "经典书签栏导航",
    "secView": "书签展示风格",
    "secViewDesc": "切换书签网格的排版视图",
    "secTheme": "个性化主题配色",
    "secThemeDesc": "选择系统的全局配色主题",
    "secLang": "多国语言",
    "secWallpaper": "壁纸背景设置",
    "wallpaperDrawerDesc": "壁纸开关、展示模式、清晰度和播放设置统一在背景库管理。",
    "btnUploadBg": "上传背景图",
    "btnManageBg": "管理背景库",
    "newtabStatusLabel": "新标签页状态",
    "btnHomepageReset": "恢复显示顶部按钮",
    "btnNewtabToggle": "恢复浏览器原生新标签页",
    "btnDeadLink": "死链检测",
    "btnCreateFolder": "新建文件夹",
    "brandLogoSubtitle": "浏览器书签画布",
    "googleVoiceTitle": "语音搜索",
    "googleLensTitle": "图像搜索",
    "googleAiModeText": "AI 模式",
    "googleAiModeTitle": "切换展示模式",
    "btnNewtabToggleEnable": "开启 CanvasTab 新标签页",
    "newtabActiveNormal": "新标签页已开启",
    "newtabActiveHover": "取消接管",
    "newtabActiveTitle": "点击恢复使用浏览器默认新标签页",
    "newtabInactiveText": "开启新标签页",
    "newtabInactiveTitle": "开启 CanvasTab 接管浏览器新标签页",
    "newtabStatusActive": "已由 CanvasTab 接管",
    "newtabStatusInactive": "系统默认新标签页",
    "theme_dark": "极夜暗黑",
    "theme_light": "晨曦明亮",
    "theme_aurora": "极光流彩",
    "theme_ocean": "深海幽蓝",
    "theme_forest": "森野绿意",
    "theme_sunset": "落日余晖",
    "theme_sakura": "樱色浪漫",
    "theme_cyberpunk": "赛博朋克"
  },
  "zh-TW": {
    "ctxAdd": "新建子資料夾",
    "ctxRename": "重新命名資料夾",
    "ctxDelete": "刪除此資料夾",
    "appName": "📌 CanvasTab 瀏覽器書籤畫布",
    "manageMode": "🗃️ 極簡管理",
    "visualMode": "🎨 無界視覺",
    "viewCard": "🎴 卡片",
    "viewList": "📝 列表",
    "viewIcon": "📱 圖標",
    "searchPlaceholder": "搜尋書籤、連結或關鍵詞...",
    "loadingFolders": "載入資料夾中...",
    "versionTag": "v1.7 | 幻燈壁紙版",
    "allBookmarks": "所有書籤",
    "folderStatsAll": "共收錄了 {count} 個網頁連結",
    "folderStatsFolder": "包含 {folders} 個子目錄，{links} 個網頁連結",
    "folderStatsVisual": "看板視角 | 共有 {folders} 個主要資料夾，{links} 個直屬連結",
    "emptyState": "這裡沒有找到任何子資料夾或書籤連結~",
    "modalFolderTitle": "資料夾內容",
    "folderCardCount": "{count} 個對象",
    "statsSearch": "搜尋視圖 | 找到 {folders} 個資料夾，{links} 個網頁連結",
    "tooltipBack": "返回上一級",
    "tooltipClose": "關閉彈窗",
    "drawerTitle": "控制中心",
    "secMode": "看板工作模式",
    "secModeDesc": "切換極簡管理與無界視覺模式",
    "secLayout": "搜尋框排版",
    "secLayoutDesc": "調整搜尋欄在看板中的位置與展開狀態",
    "layoutGoogleVisual": "搜尋框 + 書籤看板",
    "layoutGoogleCollapse": "搜尋框 + 抽屜式側欄",
    "layoutPureVisual": "經典書籤欄導航",
    "secView": "書籤展示風格",
    "secViewDesc": "切換書籤網格的排版視圖",
    "secTheme": "個性化主題配色",
    "secThemeDesc": "選擇系統的全局配色主題",
    "secLang": "多國語言",
    "secWallpaper": "壁紙背景設置",
    "wallpaperDrawerDesc": "壁紙開關、展示模式、清晰度和播放設置統一在背景庫管理。",
    "btnUploadBg": "上傳背景圖",
    "btnManageBg": "管理背景庫",
    "newtabStatusLabel": "新分頁狀態",
    "btnHomepageReset": "恢復顯示頂部按鈕",
    "btnNewtabToggle": "恢復瀏覽器原生新分頁",
    "btnDeadLink": "死鏈檢測",
    "btnCreateFolder": "新建資料夾",
    "brandLogoSubtitle": "瀏覽器書籤畫布",
    "googleVoiceTitle": "語音搜尋",
    "googleLensTitle": "圖像搜尋",
    "googleAiModeText": "AI 模式",
    "googleAiModeTitle": "切換展示模式",
    "btnNewtabToggleEnable": "開啟 CanvasTab 新分頁",
    "newtabActiveNormal": "新分頁已開啟",
    "newtabActiveHover": "取消接管",
    "newtabActiveTitle": "點擊恢復使用瀏覽器預設新分頁",
    "newtabInactiveText": "開啟新分頁",
    "newtabInactiveTitle": "開啟 CanvasTab 接管瀏覽器新分頁",
    "newtabStatusActive": "已由 CanvasTab 接管",
    "newtabStatusInactive": "系統預設新分頁",
    "theme_dark": "極夜暗黑",
    "theme_light": "晨曦明亮",
    "theme_aurora": "極光流彩",
    "theme_ocean": "深海幽藍",
    "theme_forest": "森野綠意",
    "theme_sunset": "落日餘暉",
    "theme_sakura": "櫻色浪漫",
    "theme_cyberpunk": "賽博朋克"
  },
  "es": {
    "ctxAdd": "Crear subcarpeta",
    "ctxRename": "Renombrar carpeta",
    "ctxDelete": "Eliminar carpeta",
    "appName": "📌 Marcadores Visuales",
    "manageMode": "🗃️ Gestión",
    "visualMode": "🎨 Visual",
    "viewCard": "🎴 Tarjetas",
    "viewList": "📝 Lista",
    "viewIcon": "📱 Iconos",
    "searchPlaceholder": "Buscar marcadores, enlaces o carpetas...",
    "loadingFolders": "Cargando carpetas...",
    "versionTag": "v1.7 | Presentación de fondo",
    "allBookmarks": "Todos los marcadores",
    "folderStatsAll": "Total de {count} enlaces recopilados",
    "folderStatsFolder": "Contiene {folders} carpetas, {links} enlaces",
    "folderStatsVisual": "Vista Visual | {folders} carpetas, {links} enlaces",
    "emptyState": "No se encontraron subcarpetas o marcadores aquí~",
    "modalFolderTitle": "Contenido de la carpeta",
    "folderCardCount": "{count} elementos",
    "statsSearch": "Búsqueda | Encontrado {folders} carpetas, {links} enlaces",
    "tooltipBack": "Volver al padre",
    "tooltipClose": "Cerrar ventana",
    "drawerTitle": "Centro de control",
    "secMode": "Modo del panel",
    "secModeDesc": "Cambiar entre administrador simplificado y visual sin bordes",
    "secLayout": "Posición de búsqueda",
    "secLayoutDesc": "Ajustar la posición de la barra de búsqueda y visibilidad del panel",
    "layoutGoogleVisual": "Búsqueda + Panel",
    "layoutGoogleCollapse": "Búsqueda + Cajón",
    "layoutPureVisual": "Barra clásica de marcadores",
    "secView": "Estilo de marcadores",
    "secViewDesc": "Cambiar la disposición de la cuadrícula de marcadores",
    "secTheme": "Tema personalizado",
    "secThemeDesc": "Seleccionar el color de tema global del sistema",
    "secLang": "Idioma",
    "secWallpaper": "Ajustes del fondo de pantalla",
    "wallpaperDrawerDesc": "Toggles, modos, claridad y presentación se gestionan en la galería.",
    "btnUploadBg": "Subir fondo de pantalla",
    "btnManageBg": "Gestionar galería",
    "newtabStatusLabel": "Estado de Nueva Pestaña",
    "btnHomepageReset": "Restaurar Botón Superior",
    "btnNewtabToggle": "Restaurar Nueva Pestaña Predeterminada",
    "btnDeadLink": "Verificador de enlaces rotos",
    "btnCreateFolder": "Nueva carpeta",
    "brandLogoSubtitle": "Lienzo de marcadores del navegador",
    "googleVoiceTitle": "Búsqueda por voz",
    "googleLensTitle": "Búsqueda por imagen",
    "googleAiModeText": "Modo IA",
    "googleAiModeTitle": "Alternar modo de pantalla",
    "btnNewtabToggleEnable": "Habilitar CanvasTab Nueva Pestaña",
    "newtabActiveNormal": "Nueva pestaña activada",
    "newtabActiveHover": "Desactivar",
    "newtabActiveTitle": "Haga clic para restaurar la página de nueva pestaña predeterminada",
    "newtabInactiveText": "Habilitar nueva pestaña",
    "newtabInactiveTitle": "Habilitar CanvasTab como su página de nueva pestaña",
    "newtabStatusActive": "Controlado por CanvasTab",
    "newtabStatusInactive": "Nueva pestaña predeterminada",
    "theme_dark": "Oscuro de Medianoche",
    "theme_light": "Vidrio Claro",
    "theme_aurora": "Aurora de Neón",
    "theme_ocean": "Océano Profundo",
    "theme_forest": "Bosque Verde",
    "theme_sunset": "Naranja Atardecer",
    "theme_sakura": "Rosa de Sakura",
    "theme_cyberpunk": "Neón Cyberpunk"
  },
  "ja": {
    "ctxAdd": "新規サブフォルダ",
    "ctxRename": "フォルダ名の変更",
    "ctxDelete": "フォルダの削除",
    "appName": "📌 ビジュアルブックマーク",
    "manageMode": "🗃️ 管理モード",
    "visualMode": "🎨 ビジュアル",
    "viewCard": "🎴 カード",
    "viewList": "📝 リスト",
    "viewIcon": "📱 アイコン",
    "searchPlaceholder": "ブックマーク、リンク、フォルダを検索...",
    "loadingFolders": "フォルダを読み込み中...",
    "versionTag": "v1.7 | スライドショー背景",
    "allBookmarks": "すべてのブックマーク",
    "folderStatsAll": "合計 {count} 個のリンクが登録されています",
    "folderStatsFolder": "内訳: {folders} フォルダ、{links} リンク",
    "folderStatsVisual": "ビジュアル表示 | {folders} 主要フォルダ、{links} リンク",
    "emptyState": "サブフォルダまたはブックマークが見つかりません~",
    "modalFolderTitle": "フォルダのコンテンツ",
    "folderCardCount": "{count} 個の項目",
    "statsSearch": "検索結果 | {folders} フォルダ、{links} リンクを発見",
    "tooltipBack": "親フォルダへ戻る",
    "tooltipClose": "閉じる",
    "drawerTitle": "コントロールセンター",
    "secMode": "ダッシュボードモード",
    "secModeDesc": "シンプルな管理画面と境界線のないビジュアルボードを切り替え",
    "secLayout": "検索バーの配置",
    "secLayoutDesc": "検索ボックスの位置とボードの表示/非表示を調整",
    "layoutGoogleVisual": "検索 + ボード",
    "layoutGoogleCollapse": "検索 + 引き出し",
    "layoutPureVisual": "クラシックブックマークバー",
    "secView": "表示スタイル",
    "secViewDesc": "ブックマークカードのレイアウトを切り替え",
    "secTheme": "テーマカラー",
    "secThemeDesc": "システムの全体テーマカラーを選択",
    "secLang": "言語設定",
    "secWallpaper": "壁紙背景の設定",
    "wallpaperDrawerDesc": "壁紙の有効化、表示モード、透過率、自動切り替えはギャラリーで設定します。",
    "btnUploadBg": "壁紙をアップロード",
    "btnManageBg": "ギャラリーの管理",
    "newtabStatusLabel": "新しいタブの状態",
    "btnHomepageReset": "ヘッダーボタンを復元",
    "btnNewtabToggle": "デフォルトの新しいタブに戻す",
    "btnDeadLink": "リンク切れチェッカー",
    "btnCreateFolder": "新規フォルダ",
    "brandLogoSubtitle": "ブラウザブックマークキャンバス",
    "googleVoiceTitle": "音声検索",
    "googleLensTitle": "画像で検索",
    "googleAiModeText": "AIモード",
    "googleAiModeTitle": "表示モードを切り替える",
    "btnNewtabToggleEnable": "CanvasTab 新しいタブを有効にする",
    "newtabActiveNormal": "新しいタブが有効",
    "newtabActiveHover": "無効化",
    "newtabActiveTitle": "クリックしてデフォルトの新しいタブページに戻す",
    "newtabInactiveText": "新しいタブを有効にする",
    "newtabInactiveTitle": "CanvasTab を新しいタブページとして有効にする",
    "newtabStatusActive": "CanvasTab が接管中",
    "newtabStatusInactive": "システムデフォルトの新しいタブ",
    "theme_dark": "ミッドナイトダーク",
    "theme_light": "ライトグラス",
    "theme_aurora": "ネオンオーロラ",
    "theme_ocean": "ディープオーシャン",
    "theme_forest": "フォレストグリーン",
    "theme_sunset": "サンセットオレンジ",
    "theme_sakura": "サクラローズ",
    "theme_cyberpunk": "サイバーパンクネオン"
  },
  "ko": {
    "ctxAdd": "새 하위 폴더 생성",
    "ctxRename": "폴더 이름 바꾸기",
    "ctxDelete": "폴더 삭제",
    "appName": "📌 비주얼 북마크",
    "manageMode": "🗃️ 관리 모드",
    "visualMode": "🎨 비주얼",
    "viewCard": "🎴 카드",
    "viewList": "📝 목록",
    "viewIcon": "📱 아이콘",
    "searchPlaceholder": "북마크, 링크 또는 폴더 검색...",
    "loadingFolders": "폴더 로드 중...",
    "versionTag": "v1.7 | 슬라이드쇼 배경",
    "allBookmarks": "모든 북마크",
    "folderStatsAll": "총 {count}개의 북마크 링크 수집됨",
    "folderStatsFolder": "{folders}개 폴더, {links}개 링크 포함",
    "folderStatsVisual": "비주얼 모드 | {folders}개 폴더, {links}개 링크",
    "emptyState": "하위 폴더나 북마크 링크가 없습니다~",
    "modalFolderTitle": "폴더 내용",
    "folderCardCount": "{count}개 항목",
    "statsSearch": "검색 | {folders}개 폴더, {links}개 링크 발견",
    "tooltipBack": "이전으로",
    "tooltipClose": "닫기",
    "drawerTitle": "제어 센터",
    "secMode": "대시보드 모드",
    "secModeDesc": "간편 관리 모드와 테두리 없는 비주얼 대시보드 간 전환",
    "secLayout": "검색바 레이아웃",
    "secLayoutDesc": "검색창 위치 및 대시보드 표시 상태 설정",
    "layoutGoogleVisual": "검색 + 대시보드",
    "layoutGoogleCollapse": "검색 + 슬라이드바",
    "layoutPureVisual": "클래식 북마크바",
    "secView": "북마크 스타일",
    "secViewDesc": "북마크 카드 그리드 레이아웃 전환",
    "secTheme": "개인화 테마",
    "secThemeDesc": "시스템 글로벌 색상 테마 선택",
    "secLang": "언어",
    "secWallpaper": "배경 화면 설정",
    "wallpaperDrawerDesc": "배경 활성화, 표시 모드, 투명도 및 슬라이드쇼 설정은 갤러리에서 관리됩니다.",
    "btnUploadBg": "배경 업로드",
    "btnManageBg": "갤러리 관리",
    "newtabStatusLabel": "새 탭 페이지 상태",
    "btnHomepageReset": "헤더 버튼 복원",
    "btnNewtabToggle": "기본 새 탭으로 복구",
    "btnDeadLink": "데드 링크 체크",
    "btnCreateFolder": "새 폴더",
    "brandLogoSubtitle": "브라우저 북마크 캔버스",
    "googleVoiceTitle": "음성 검색",
    "googleLensTitle": "이미지 검색",
    "googleAiModeText": "AI 모드",
    "googleAiModeTitle": "화면 모드 전환",
    "btnNewtabToggleEnable": "CanvasTab 새 탭 활성화",
    "newtabActiveNormal": "새 탭 활성화됨",
    "newtabActiveHover": "비활성화",
    "newtabActiveTitle": "클릭하여 기본 새 탭 페이지로 복원",
    "newtabInactiveText": "새 탭 활성화",
    "newtabInactiveTitle": "CanvasTab을 새 탭 페이지로 설정",
    "newtabStatusActive": "CanvasTab이 제어 중",
    "newtabStatusInactive": "시스템 기본 새 탭",
    "theme_dark": "미드나잇 다크",
    "theme_light": "라이트 글래스",
    "theme_aurora": "네온 오로라",
    "theme_ocean": "딥 오션",
    "theme_forest": "포레스트 그린",
    "theme_sunset": "선셋 오렌지",
    "theme_sakura": "사쿠라 로즈",
    "theme_cyberpunk": "사이버펑크 네온"
  },
  "fr": {
    "ctxAdd": "Créer un sous-dossier",
    "ctxRename": "Renommer le dossier",
    "ctxDelete": "Supprimer le dossier",
    "appName": "📌 Signets Visuels",
    "manageMode": "🗃️ Gestion",
    "visualMode": "🎨 Visuel",
    "viewCard": "🎴 Cartes",
    "viewList": "📝 Liste",
    "viewIcon": "📱 Icônes",
    "searchPlaceholder": "Rechercher des favoris, liens ou dossiers...",
    "loadingFolders": "Chargement des dossiers...",
    "versionTag": "v1.7 | Diaporama",
    "allBookmarks": "Tous les signets",
    "folderStatsAll": "Total de {count} liens collectés",
    "folderStatsFolder": "Contient {folders} dossiers, {links} liens",
    "folderStatsVisual": "Mode Visuel | {folders} dossiers, {links} liens",
    "emptyState": "Aucun sous-dossier ou signet trouvé ici~",
    "modalFolderTitle": "Contenu du dossier",
    "folderCardCount": "{count} éléments",
    "statsSearch": "Recherche | {folders} dossiers, {links} liens trouvés",
    "tooltipBack": "Retour",
    "tooltipClose": "Fermer",
    "drawerTitle": "Centre de Contrôle",
    "secMode": "Mode de Tableau de Bord",
    "secModeDesc": "Basculez entre gestionnaire simplifié et visuel sans bordure",
    "secLayout": "Disposition de Recherche",
    "secLayoutDesc": "Ajuster la position de recherche et la visibilité du panneau",
    "layoutGoogleVisual": "Recherche + Panneau",
    "layoutGoogleCollapse": "Recherche + Tiroir",
    "layoutPureVisual": "Barre de Favoris Classique",
    "secView": "Style de Favoris",
    "secViewDesc": "Changer la disposition de la grille des favoris",
    "secTheme": "Thème Personnalisé",
    "secThemeDesc": "Sélectionner le thème de couleur global du système",
    "secLang": "Langue",
    "secWallpaper": "Paramètres de Fond d'Écran",
    "wallpaperDrawerDesc": "L'affichage, les modes, la clarté et le diaporama se gèrent dans la galerie.",
    "btnUploadBg": "Téléverser Fond",
    "btnManageBg": "Gérer la Galerie",
    "newtabStatusLabel": "État du Nouvel Onglet",
    "btnHomepageReset": "Restaurer le Bouton d'En-tête",
    "btnNewtabToggle": "Restaurer le Nouvel Onglet par Diaporama",
    "btnDeadLink": "Vérificateur de Liens Morts",
    "btnCreateFolder": "Nouveau Dossier",
    "brandLogoSubtitle": "Canevas de Favoris de Navigateur",
    "googleVoiceTitle": "Recherche vocale",
    "googleLensTitle": "Recherche par image",
    "googleAiModeText": "Mode IA",
    "googleAiModeTitle": "Basculer le mode d'affichage",
    "btnNewtabToggleEnable": "Activer CanvasTab Nouvel Onglet",
    "newtabActiveNormal": "Nouvel onglet activé",
    "newtabActiveHover": "Désactiver",
    "newtabActiveTitle": "Cliquez pour restaurer la page de nouvel onglet par défaut",
    "newtabInactiveText": "Activer nouvel onglet",
    "newtabInactiveTitle": "Activer CanvasTab comme page de nouvel onglet",
    "newtabStatusActive": "Pris en charge par CanvasTab",
    "newtabStatusInactive": "Nouvel onglet par défaut du système",
    "theme_dark": "Sombre de Minuit",
    "theme_light": "Verre Clair",
    "theme_aurora": "Aurore Néon",
    "theme_ocean": "Océan Profond",
    "theme_forest": "Forêt Verte",
    "theme_sunset": "Orange Couchant",
    "theme_sakura": "Rose Sakura",
    "theme_cyberpunk": "Néon Cyberpunk"
  },
  "de": {
    "ctxAdd": "Unterordner erstellen",
    "ctxRename": "Ordner umbenennen",
    "ctxDelete": "Ordner löschen",
    "appName": "📌 Visuelle Lesezeichen",
    "manageMode": "🗃️ Verwaltung",
    "visualMode": "🎨 Visuell",
    "viewCard": "🎴 Karten",
    "viewList": "📝 Liste",
    "viewIcon": "📱 Symbole",
    "searchPlaceholder": "Lesezeichen, Links oder Ordner suchen...",
    "loadingFolders": "Ordner werden geladen...",
    "versionTag": "v1.7 | Hintergrund-Diashow",
    "allBookmarks": "Alle Lesezeichen",
    "folderStatsAll": "Insgesamt {count} Links gesammelt",
    "folderStatsFolder": "Enthält {folders} Ordner, {links} Links",
    "folderStatsVisual": "Visuelle Ansicht | {folders} Ordner, {links} Links",
    "emptyState": "Keine Unterordner oder Lesezeichen-Links gefunden~",
    "modalFolderTitle": "Ordnerinhalt",
    "folderCardCount": "{count} Elemente",
    "statsSearch": "Suche | {folders} Ordner, {links} Links gefunden",
    "tooltipBack": "Zurück",
    "tooltipClose": "Schließen",
    "drawerTitle": "Kontrollzentrum",
    "secMode": "Dashboard-Modus",
    "secModeDesc": "Zwischen vereinfachtem Verwalter und randlosem visuellen Board wechseln",
    "secLayout": "Suchleisten-Layout",
    "secLayoutDesc": "Suchfeldposition und Sichtbarkeit des Dashboards anpassen",
    "layoutGoogleVisual": "Suche + Board",
    "layoutGoogleCollapse": "Suche + Schublade",
    "layoutPureVisual": "Klassische Lesezeichenleiste",
    "secView": "Lesezeichen-Stil",
    "secViewDesc": "Layout der Lesezeichenkarten wechseln",
    "secTheme": "Personalisiertes Thema",
    "secThemeDesc": "Wählen Sie das globale Systemfarbthema",
    "secLang": "Sprache",
    "secWallpaper": "Hintergrundbildeinstellungen",
    "wallpaperDrawerDesc": "Anzeige, Modi, Klarheit und Diashow-Einstellungen werden in der Galerie verwaltet.",
    "btnUploadBg": "Hintergrund Hochladen",
    "btnManageBg": "Galerie Verwalten",
    "newtabStatusLabel": "Neuer-Tab-Status",
    "btnHomepageReset": "Kopfzeilenschaltfläche Wiederherstellen",
    "btnNewtabToggle": "Standard-Neuer-Tab Wiederherstellen",
    "btnDeadLink": "Tote Links Prüfen",
    "btnCreateFolder": "Neuer Ordner",
    "brandLogoSubtitle": "Browser-Lesezeichen-Leinwand",
    "googleVoiceTitle": "Sprachsuche",
    "googleLensTitle": "Bildersuche",
    "googleAiModeText": "KI-Modus",
    "googleAiModeTitle": "Anzeigemodus wechseln",
    "btnNewtabToggleEnable": "CanvasTab Neuer Tab Aktivieren",
    "newtabActiveNormal": "Neuer Tab aktiviert",
    "newtabActiveHover": "Deaktivieren",
    "newtabActiveTitle": "Klicken Sie hier, um die Standard-Neuer-Tab-Seite wiederherzustellen",
    "newtabInactiveText": "Neuer Tab aktivieren",
    "newtabInactiveTitle": "CanvasTab als Neuer-Tab-Seite aktivieren",
    "newtabStatusActive": "Von CanvasTab übernommen",
    "newtabStatusInactive": "Systemstandard-Neuer-Tab",
    "theme_dark": "Mitternachts Dunkelheit",
    "theme_light": "Helles Glas",
    "theme_aurora": "Neon-Aurora",
    "theme_ocean": "Tiefsee",
    "theme_forest": "Waldgrün",
    "theme_sunset": "Sonnenuntergang Orange",
    "theme_sakura": "Kirschblütenrosa",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "it": {
    "ctxAdd": "Nuova sottocartella",
    "ctxRename": "Rinomina cartella",
    "ctxDelete": "Elimina cartella",
    "appName": "📌 CanvasTab Segnalibri",
    "manageMode": "🗃️ Gestisci",
    "visualMode": "🎨 Visuale",
    "viewCard": "🎴 Schede",
    "viewList": "📝 Lista",
    "viewIcon": "📱 Icone",
    "searchPlaceholder": "Cerca segnalibri, link o cartelle...",
    "loadingFolders": "Caricamento cartelle...",
    "versionTag": "v1.7 | Presentazione sfondo",
    "allBookmarks": "Tutti i segnalibri",
    "folderStatsAll": "Totale di {count} collegamenti raccolti",
    "folderStatsFolder": "Contiene {folders} cartelle, {links} link",
    "folderStatsVisual": "Vista Visuale | {folders} cartelle, {links} link",
    "emptyState": "Nessuna sottocartella o link trovato qui~",
    "modalFolderTitle": "Contenuto della cartella",
    "folderCardCount": "{count} elementi",
    "statsSearch": "Ricerca | Trovate {folders} cartelle, {links} link",
    "tooltipBack": "Torna su",
    "tooltipClose": "Chiudi",
    "drawerTitle": "Centro di controllo",
    "secMode": "Modalità Dashboard",
    "secModeDesc": "Passa dal gestore semplificato alla dashboard visuale senza bordi",
    "secLayout": "Layout barra di ricerca",
    "secLayoutDesc": "Regola la posizione della barra di ricerca e la visibilità della dashboard",
    "layoutGoogleVisual": "Ricerca + Dashboard",
    "layoutGoogleCollapse": "Ricerca + Pannello",
    "layoutPureVisual": "Barra dei segnalibri classica",
    "secView": "Stile segnalibro",
    "secViewDesc": "Cambia il layout della griglia dei segnalibri",
    "secTheme": "Tema personalizzato",
    "secThemeDesc": "Seleziona il tema colore globale del sistema",
    "secLang": "Lingua",
    "secWallpaper": "Impostazioni dello sfondo",
    "wallpaperDrawerDesc": "Interruttori, modalità, trasparenza e riproduzione automatica si gestiscono nella galleria.",
    "btnUploadBg": "Carica sfondo",
    "btnManageBg": "Gestisci galleria",
    "newtabStatusLabel": "Stato Nuova Scheda",
    "btnHomepageReset": "Ripristina pulsante intestazione",
    "btnNewtabToggle": "Ripristina Nuova Scheda predefinita",
    "btnDeadLink": "Verifica link interrotti",
    "btnCreateFolder": "Nuova cartella",
    "brandLogoSubtitle": "Tela dei segnalibri del browser",
    "googleVoiceTitle": "Ricerca vocale",
    "googleLensTitle": "Cerca tramite immagine",
    "googleAiModeText": "Modalità IA",
    "googleAiModeTitle": "Cambia modalità di visualizzazione",
    "btnNewtabToggleEnable": "Attiva CanvasTab Nuova Scheda",
    "newtabActiveNormal": "Nuova Scheda attivata",
    "newtabActiveHover": "Disattiva",
    "newtabActiveTitle": "Clicca per ripristinare la pagina Nuova Scheda di sistema",
    "newtabInactiveText": "Attiva Nuova Scheda",
    "newtabInactiveTitle": "Imposta CanvasTab come pagina Nuova Scheda",
    "newtabStatusActive": "Gestito da CanvasTab",
    "newtabStatusInactive": "Nuova Scheda predefinita di sistema",
    "theme_dark": "Buio di Mezzanotte",
    "theme_light": "Vetro Chiaro",
    "theme_aurora": "Aurora al Neon",
    "theme_ocean": "Oceano Profondo",
    "theme_forest": "Verde Foresta",
    "theme_sunset": "Arancione Tramonto",
    "theme_sakura": "Rosa Sakura",
    "theme_cyberpunk": "Neon Cyberpunk"
  },
  "ru": {
    "ctxAdd": "Создать подпапку",
    "ctxRename": "Переименовать папку",
    "ctxDelete": "Удалить эту папку",
    "appName": "📌 Визуальные закладки CanvasTab",
    "manageMode": "🗃️ Управление",
    "visualMode": "🎨 Визуал",
    "viewCard": "🎴 Карточки",
    "viewList": "📝 Список",
    "viewIcon": "📱 Значки",
    "searchPlaceholder": "Поиск закладок, ссылок или папок...",
    "loadingFolders": "Загрузка папок...",
    "versionTag": "v1.7 | Слайд-шоу обоев",
    "allBookmarks": "Все закладки",
    "folderStatsAll": "Всего собрано {count} ссылок",
    "folderStatsFolder": "Содержит {folders} папок, {links} ссылок",
    "folderStatsVisual": "Визуальный режим | {folders} папок, {links} ссылок",
    "emptyState": "Здесь нет подпапок или закладок~",
    "modalFolderTitle": "Содержимое папки",
    "folderCardCount": "{count} элементов",
    "statsSearch": "Поиск | Найдено {folders} папок, {links} ссылок",
    "tooltipBack": "Назад к родителю",
    "tooltipClose": "Закрыть окно",
    "drawerTitle": "Центр управления",
    "secMode": "Режим панели",
    "secModeDesc": "Переключение между упрощенным менеджером и безрамочной панелью",
    "secLayout": "Макет панели поиска",
    "secLayoutDesc": "Настройка положения строки поиска и отображения панели",
    "layoutGoogleVisual": "Поиск + Панель",
    "layoutGoogleCollapse": "Поиск + Выдвижной список",
    "layoutPureVisual": "Классическая панель закладок",
    "secView": "Стиль закладок",
    "secViewDesc": "Переключение сетки карточек закладок",
    "secTheme": "Персональная тема",
    "secThemeDesc": "Выбор глобальной цветовой схемы системы",
    "secLang": "Язык",
    "secWallpaper": "Настройки фоновых обоев",
    "wallpaperDrawerDesc": "Включение, режимы показа, четкость и слайд-шоу настраиваются в галерее.",
    "btnUploadBg": "Загрузить обои",
    "btnManageBg": "Управление галереей",
    "newtabStatusLabel": "Состояние новой вкладки",
    "btnHomepageReset": "Восстановить кнопку в шапке",
    "btnNewtabToggle": "Восстановить стандартную новую вкладку",
    "btnDeadLink": "Проверка битых ссылок",
    "btnCreateFolder": "Создать папку",
    "brandLogoSubtitle": "Холст закладок браузера",
    "googleVoiceTitle": "Голосовой поиск",
    "googleLensTitle": "Поиск по картинке",
    "googleAiModeText": "Режим ИИ",
    "googleAiModeTitle": "Смена режима отображения",
    "btnNewtabToggleEnable": "Включить CanvasTab на новой вкладке",
    "newtabActiveNormal": "Новая вкладка активирована",
    "newtabActiveHover": "Отключить",
    "newtabActiveTitle": "Нажмите для возврата к стандартной новой вкладке",
    "newtabInactiveText": "Активировать новую вкладку",
    "newtabInactiveTitle": "Использовать CanvasTab как новую вкладку",
    "newtabStatusActive": "Управляется CanvasTab",
    "newtabStatusInactive": "Системная новая вкладка по умолчанию",
    "theme_dark": "Полуночная тьма",
    "theme_light": "Светлое стекло",
    "theme_aurora": "Неоновая аврора",
    "theme_ocean": "Глубокий океан",
    "theme_forest": "Лесная зелень",
    "theme_sunset": "Закатный оранжевый",
    "theme_sakura": "Розовая сакура",
    "theme_cyberpunk": "Киберпанк неон"
  },
  "pt": {
    "ctxAdd": "Criar subpasta",
    "ctxRename": "Renomear pasta",
    "ctxDelete": "Excluir pasta",
    "appName": "📌 CanvasTab Favoritos",
    "manageMode": "🗃️ Gerenciar",
    "visualMode": "🎨 Visual",
    "viewCard": "🎴 Cartões",
    "viewList": "📝 Lista",
    "viewIcon": "📱 Ícones",
    "searchPlaceholder": "Pesquisar favoritos, links ou pastas...",
    "loadingFolders": "Carregando pastas...",
    "versionTag": "v1.7 | Slideshow de fundo",
    "allBookmarks": "Todos os favoritos",
    "folderStatsAll": "Total de {count} links coletados",
    "folderStatsFolder": "Contém {folders} pastas, {links} links",
    "folderStatsVisual": "Modo Visual | {folders} pastas, {links} links",
    "emptyState": "Nenhuma subpasta ou link encontrado aqui~",
    "modalFolderTitle": "Conteúdo da pasta",
    "folderCardCount": "{count} itens",
    "statsSearch": "Busca | Encontrado {folders} pastas, {links} links",
    "tooltipBack": "Voltar ao topo",
    "tooltipClose": "Fechar",
    "drawerTitle": "Centro de Controle",
    "secMode": "Modo Dashboard",
    "secModeDesc": "Alternar entre gerenciador simplificado e painel visual sem bordas",
    "secLayout": "Layout da barra de pesquisa",
    "secLayoutDesc": "Ajustar posição da barra de pesquisa e visibilidade do painel",
    "layoutGoogleVisual": "Pesquisa + Painel",
    "layoutGoogleCollapse": "Pesquisa + Gaveta",
    "layoutPureVisual": "Barra de favoritos clássica",
    "secView": "Estilo de favorito",
    "secViewDesc": "Alternar visualização em grade dos favoritos",
    "secTheme": "Tema personalizado",
    "secThemeDesc": "Selecionar o tema de cores global do sistema",
    "secLang": "Idioma",
    "secWallpaper": "Configurações de papel de parede",
    "wallpaperDrawerDesc": "Chaveamento, exibição, opacidade e slideshow são controlados na galeria.",
    "btnUploadBg": "Enviar papel de parede",
    "btnManageBg": "Gerenciar galeria",
    "newtabStatusLabel": "Estado da Nova Guia",
    "btnHomepageReset": "Restaurar botão superior",
    "btnNewtabToggle": "Restaurar Nova Guia padrão",
    "btnDeadLink": "Verificador de links quebrados",
    "btnCreateFolder": "Nova pasta",
    "brandLogoSubtitle": "Tela de favoritos do navegador",
    "googleVoiceTitle": "Pesquisa por voz",
    "googleLensTitle": "Pesquisar por imagem",
    "googleAiModeText": "Modo IA",
    "googleAiModeTitle": "Alternar modo de exibição",
    "btnNewtabToggleEnable": "Ativar CanvasTab Nova Guia",
    "newtabActiveNormal": "Nova Guia ativada",
    "newtabActiveHover": "Desativar",
    "newtabActiveTitle": "Clique para restaurar a página Nova Guia de fábrica",
    "newtabInactiveText": "Ativar Nova Guia",
    "newtabInactiveTitle": "Definir CanvasTab como página Nova Guia",
    "newtabStatusActive": "Controlado por CanvasTab",
    "newtabStatusInactive": "Nova Guia padrão do sistema",
    "theme_dark": "Escuro da Meia-Noite",
    "theme_light": "Vidro Claro",
    "theme_aurora": "Aurora de Neon",
    "theme_ocean": "Oceano Profundo",
    "theme_forest": "Verde Floresta",
    "theme_sunset": "Laranja Pôr do Sol",
    "theme_sakura": "Rosa de Sakura",
    "theme_cyberpunk": "Neon Cyberpunk"
  },
  "nl": {
    "ctxAdd": "Nieuwe submap",
    "ctxRename": "Hernoem map",
    "ctxDelete": "Verwijder map",
    "appName": "📌 CanvasTab Bladwijzers",
    "manageMode": "🗃️ Beheer",
    "visualMode": "🎨 Visueel",
    "viewCard": "🎴 Kaarten",
    "viewList": "📝 Lijst",
    "viewIcon": "📱 Pictogrammen",
    "searchPlaceholder": "Zoek bladwijzers, links of mappen...",
    "loadingFolders": "Mappen laden...",
    "versionTag": "v1.7 | Diavoorstelling achtergrond",
    "allBookmarks": "Alle bladwijzers",
    "folderStatsAll": "Totaal {count} links verzameld",
    "folderStatsFolder": "Bevat {folders} mappen, {links} links",
    "folderStatsVisual": "Visuele modus | {folders} mappen, {links} links",
    "emptyState": "Geen submappen of links gevonden~",
    "modalFolderTitle": "Mapinhoud",
    "folderCardCount": "{count} items",
    "statsSearch": "Zoeken | {folders} mappen, {links} links gevonden",
    "tooltipBack": "Terug naar boven",
    "tooltipClose": "Sluiten",
    "drawerTitle": "Controlecentrum",
    "secMode": "Dashboard-modus",
    "secModeDesc": "Schakelen tussen vereenvoudigd beheer en randloos visueel dashboard",
    "secLayout": "Zoekbalk-indeling",
    "secLayoutDesc": "Pas de zoekbalkpositie en dashboardzichtbaarheid aan",
    "layoutGoogleVisual": "Zoeken + Dashboard",
    "layoutGoogleCollapse": "Zoeken + Zijpaneel",
    "layoutPureVisual": "Klassieke bladwijzerbalk",
    "secView": "Bladwijzerstijl",
    "secViewDesc": "Schakel lay-out van bladwijzerkaarten om",
    "secTheme": "Gepersonaliseerd thema",
    "secThemeDesc": "Selecteer het globale kleurthema van het systeem",
    "secLang": "Taal",
    "secWallpaper": "Achtergrondinstellingen",
    "wallpaperDrawerDesc": "Aan/uit, modi, helderheid en slideshow instellingen worden in de galerij beheerd.",
    "btnUploadBg": "Achtergrond uploaden",
    "btnManageBg": "Galerie beheren",
    "newtabStatusLabel": "Nieuwe Tab status",
    "btnHomepageReset": "Kopknop herstellen",
    "btnNewtabToggle": "Standaard Nieuwe Tab herstellen",
    "btnDeadLink": "Dode link checker",
    "btnCreateFolder": "Nieuwe map",
    "brandLogoSubtitle": "Browser bladwijzer canvas",
    "googleVoiceTitle": "Spraakgestuurd zoeken",
    "googleLensTitle": "Zoeken met afbeelding",
    "googleAiModeText": "AI-modus",
    "googleAiModeTitle": "Weergavemodus wisselen",
    "btnNewtabToggleEnable": "CanvasTab Nieuwe Tab activeren",
    "newtabActiveNormal": "Nieuwe Tab geactiveerd",
    "newtabActiveHover": "Uitschakelen",
    "newtabActiveTitle": "Klik om de standaard Nieuwe Tab-pagina te herstellen",
    "newtabInactiveText": "Nieuwe Tab activeren",
    "newtabInactiveTitle": "Stel CanvasTab in als Nieuwe Tab-pagina",
    "newtabStatusActive": "Beheerd door CanvasTab",
    "newtabStatusInactive": "Standaard systeem Nieuwe Tab",
    "theme_dark": "Middernacht Donker",
    "theme_light": "Licht Glas",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Diepe Oceaan",
    "theme_forest": "Bosgroen",
    "theme_sunset": "Zonsondergang Oranje",
    "theme_sakura": "Kersenbloesem Roze",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "pl": {
    "ctxAdd": "Nowy podfolder",
    "ctxRename": "Zmień nazwę",
    "ctxDelete": "Usuń folder",
    "appName": "📌 Zakładki Wizualne CanvasTab",
    "manageMode": "🗃️ Menedżer",
    "visualMode": "🎨 Wizualny",
    "viewCard": "🎴 Karty",
    "viewList": "📝 Lista",
    "viewIcon": "📱 Ikony",
    "searchPlaceholder": "Szukaj zakładek, linków lub folderów...",
    "loadingFolders": "Ładowanie folderów...",
    "versionTag": "v1.7 | Pokaz slajdów tapet",
    "allBookmarks": "Wszystkie zakładki",
    "folderStatsAll": "Łącznie zebrano {count} linków",
    "folderStatsFolder": "Zawiera {folders} folderów, {links} linków",
    "folderStatsVisual": "Widok Wizualny | {folders} folderów, {links} linków",
    "emptyState": "Brak podfolderów lub linków zakładek~",
    "modalFolderTitle": "Zawartość folderu",
    "folderCardCount": "{count} elementów",
    "statsSearch": "Wyszukiwanie | Znaleziono {folders} folderów, {links} linków",
    "tooltipBack": "W górę",
    "tooltipClose": "Zamknij",
    "drawerTitle": "Centrum sterowania",
    "secMode": "Tryb pulpitu",
    "secModeDesc": "Przełączaj między uproszczonym menedżerem a wizualnym pulpitem bez ramek",
    "secLayout": "Układ paska wyszukiwania",
    "secLayoutDesc": "Dostosuj pozycję paska wyszukiwania i widoczność pulpitu",
    "layoutGoogleVisual": "Wyszukiwanie + Pulpit",
    "layoutGoogleCollapse": "Wyszukiwanie + Szuflada",
    "layoutPureVisual": "Klasyczny pasek zakładek",
    "secView": "Styl zakładek",
    "secViewDesc": "Zmień układ siatki kart zakładek",
    "secTheme": "Personalizacja motywu",
    "secThemeDesc": "Wybierz globalny motyw kolorystyczny systemu",
    "secLang": "Język",
    "secWallpaper": "Ustawienia tapety tła",
    "wallpaperDrawerDesc": "Włączanie, tryby wyświetlania, przezroczystość i pokaz slajdów są zarządzane w galerii.",
    "btnUploadBg": "Prześlij tapetę",
    "btnManageBg": "Zarządzaj galerią",
    "newtabStatusLabel": "Status nowej karty",
    "btnHomepageReset": "Przywróć przycisk nagłówka",
    "btnNewtabToggle": "Przywróć domyślną nową kartę",
    "btnDeadLink": "Sprawdzanie martwych linków",
    "btnCreateFolder": "Nowy folder",
    "brandLogoSubtitle": "Płótno zakładek przeglądarki",
    "googleVoiceTitle": "Wyszukiwanie głosowe",
    "googleLensTitle": "Szukaj za pomocą obrazu",
    "googleAiModeText": "Tryb AI",
    "googleAiModeTitle": "Przełącz tryb wyświetlania",
    "btnNewtabToggleEnable": "Włącz CanvasTab na nowej karcie",
    "newtabActiveNormal": "Nowa karta włączona",
    "newtabActiveHover": "Wyłącz",
    "newtabActiveTitle": "Kliknij, aby przywrócić domyślną nową kartę systemową",
    "newtabInactiveText": "Włącz nową kartę",
    "newtabInactiveTitle": "Ustaw CanvasTab jako stronę nowej karty",
    "newtabStatusActive": "Zarządzane przez CanvasTab",
    "newtabStatusInactive": "Domyślna nowa karta systemowa",
    "theme_dark": "Północna Ciemność",
    "theme_light": "Jasne Szkło",
    "theme_aurora": "Neonowa Aurora",
    "theme_ocean": "Głęboki Ocean",
    "theme_forest": "Leśna Zieleń",
    "theme_sunset": "Pomarańczowy Zachód",
    "theme_sakura": "Różowa Sakura",
    "theme_cyberpunk": "Cyberpunkowy Neon"
  },
  "tr": {
    "ctxAdd": "Alt Klasör Oluştur",
    "ctxRename": "Klasörü Yeniden Adlandır",
    "ctxDelete": "Klasörü Sil",
    "appName": "📌 CanvasTab Yer İmleri",
    "manageMode": "🗃️ Yönetim",
    "visualMode": "🎨 Görsel",
    "viewCard": "🎴 Kart",
    "viewList": "📝 Liste",
    "viewIcon": "📱 Simge",
    "searchPlaceholder": "Yer imlerini, bağlantıları veya klasörleri ara...",
    "loadingFolders": "Klasörler yükleniyor...",
    "versionTag": "v1.7 | Duvar Kağıdı Slayt Gösterisi",
    "allBookmarks": "Tüm Yer İmleri",
    "folderStatsAll": "Toplam {count} bağlantı toplandı",
    "folderStatsFolder": "{folders} klasör, {links} bağlantı içeriyor",
    "folderStatsVisual": "Görsel Görünüm | {folders} klasör, {links} bağlantı",
    "emptyState": "Burada alt klasör veya bağlantı bulunamadı~",
    "modalFolderTitle": "Klasör İçeriği",
    "folderCardCount": "{count} öge",
    "statsSearch": "Arama | {folders} klasör, {links} bağlantı bulundu",
    "tooltipBack": "Üst dizine dön",
    "tooltipClose": "Kapat",
    "drawerTitle": "Kontrol Merkezi",
    "secMode": "Kontrol Paneli Modu",
    "secModeDesc": "Basit yönetim ile sınırsız görsel panel arasında geçiş yapın",
    "secLayout": "Arama Çubuğu Düzeni",
    "secLayoutDesc": "Arama kutusu konumunu ve panel görünürlüğünü ayarlayın",
    "layoutGoogleVisual": "Arama + Panel",
    "layoutGoogleCollapse": "Arama + Yan Bölme",
    "layoutPureVisual": "Klasik Yer İmleri Çubuğu",
    "secView": "Yer İmleri Stili",
    "secViewDesc": "Yer imi kartları ızgara düzenini değiştirin",
    "secTheme": "Kişiselleştirilmiş Tema",
    "secThemeDesc": "Sistem genel renk temasını seçin",
    "secLang": "Dil",
    "secWallpaper": "Duvar Kağıdı Arka Plan Ayarları",
    "wallpaperDrawerDesc": "Açma/kapatma, gösterim modları, şeffaflık ve slayt ayarları galeriden yönetilir.",
    "btnUploadBg": "Duvar Kağıdı Yükle",
    "btnManageBg": "Galeriyi Yönet",
    "newtabStatusLabel": "Yeni Sekme Durumu",
    "btnHomepageReset": "Üst Başlık Butonunu Geri Yükle",
    "btnNewtabToggle": "Varsayılan Yeni Sekmeyi Geri Yükle",
    "btnDeadLink": "Kırık Bağlantı Tarayıcı",
    "btnCreateFolder": "Yeni Klasör",
    "brandLogoSubtitle": "Tarayıcı Yer İmleri Tuvali",
    "googleVoiceTitle": "Sesli Arama",
    "googleLensTitle": "Görselle Ara",
    "googleAiModeText": "AI Modu",
    "googleAiModeTitle": "Gösterim modunu değiştir",
    "btnNewtabToggleEnable": "CanvasTab Yeni Sekmesini Etkinleştir",
    "newtabActiveNormal": "Yeni Sekme Etkinleştirildi",
    "newtabActiveHover": "Devre Dışı Bırak",
    "newtabActiveTitle": "Varsayılan tarayıcı yeni sekmesini geri yüklemek için tıklayın",
    "newtabInactiveText": "Yeni Sekmeyi Etkinleştir",
    "newtabInactiveTitle": "CanvasTab'ı yeni sekme sayfası olarak ayarlayın",
    "newtabStatusActive": "CanvasTab tarafından yönetiliyor",
    "newtabStatusInactive": "Sistem Varsayılan Yeni Sekmesi",
    "theme_dark": "Gece Yarısı Karanlığı",
    "theme_light": "Açık Cam",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Derin Okyanus",
    "theme_forest": "Orman Yeşili",
    "theme_sunset": "Gün Batımı Turuncusu",
    "theme_sakura": "Kiraz Çiçeği Pembesi",
    "theme_cyberpunk": "Siberpunk Neon"
  },
  "ar": {
    "ctxAdd": "إنشاء مجلد فرعي",
    "ctxRename": "إعادة تسمية المجلد",
    "ctxDelete": "حذف هذا المجلد",
    "appName": "📌 لوحة إشارات CanvasTab",
    "manageMode": "🗃️ إدارة",
    "visualMode": "🎨 مرئي",
    "viewCard": "🎴 بطاقات",
    "viewList": "📝 قائمة",
    "viewIcon": "📱 أيقونات",
    "searchPlaceholder": "البحث عن الإشارات المرجعية، الروابط أو المجلدات...",
    "loadingFolders": "جاري تحميل المجلدات...",
    "versionTag": "v1.7 | عرض خلفيات متسلسل",
    "allBookmarks": "جميع الإشارات المرجعية",
    "folderStatsAll": "تم جمع إجمالي {count} من الروابط",
    "folderStatsFolder": "يحتوي على {folders} مجلدات، {links} روابط",
    "folderStatsVisual": "الوضع المرئي | {folders} مجلدات، {links} روابط",
    "emptyState": "لم يتم العثور على مجلدات فرعية أو روابط هنا~",
    "modalFolderTitle": "محتوى المجلد",
    "folderCardCount": "{count} عناصر",
    "statsSearch": "البحث | تم العثور على {folders} مجلدات، {links} روابط",
    "tooltipBack": "العودة للمجلد الأعلى",
    "tooltipClose": "إغلاق",
    "drawerTitle": "مركز التحكم",
    "secMode": "وضع اللوحة",
    "secModeDesc": "التبديل بين المدير المبسط ولوحة التحكم المرئية بدون حدود",
    "secLayout": "مخطط شريط البحث",
    "secLayoutDesc": "ضبط موضع صندوق البحث وظهور اللوحة",
    "layoutGoogleVisual": "البحث + اللوحة",
    "layoutGoogleCollapse": "البحث + الدرج",
    "layoutPureVisual": "شريط الإشارات الكلاسيكي",
    "secView": "نمط الإشارات المرجعية",
    "secViewDesc": "تبديل تخطيط شبكة بطاقات الإشارات",
    "secTheme": "سمة مخصصة",
    "secThemeDesc": "اختر سمة الألوان العامة للنظام",
    "secLang": "اللغة",
    "secWallpaper": "إعدادات خلفية الشاشة",
    "wallpaperDrawerDesc": "تتم إدارة مفاتيح التبديل، وأوضاع العرض، والوضوح، وإعدادات العرض المتسلسل في المعرض.",
    "btnUploadBg": "رفع خلفية",
    "btnManageBg": "إدارة المعرض",
    "newtabStatusLabel": "حالة علامة التبويب الجديدة",
    "btnHomepageReset": "استعادة زر الترويسة",
    "btnNewtabToggle": "استعادة علامة التبويب الافتراضية",
    "btnDeadLink": "فاحص الروابط المعطلة",
    "btnCreateFolder": "مجلد جديد",
    "brandLogoSubtitle": "لوحة إشارات المتصفح المرجعية",
    "googleVoiceTitle": "البحث الصوتي",
    "googleLensTitle": "بحث عبر الصورة",
    "googleAiModeText": "وضع الذكاء الاصطناعي",
    "googleAiModeTitle": "تبديل وضع العرض",
    "btnNewtabToggleEnable": "تفعيل CanvasTab كعلامة تبويب جديدة",
    "newtabActiveNormal": "تم تفعيل علامة التبويب الجديدة",
    "newtabActiveHover": "تعطيل",
    "newtabActiveTitle": "انقر لاستعادة علامة التبويب الافتراضية للنظام",
    "newtabInactiveText": "تفعيل علامة التبويب الجديدة",
    "newtabInactiveTitle": "تعيين CanvasTab كصفحة تبويب جديدة افتراضية",
    "newtabStatusActive": "تدار بواسطة CanvasTab",
    "newtabStatusInactive": "علامة التبويب الجديدة الافتراضية للنظام",
    "theme_dark": "ظلام منتصف الليل",
    "theme_light": "زجاج مضيء",
    "theme_aurora": "شفق النيون",
    "theme_ocean": "المحيط العميق",
    "theme_forest": "غابة خضراء",
    "theme_sunset": "برتقالي الغروب",
    "theme_sakura": "وردي الساكورا",
    "theme_cyberpunk": "نيون سايبربانك"
  },
  "hi": {
    "ctxAdd": "उप-फ़ोल्डर बनाएं",
    "ctxRename": "फ़ोल्डर का नाम बदलें",
    "ctxDelete": "फ़ोल्डर हटाएँ",
    "appName": "📌 CanvasTab बुकमार्क",
    "manageMode": "🗃️ प्रबंधन",
    "visualMode": "🎨 दृश्य",
    "viewCard": "🎴 कार्ड",
    "viewList": "📝 सूची",
    "viewIcon": "📱 चिह्न",
    "searchPlaceholder": "बुकमार्क, लिंक या फ़ोल्डर खोजें...",
    "loadingFolders": "फ़ोल्डर लोड हो रहे हैं...",
    "versionTag": "v1.7 | वॉलपेपर स्लाइड शो",
    "allBookmarks": "सभी बुकमार्क",
    "folderStatsAll": "कुल {count} लिंक एकत्रित किए गए",
    "folderStatsFolder": "इसमें {folders} फ़ोल्डर, {links} लिंक शामिल हैं",
    "folderStatsVisual": "दृश्य मोड | {folders} फ़ोल्डर, {links} लिंक",
    "emptyState": "यहाँ कोई उप-फ़ोल्डर या बुकमार्क लिंक नहीं मिले~",
    "modalFolderTitle": "फ़ोल्डर की सामग्री",
    "folderCardCount": "{count} आइटम",
    "statsSearch": "खोज | {folders} फ़ोल्डर, {links} लिंक मिले",
    "tooltipBack": "मुख्य फ़ोल्डर पर जाएं",
    "tooltipClose": "बंद करें",
    "drawerTitle": "नियंत्रण केंद्र",
    "secMode": "डैशबोर्ड मोड",
    "secModeDesc": "सरल प्रबंधक और बिना बॉर्डर वाले दृश्य डैशबोर्ड के बीच स्विच करें",
    "secLayout": "खोज पट्टी लेआउट",
    "secLayoutDesc": "खोज बॉक्स की स्थिति और डैशबोर्ड की दृश्यता समायोजित करें",
    "layoutGoogleVisual": "खोज + डैशबोर्ड",
    "layoutGoogleCollapse": "खोज + दराज",
    "layoutPureVisual": "क्लासिक बुकमार्क बार",
    "secView": "बुकमार्क शैली",
    "secViewDesc": "बुकमार्क कार्ड ग्रिड लेआउट स्विच करें",
    "secTheme": "व्यक्तिगत थीम",
    "secThemeDesc": "वैश्विक सिस्टम रंग थीम चुनें",
    "secLang": "भाषा",
    "secWallpaper": "वॉलपेपर पृष्ठभूमि सेटिंग्स",
    "wallpaperDrawerDesc": "स्विच, डिस्प्ले मोड, स्पष्टता और स्लाइड शो सेटिंग्स गैलरी में प्रबंधित की जाती हैं।",
    "btnUploadBg": "वॉलपेपर अपलोड करें",
    "btnManageBg": "गैलरी प्रबंधित करें",
    "newtabStatusLabel": "नया टैब स्थिति",
    "btnHomepageReset": "हेडर बटन पुनर्स्थापित करें",
    "btnNewtabToggle": "डिफ़ॉल्ट नया टैब पुनर्स्थापित करें",
    "btnDeadLink": "टूटे लिंक की जाँच",
    "btnCreateFolder": "नया फ़ोल्डर",
    "brandLogoSubtitle": "ब्राउज़र बुकमार्क कैनवास",
    "googleVoiceTitle": "आवाज खोज",
    "googleLensTitle": "छवि द्वारा खोजें",
    "googleAiModeText": "एआई मोड",
    "googleAiModeTitle": "प्रदर्शन मोड टॉगल करें",
    "btnNewtabToggleEnable": "CanvasTab नया टैब सक्षम करें",
    "newtabActiveNormal": "नया टैब सक्षम किया गया",
    "newtabActiveHover": "अक्षम करें",
    "newtabActiveTitle": "सिस्टम डिफ़ॉल्ट नया टैब पृष्ठ पुनर्स्थापित करने के लिए क्लिक करें",
    "newtabInactiveText": "नया टैब सक्षम करें",
    "newtabInactiveTitle": "CanvasTab को अपने नए टैब पृष्ठ के रूप में सेट करें",
    "newtabStatusActive": "CanvasTab द्वारा नियंत्रित",
    "newtabStatusInactive": "सिस्टम डिफ़ॉल्ट नया टैब",
    "theme_dark": "आधी रात का अंधेरा",
    "theme_light": "हल्का कांच",
    "theme_aurora": "नियॉन अरोरा",
    "theme_ocean": "गहरा महासागर",
    "theme_forest": "वन हरा",
    "theme_sunset": "सूर्यास्त नारंगी",
    "theme_sakura": "सकुरा गुलाबी",
    "theme_cyberpunk": "साइबरपंक नियॉन"
  },
  "th": {
    "ctxAdd": "สร้างโฟลเดอร์ย่อย",
    "ctxRename": "เปลี่ยนชื่อโฟลเดอร์",
    "ctxDelete": "ลบโฟลเดอร์นี้",
    "appName": "📌 บุ๊กมาร์ก CanvasTab",
    "manageMode": "🗃️ การจัดการ",
    "visualMode": "🎨 มุมมองภาพ",
    "viewCard": "🎴 การ์ด",
    "viewList": "📝 รายการ",
    "viewIcon": "📱 ไอคอน",
    "searchPlaceholder": "ค้นหาบุ๊กมาร์ก ลิงก์ หรือโฟลเดอร์...",
    "loadingFolders": "กำลังโหลดโฟลเดอร์...",
    "versionTag": "v1.7 | สไลด์โชว์พื้นหลัง",
    "allBookmarks": "บุ๊กมาร์กทั้งหมด",
    "folderStatsAll": "รวบรวมลิงก์ทั้งหมด {count} รายการ",
    "folderStatsFolder": "มี {folders} โฟลเดอร์, {links} ลิงก์",
    "folderStatsVisual": "โหมดภาพ | มี {folders} โฟลเดอร์, {links} ลิงก์",
    "emptyState": "ไม่พบโฟลเดอร์ย่อยหรือลิงก์บุ๊กมาร์กที่นี่~",
    "modalFolderTitle": "เนื้อหาโฟลเดอร์",
    "folderCardCount": "{count} รายการ",
    "statsSearch": "ค้นหา | พบ {folders} โฟลเดอร์, {links} ลิงก์",
    "tooltipBack": "กลับไปยังเมนูก่อนหน้า",
    "tooltipClose": "ปิด",
    "drawerTitle": "ศูนย์ควบคุม",
    "secMode": "โหมดแดชบอร์ด",
    "secModeDesc": "สลับระหว่างโหมดจัดการอย่างง่ายและแดชบอร์ดภาพแบบไร้ขอบ",
    "secLayout": "เค้าโครงแถบค้นหา",
    "secLayoutDesc": "ปรับตำแหน่งของช่องค้นหาและการแสดงผลของแดชบอร์ด",
    "layoutGoogleVisual": "ค้นหา + แดชบอร์ด",
    "layoutGoogleCollapse": "ค้นหา + แผงสไลด์",
    "layoutPureVisual": "แถบบุ๊กมาร์กแบบคลาสสิก",
    "secView": "รูปแบบบุ๊กมาร์ก",
    "secViewDesc": "สลับเค้าโครงตารางของการ์ดบุ๊กมาร์ก",
    "secTheme": "ธีมที่ปรับแต่งเอง",
    "secThemeDesc": "เลือกธีมสีหลักของระบบ",
    "secLang": "ภาษา",
    "secWallpaper": "ตั้งค่าพื้นหลังวอลเปเปอร์",
    "wallpaperDrawerDesc": "สวิตช์เปิดปิด, โหมดแสดงผล, ความโปร่งใส และการเล่นอัตโนมัติจะจัดการในแกลเลอรี",
    "btnUploadBg": "อัปโหลดวอลเปเปอร์",
    "btnManageBg": "จัดการแกลเลอรี",
    "newtabStatusLabel": "สถานะแท็บใหม่",
    "btnHomepageReset": "คืนค่าปุ่มส่วนหัว",
    "btnNewtabToggle": "คืนค่าแท็บใหม่เริ่มต้น",
    "btnDeadLink": "ตรวจสอบลิงก์เสีย",
    "btnCreateFolder": "โฟลเดอร์ใหม่",
    "brandLogoSubtitle": "ผืนผ้าใบสะสมบุ๊กมาร์กเบราว์เซอร์",
    "googleVoiceTitle": "ค้นหาด้วยเสียง",
    "googleLensTitle": "ค้นหาด้วยภาพ",
    "googleAiModeText": "โหมด AI",
    "googleAiModeTitle": "สลับโหมดการแสดงผล",
    "btnNewtabToggleEnable": "เปิดใช้งาน CanvasTab แท็บใหม่",
    "newtabActiveNormal": "เปิดใช้งานแท็บใหม่แล้ว",
    "newtabActiveHover": "ปิดใช้งาน",
    "newtabActiveTitle": "คลิกเพื่อกลับไปใช้แท็บใหม่เริ่มต้นของเบราว์เซอร์",
    "newtabInactiveText": "เปิดใช้งานแท็บใหม่",
    "newtabInactiveTitle": "ตั้งค่า CanvasTab เป็นหน้าแท็บใหม่ของคุณ",
    "newtabStatusActive": "ควบคุมโดย CanvasTab",
    "newtabStatusInactive": "แท็บใหม่เริ่มต้นของระบบ",
    "theme_dark": "มืดมิดเที่ยงคืน",
    "theme_light": "กระจกใส",
    "theme_aurora": "แสงเหนือเนออน",
    "theme_ocean": "มหาสมุทรลึก",
    "theme_forest": "เขียวป่าไม้",
    "theme_sunset": "ส้มพระอาทิตย์ตก",
    "theme_sakura": "ชมพูซากุระ",
    "theme_cyberpunk": "ไซเบอร์พังก์นีออน"
  },
  "vi": {
    "ctxAdd": "Tạo thư mục con",
    "ctxRename": "Đổi tên thư mục",
    "ctxDelete": "Xóa thư mục này",
    "appName": "📌 Dấu trang CanvasTab",
    "manageMode": "🗃️ Quản lý",
    "visualMode": "🎨 Trực quan",
    "viewCard": "🎴 Thẻ",
    "viewList": "📝 Danh sách",
    "viewIcon": "📱 Biểu tượng",
    "searchPlaceholder": "Tìm kiếm dấu trang, liên kết hoặc thư mục...",
    "loadingFolders": "Đang tải thư mục...",
    "versionTag": "v1.7 | Trình chiếu hình nền",
    "allBookmarks": "Tất cả dấu trang",
    "folderStatsAll": "Tổng cộng thu thập {count} liên kết",
    "folderStatsFolder": "Chứa {folders} thư mục, {links} liên kết",
    "folderStatsVisual": "Chế độ Trực quan | {folders} thư mục, {links} liên kết",
    "emptyState": "Không tìm thấy thư mục con hoặc liên kết dấu trang ở đây~",
    "modalFolderTitle": "Nội dung thư mục",
    "folderCardCount": "{count} mục",
    "statsSearch": "Tìm kiếm | Tìm thấy {folders} thư mục, {links} liên kết",
    "tooltipBack": "Trở lại danh mục cha",
    "tooltipClose": "Đóng",
    "drawerTitle": "Trung tâm điều khiển",
    "secMode": "Chế độ Dashboard",
    "secModeDesc": "Chuyển đổi giữa quản lý đơn giản và dashboard trực quan không viền",
    "secLayout": "Bố cục thanh tìm kiếm",
    "secLayoutDesc": "Điều chỉnh vị trí hộp tìm kiếm và hiển thị dashboard",
    "layoutGoogleVisual": "Tìm kiếm + Dashboard",
    "layoutGoogleCollapse": "Tìm kiếm + Ngăn kéo",
    "layoutPureVisual": "Thanh dấu trang cổ điển",
    "secView": "Kiểu dấu trang",
    "secViewDesc": "Chuyển đổi bố cục lưới thẻ dấu trang",
    "secTheme": "Chủ đề cá nhân hóa",
    "secThemeDesc": "Chọn chủ đề màu hệ thống toàn cục",
    "secLang": "Ngôn ngữ",
    "secWallpaper": "Cài đặt hình nền",
    "wallpaperDrawerDesc": "Bật/tắt, chế độ hiển thị, độ trong suốt và trình chiếu được quản lý trong thư viện.",
    "btnUploadBg": "Tải lên hình nền",
    "btnManageBg": "Quản lý thư viện",
    "newtabStatusLabel": "Trạng thái Tab Mới",
    "btnHomepageReset": "Khôi phục nút tiêu đề",
    "btnNewtabToggle": "Khôi phục Tab Mới mặc định",
    "btnDeadLink": "Kiểm tra liên kết chết",
    "btnCreateFolder": "Thư mục mới",
    "brandLogoSubtitle": "Khung vẽ dấu trang trình duyệt",
    "googleVoiceTitle": "Tìm kiếm bằng giọng nói",
    "googleLensTitle": "Tìm kiếm bằng hình ảnh",
    "googleAiModeText": "Chế độ AI",
    "googleAiModeTitle": "Chuyển đổi chế độ hiển thị",
    "btnNewtabToggleEnable": "Kích hoạt CanvasTab Tab Mới",
    "newtabActiveNormal": "Đã kích hoạt Tab Mới",
    "newtabActiveHover": "Tắt kích hoạt",
    "newtabActiveTitle": "Nhấp để khôi phục trang Tab Mới mặc định của hệ thống",
    "newtabInactiveText": "Kích hoạt Tab Mới",
    "newtabInactiveTitle": "Đặt CanvasTab làm trang Tab Mới của bạn",
    "newtabStatusActive": "Được quản lý bởi CanvasTab",
    "newtabStatusInactive": "Tab Mới mặc định của hệ thống",
    "theme_dark": "Tối Đêm",
    "theme_light": "Kính Sáng",
    "theme_aurora": "Cực Quang Neon",
    "theme_ocean": "Đại Dương Sâu",
    "theme_forest": "Xanh Rừng",
    "theme_sunset": "Cam Hoàng Hôn",
    "theme_sakura": "Hồng Anh Đào",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "id": {
    "ctxAdd": "Buat Subfolder",
    "ctxRename": "Ubah Nama Folder",
    "ctxDelete": "Hapus Folder Ini",
    "appName": "📌 Markah CanvasTab",
    "manageMode": "🗃️ Pengelola",
    "visualMode": "🎨 Visual",
    "viewCard": "🎴 Kartu",
    "viewList": "📝 Daftar",
    "viewIcon": "📱 Ikon",
    "searchPlaceholder": "Cari markah, tautan, atau folder...",
    "loadingFolders": "Memuat folder...",
    "versionTag": "v1.7 | Slideshow Latar Belakang",
    "allBookmarks": "Semua Markah",
    "folderStatsAll": "Total {count} tautan terkumpul",
    "folderStatsFolder": "Berisi {folders} folder, {links} tautan",
    "folderStatsVisual": "Mode Visual | {folders} folder, {links} tautan",
    "emptyState": "Tidak ada subfolder atau markah ditemukan di sini~",
    "modalFolderTitle": "Isi Folder",
    "folderCardCount": "{count} item",
    "statsSearch": "Cari | Menemukan {folders} folder, {links} tautan",
    "tooltipBack": "Kembali ke folder induk",
    "tooltipClose": "Tutup",
    "drawerTitle": "Pusat Kontrol",
    "secMode": "Mode Dashboard",
    "secModeDesc": "Beralih antara pengelola sederhana dan dashboard visual tanpa bingkai",
    "secLayout": "Tata Letak Bilah Pencarian",
    "secLayoutDesc": "Sesuaikan posisi kotak pencarian dan visibilitas dashboard",
    "layoutGoogleVisual": "Pencarian + Dashboard",
    "layoutGoogleCollapse": "Pencarian + Laci",
    "layoutPureVisual": "Bilah Markah Klasik",
    "secView": "Gaya Markah",
    "secViewDesc": "Ubah tata letak kisi kartu markah",
    "secTheme": "Tema Personalisasi",
    "secThemeDesc": "Pilih tema warna sistem global",
    "secLang": "Bahasa",
    "secWallpaper": "Pengaturan Latar Belakang",
    "wallpaperDrawerDesc": "Sakelar, mode tampilan, opasitas, dan tayangan salintia dikelola di galeri.",
    "btnUploadBg": "Unggah Wallpaper",
    "btnManageBg": "Kelola Galeri",
    "newtabStatusLabel": "Status Tab Baru",
    "btnHomepageReset": "Pulihkan Tombol Header",
    "btnNewtabToggle": "Pulihkan Tab Baru Bawaan",
    "btnDeadLink": "Pemeriksa Tautan Rusak",
    "btnCreateFolder": "Folder Baru",
    "brandLogoSubtitle": "Kanvas Markah Peramban",
    "googleVoiceTitle": "Pencarian Suara",
    "googleLensTitle": "Cari dengan Gambar",
    "googleAiModeText": "Mode AI",
    "googleAiModeTitle": "Alihkan mode tampilan",
    "btnNewtabToggleEnable": "Aktifkan CanvasTab Tab Baru",
    "newtabActiveNormal": "Tab Baru Diaktifkan",
    "newtabActiveHover": "Nonaktifkan",
    "newtabActiveTitle": "Klik untuk memulihkan halaman Tab Baru bawaan sistem",
    "newtabInactiveText": "Aktifkan Tab Baru",
    "newtabInactiveTitle": "Atur CanvasTab sebagai halaman Tab Baru Anda",
    "newtabStatusActive": "Dikelola oleh CanvasTab",
    "newtabStatusInactive": "Tab Baru Bawaan Sistem",
    "theme_dark": "Gelap Tengah Malam",
    "theme_light": "Kaca Terang",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Samudra Dalam",
    "theme_forest": "Hijau Hutan",
    "theme_sunset": "Jingga Senja",
    "theme_sakura": "Merah Muda Sakura",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "ms": {
    "ctxAdd": "Cipta Subfolder",
    "ctxRename": "Namakan Semula Folder",
    "ctxDelete": "Padam Folder Ini",
    "appName": "📌 Penanda Buku CanvasTab",
    "manageMode": "🗃️ Pengurus",
    "visualMode": "🎨 Visual",
    "viewCard": "🎴 Kad",
    "viewList": "📝 Senarai",
    "viewIcon": "📱 Ikon",
    "searchPlaceholder": "Cari penanda buku, pautan, atau folder...",
    "loadingFolders": "Memuatkan folder...",
    "versionTag": "v1.7 | Tayangan Slaid Latar Belakang",
    "allBookmarks": "Semua Penanda Buku",
    "folderStatsAll": "Jumlah {count} pautan dikumpulkan",
    "folderStatsFolder": "Mengandungi {folders} folder, {links} pautan",
    "folderStatsVisual": "Mod Visual | {folders} folder, {links} pautan",
    "emptyState": "Tiada subfolder atau pautan penanda buku ditemui~",
    "modalFolderTitle": "Kandungan Folder",
    "folderCardCount": "{count} item",
    "statsSearch": "Carian | Menemui {folders} folder, {links} pautan",
    "tooltipBack": "Kembali ke folder induk",
    "tooltipClose": "Tutup",
    "drawerTitle": "Pusat Kawalan",
    "secMode": "Mod Papan Pemuka",
    "secModeDesc": "Bertukar antara pengurus ringkas dan papan pemuka visual tanpa bingkai",
    "secLayout": "Reka Letak Bilah Carian",
    "secLayoutDesc": "Laraskan kedudukan kotak carian dan kebolehlihatan papan pemuka",
    "layoutGoogleVisual": "Carian + Papan Pemuka",
    "layoutGoogleCollapse": "Carian + Laci",
    "layoutPureVisual": "Bilah Penanda Buku Klasik",
    "secView": "Gaya Penanda Buku",
    "secViewDesc": "Tukar susun atur grid kad penanda buku",
    "secTheme": "Tema Peribadi",
    "secThemeDesc": "Pilih tema warna sistem global",
    "secLang": "Bahasa",
    "secWallpaper": "Tetapan Kertas Dinding",
    "wallpaperDrawerDesc": "Suis, mod paparan, opasiti, dan tayangan slaid diuruskan dalam galeri.",
    "btnUploadBg": "Muat Naik Kertas Dinding",
    "btnManageBg": "Urus Galeri",
    "newtabStatusLabel": "Status Tab Baru",
    "btnHomepageReset": "Pulihkan Butang Pengepala",
    "btnNewtabToggle": "Pulihkan Tab Baru Lalai",
    "btnDeadLink": "Pemeriksa Pautan Rosak",
    "btnCreateFolder": "Folder Baru",
    "brandLogoSubtitle": "Kanvas Penanda Buku Pelayar",
    "googleVoiceTitle": "Carian Suara",
    "googleLensTitle": "Cari dengan Imej",
    "googleAiModeText": "Mod AI",
    "googleAiModeTitle": "Tukar mod paparan",
    "btnNewtabToggleEnable": "Aktifkan CanvasTab Tab Baru",
    "newtabActiveNormal": "Tab Baru Diaktifkan",
    "newtabActiveHover": "Nyahaktifkan",
    "newtabActiveTitle": "Klik untuk memulihkan halaman Tab Baru lalai sistem",
    "newtabInactiveText": "Aktifkan Tab Baru",
    "newtabInactiveTitle": "Tetapkan CanvasTab sebagai halaman Tab Baru anda",
    "newtabStatusActive": "Diuruskan oleh CanvasTab",
    "newtabStatusInactive": "Tab Baru Lalai Sistem",
    "theme_dark": "Gelap Tengah Malam",
    "theme_light": "Kaca Terang",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Lautan Dalam",
    "theme_forest": "Hijau Hutan",
    "theme_sunset": "Oren Senja",
    "theme_sakura": "Merah Jambu Sakura",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "sv": {
    "ctxAdd": "Skapa undermapp",
    "ctxRename": "Byt namn på mapp",
    "ctxDelete": "Ta bort mappen",
    "appName": "📌 CanvasTab Bokmärken",
    "manageMode": "🗃️ Hantera",
    "visualMode": "🎨 Visuell",
    "viewCard": "🎴 Kort",
    "viewList": "📝 Lista",
    "viewIcon": "📱 Ikoner",
    "searchPlaceholder": "Sök efter bokmärken, länkar eller mappar...",
    "loadingFolders": "Laddar mappar...",
    "versionTag": "v1.7 | Bakgrundsbilder bildspel",
    "allBookmarks": "Alla bokmärken",
    "folderStatsAll": "Totalt {count} bokmärkeslänkar samlade",
    "folderStatsFolder": "Innehåller {folders} mappar, {links} länkar",
    "folderStatsVisual": "Visuellt läge | {folders} mappar, {links} länkar",
    "emptyState": "Inga undermappar eller bokmärken hittades här~",
    "modalFolderTitle": "Mappinnehåll",
    "folderCardCount": "{count} objekt",
    "statsSearch": "Sök | Hittade {folders} mappar, {links} länkar",
    "tooltipBack": "Tillbaka till överordnad",
    "tooltipClose": "Stäng fönster",
    "drawerTitle": "Kontrollcenter",
    "secMode": "Puls-läge",
    "secModeDesc": "Växla mellan förenklad hanterare och gränslös visuell instrumentpanel",
    "secLayout": "Sökfältslayout",
    "secLayoutDesc": "Justera sökboxens position och instrumentpanelens synlighet",
    "layoutGoogleVisual": "Sök + Instrumentpanel",
    "layoutGoogleCollapse": "Sök + Låda",
    "layoutPureVisual": "Klassiskt bokmärkesfält",
    "secView": "Bokmärkesstil",
    "secViewDesc": "Växla rutnätslayout för bokmärkeskort",
    "secTheme": "Personligt tema",
    "secThemeDesc": "Välj globalt systemfärgtema",
    "secLang": "Språk",
    "secWallpaper": "Inställningar för bakgrundsbild",
    "wallpaperDrawerDesc": "På/av, visningslägen, opacitet och bildspelsinställningar hanteras i galleriet.",
    "btnUploadBg": "Ladda upp bakgrundsbild",
    "btnManageBg": "Hantera galleri",
    "newtabStatusLabel": "Ny flik-status",
    "btnHomepageReset": "Återställ rubrikknapp",
    "btnNewtabToggle": "Återställ standard ny flik",
    "btnDeadLink": "Kontrollera brutna länkar",
    "btnCreateFolder": "Ny mapp",
    "brandLogoSubtitle": "Browser bokmärkesduk",
    "googleVoiceTitle": "Röstsökning",
    "googleLensTitle": "Sök med bild",
    "googleAiModeText": "AI-läge",
    "googleAiModeTitle": "Växla visningsläge",
    "btnNewtabToggleEnable": "Aktivera CanvasTab Ny Flik",
    "newtabActiveNormal": "Ny flik aktiverad",
    "newtabActiveHover": "Inaktivera",
    "newtabActiveTitle": "Klicka för att återställa systemets standard ny fliksida",
    "newtabInactiveText": "Aktivera Ny Flik",
    "newtabInactiveTitle": "Ställ in CanvasTab som din nya fliksida",
    "newtabStatusActive": "Hanteras av CanvasTab",
    "newtabStatusInactive": "Systemets standard ny flik",
    "theme_dark": "Midnattsmörker",
    "theme_light": "Ljust Glas",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Djupt Hav",
    "theme_forest": "Skogsgrön",
    "theme_sunset": "Solnedgångsbrand",
    "theme_sakura": "Körsbärsrosa",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "no": {
    "ctxAdd": "Opprett undermappe",
    "ctxRename": "Gi nytt navn til mappe",
    "ctxDelete": "Slett mappen",
    "appName": "📌 CanvasTab Bokmerker",
    "manageMode": "🗃️ Administrer",
    "visualMode": "🎨 Visuell",
    "viewCard": "🎴 Kort",
    "viewList": "📝 Liste",
    "viewIcon": "📱 Ikoner",
    "searchPlaceholder": "Søk etter bokmerker, lenker eller mapper...",
    "loadingFolders": "Laster mapper...",
    "versionTag": "v1.7 | Bakgrunnsbilde lysbildefremvisning",
    "allBookmarks": "Alle bokmerker",
    "folderStatsAll": "Totalt {count} bokmerkelenker samlet",
    "folderStatsFolder": "Innehåller {folders} mapper, {links} lenker",
    "folderStatsVisual": "Visuell modus | {folders} mapper, {links} lenker",
    "emptyState": "Ingen undermapper eller bokmerker funnet her~",
    "modalFolderTitle": "Mappeinnhold",
    "folderCardCount": "{count} elementer",
    "statsSearch": "Søk | Fant {folders} mapper, {links} lenker",
    "tooltipBack": "Tilbake til overordnet",
    "tooltipClose": "Lukk vindu",
    "drawerTitle": "Kontrollsenter",
    "secMode": "Dashboard-modus",
    "secModeDesc": "Bytt mellom forenklet behandler og grenseløst visuelt dashbord",
    "secLayout": "Søkelinjelayout",
    "secLayoutDesc": "Juster søkeboksposisjon og dashbordsynlighet",
    "layoutGoogleVisual": "Søk + Dashbord",
    "layoutGoogleCollapse": "Søk + Skuff",
    "layoutPureVisual": "Klassisk bokmerkelinje",
    "secView": "Bokmerkestil",
    "secViewDesc": "Bytt rutenettoppsett for bokmerkekort",
    "secTheme": "Personlig tema",
    "secThemeDesc": "Velg globalt systemfargetema",
    "secLang": "Språk",
    "secWallpaper": "Bakgrunnsinnstillinger",
    "wallpaperDrawerDesc": "På/av, visningsmoduser, opasitet og lysbildefremvisning administreres i galleriet.",
    "btnUploadBg": "Last opp bakgrunnsbilde",
    "btnManageBg": "Administrer galleri",
    "newtabStatusLabel": "Ny fane-status",
    "btnHomepageReset": "Gjenopprett overskriftsknapp",
    "btnNewtabToggle": "Gjenopprett standard ny fane",
    "btnDeadLink": "Sjekk døde lenker",
    "btnCreateFolder": "Ny mappe",
    "brandLogoSubtitle": "Nettleser bokmerkeduk",
    "googleVoiceTitle": "Talesøk",
    "googleLensTitle": "Søk med bilde",
    "googleAiModeText": "AI-modus",
    "googleAiModeTitle": "Bytt visningsmodus",
    "btnNewtabToggleEnable": "Aktiver CanvasTab Ny Fane",
    "newtabActiveNormal": "Ny fane aktivert",
    "newtabActiveHover": "Deaktiver",
    "newtabActiveTitle": "Klikk for å gjenopprette systemets standard ny faneside",
    "newtabInactiveText": "Aktiver Ny Fane",
    "newtabInactiveTitle": "Sett CanvasTab som din nye faneside",
    "newtabStatusActive": "Administreres av CanvasTab",
    "newtabStatusInactive": "Systemets standard ny fane",
    "theme_dark": "Midnattsmørke",
    "theme_light": "Lyst Glass",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Dypt Hav",
    "theme_forest": "Skogsgrønn",
    "theme_sunset": "Solnedgangsoransje",
    "theme_sakura": "Kirsebærrosa",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "da": {
    "ctxAdd": "Opret undermappe",
    "ctxRename": "Omdøb mappe",
    "ctxDelete": "Slet mappe",
    "appName": "📌 CanvasTab Bogmærker",
    "manageMode": "🗃️ Håndter",
    "visualMode": "🎨 Visuel",
    "viewCard": "🎴 Kort",
    "viewList": "📝 Liste",
    "viewIcon": "📱 Ikoner",
    "searchPlaceholder": "Søg i bogmærker, links eller mapper...",
    "loadingFolders": "Indlæser mapper...",
    "versionTag": "v1.7 | Baggrunds-diasshow",
    "allBookmarks": "Alle bogmærker",
    "folderStatsAll": "I alt {count} bogmærkelinks indsamlet",
    "folderStatsFolder": "Indeholder {folders} mapper, {links} links",
    "folderStatsVisual": "Visuel visning | {folders} mapper, {links} links",
    "emptyState": "Ingen undermapper eller bogmærker fundet her~",
    "modalFolderTitle": "Mappeindhold",
    "folderCardCount": "{count} elementer",
    "statsSearch": "Søg | Fandt {folders} mapper, {links} links",
    "tooltipBack": "Tilbage til overordnet",
    "tooltipClose": "Luk",
    "drawerTitle": "Kontrolcenter",
    "secMode": "Dashboard-tilstand",
    "secModeDesc": "Skift mellem forenklet administrator og grænseløst visuelt dashboard",
    "secLayout": "Søgefelt-layout",
    "secLayoutDesc": "Juster søgefeltets position og dashboardets synlighed",
    "layoutGoogleVisual": "Søg + Dashboard",
    "layoutGoogleCollapse": "Søg + Skuffe",
    "layoutPureVisual": "Klassisk bogmærkelinje",
    "secView": "Bogmærkestil",
    "secViewDesc": "Skift gitterlayout for bogmærkekort",
    "secTheme": "Personligt tema",
    "secThemeDesc": "Vælg globalt systemfarvetema",
    "secLang": "Sprog",
    "secWallpaper": "Indstillinger for baggrundsbillede",
    "wallpaperDrawerDesc": "Til/fra, visningstilstande, klarhed og diasshow-indstillinger administreres i galleriet.",
    "btnUploadBg": "Upload baggrundsbillede",
    "btnManageBg": "Administrer galleri",
    "newtabStatusLabel": "Ny fane-status",
    "btnHomepageReset": "Gendan overskriftsknap",
    "btnNewtabToggle": "Gendan standard ny fane",
    "btnDeadLink": "Tjek for døde links",
    "btnCreateFolder": "Ny mappe",
    "brandLogoSubtitle": "Browser bogmærkedug",
    "googleVoiceTitle": "Stemsøgning",
    "googleLensTitle": "Søg med billede",
    "googleAiModeText": "AI-tilstand",
    "googleAiModeTitle": "Skift visningstilstand",
    "btnNewtabToggleEnable": "Aktivér CanvasTab Ny Fane",
    "newtabActiveNormal": "Ny fane aktiveret",
    "newtabActiveHover": "Deaktivér",
    "newtabActiveTitle": "Klik for at gendanne systemets standard ny faneside",
    "newtabInactiveText": "Aktivér Ny Fane",
    "newtabInactiveTitle": "Indstil CanvasTab som din nye faneside",
    "newtabStatusActive": "Administreres af CanvasTab",
    "newtabStatusInactive": "Systemets standard ny fane",
    "theme_dark": "Midnatssort",
    "theme_light": "Lyst Glas",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Dybt Hav",
    "theme_forest": "Skovgrøn",
    "theme_sunset": "Solnedgangsorange",
    "theme_sakura": "Kirsebærrosa",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "fi": {
    "ctxAdd": "Luo alikansio",
    "ctxRename": "Nimeä kansio uudelleen",
    "ctxDelete": "Poista kansio",
    "appName": "📌 CanvasTab Kirjanmerkit",
    "manageMode": "🗃️ Hallitse",
    "visualMode": "🎨 Visuaalinen",
    "viewCard": "🎴 Kortit",
    "viewList": "📝 Lista",
    "viewIcon": "📱 Kuvakkeet",
    "searchPlaceholder": "Etsi kirjanmerkkejä, linkkejä tai kansioita...",
    "loadingFolders": "Ladataan kansioita...",
    "versionTag": "v1.7 | Taustakuvan diaesitys",
    "allBookmarks": "Kaikki kirjanmerkit",
    "folderStatsAll": "Yhteensä {count} kirjanmerkkilinkkiä kerätty",
    "folderStatsFolder": "Sisältää {folders} kansiota, {links} linkkiä",
    "folderStatsVisual": "Visuaalinen tila | {folders} kansiota, {links} linkkiä",
    "emptyState": "Ei alikansioita tai kirjanmerkkejä täällä~",
    "modalFolderTitle": "Kansion sisältö",
    "folderCardCount": "{count} kohdetta",
    "statsSearch": "Haku | Löytyi {folders} kansiota, {links} linkkiä",
    "tooltipBack": "Takaisin yläkansioon",
    "tooltipClose": "Sulje",
    "drawerTitle": "Ohjauskeskus",
    "secMode": "Dashboard-tila",
    "secModeDesc": "Vaihda yksinkertaisen hallinnan ja rajattoman visuaalisen ohjauspaneelin välillä",
    "secLayout": "Hakupalkin asettelu",
    "secLayoutDesc": "Säädä hakukentän sijaintia ja ohjauspaneelin näkyvyyttä",
    "layoutGoogleVisual": "Haku + Ohjauspaneeli",
    "layoutGoogleCollapse": "Haku + Vetolaatikko",
    "layoutPureVisual": "Klassinen kirjanmerkkipalkki",
    "secView": "Kirjanmerkityyli",
    "secViewDesc": "Vaihda kirjanmerkkikorttien ruudukkoasettelua",
    "secTheme": "Personoitu teema",
    "secThemeDesc": "Valitse järjestelmän yleinen väriteema",
    "secLang": "Kieli",
    "secWallpaper": "Taustakuvan asetukset",
    "wallpaperDrawerDesc": "Päälle/pois, näyttötilat, selkeys ja diaesityksen asetukset hallitaan galleriassa.",
    "btnUploadBg": "Lataa taustakuva",
    "btnManageBg": "Hallitse galleriaa",
    "newtabStatusLabel": "Uusi välilehti -tila",
    "btnHomepageReset": "Palauta yläpainike",
    "btnNewtabToggle": "Palauta oletus uusi välilehti",
    "btnDeadLink": "Tarkista kuolleet linkit",
    "btnCreateFolder": "Uusi kansio",
    "brandLogoSubtitle": "Selaimen kirjanmerkkikangas",
    "googleVoiceTitle": "Äänihaku",
    "googleLensTitle": "Hae kuvalla",
    "googleAiModeText": "AI-tila",
    "googleAiModeTitle": "Vaihda näyttötilaa",
    "btnNewtabToggleEnable": "Ota CanvasTab Uusi välilehti käyttöön",
    "newtabActiveNormal": "Uusi välilehti käytössä",
    "newtabActiveHover": "Poista käytöstä",
    "newtabActiveTitle": "Napsauta palauttaaksesi järjestelmän oletusarvoisen uuden välilehden",
    "newtabInactiveText": "Ota uusi välilehti käyttöön",
    "newtabInactiveTitle": "Aseta CanvasTab uuden välilehden sivuksi",
    "newtabStatusActive": "CanvasTabin hallinnassa",
    "newtabStatusInactive": "Järjestelmän oletus uusi välilehti",
    "theme_dark": "Keskiyön Pimeys",
    "theme_light": "Kirkas Lasi",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Syvä Meri",
    "theme_forest": "Metsänvihreä",
    "theme_sunset": "Auringonlasku Oranssi",
    "theme_sakura": "Kirsikankukkarosa",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "cs": {
    "ctxAdd": "Vytvořit podsložku",
    "ctxRename": "Přejmenovat složku",
    "ctxDelete": "Smazat složku",
    "appName": "📌 Záložky CanvasTab",
    "manageMode": "🗃️ Správce",
    "visualMode": "🎨 Vizuální",
    "viewCard": "🎴 Karty",
    "viewList": "📝 Seznam",
    "viewIcon": "📱 Ikony",
    "searchPlaceholder": "Hledat záložky, odkazy nebo složky...",
    "loadingFolders": "Načítání složek...",
    "versionTag": "v1.7 | Prezentace tapet",
    "allBookmarks": "Všechny záložky",
    "folderStatsAll": "Celkem shromážděno {count} odkazů záložek",
    "folderStatsFolder": "Obsahuje {folders} složek, {links} odkazů",
    "folderStatsVisual": "Vizuální režim | {folders} složek, {links} odkazů",
    "emptyState": "Nebyly zde nalezeny žádné podsložky ani záložky~",
    "modalFolderTitle": "Obsah složky",
    "folderCardCount": "{count} položek",
    "statsSearch": "Hledat | Nalezeno {folders} složek, {links} odkazů",
    "tooltipBack": "Zpět do nadřazené složky",
    "tooltipClose": "Zavřít okno",
    "drawerTitle": "Ovládací centrum",
    "secMode": "Režim panelu",
    "secModeDesc": "Přepnout mezi zjednodušeným správcem a bezrámovým vizuálním panelem",
    "secLayout": "Uspořádání vyhledávací lišty",
    "secLayoutDesc": "Upravit pozici vyhledávacího pole a viditelnost panelu",
    "layoutGoogleVisual": "Vyhledávání + Panel",
    "layoutGoogleCollapse": "Vyhledávání + Zásuvka",
    "layoutPureVisual": "Klasická lišta záložek",
    "secView": "Styl záložek",
    "secViewDesc": "Přepnout mřížkové uspořádání karet záložek",
    "secTheme": "Personalizované téma",
    "secThemeDesc": "Vybrat globální barevné téma systému",
    "secLang": "Jazyk",
    "secWallpaper": "Nastavení tapety na pozadí",
    "wallpaperDrawerDesc": "Zapnutí, režimy zobrazení, průhlednost a nastavení prezentace se spravují v galerii.",
    "btnUploadBg": "Nahrát tapetu",
    "btnManageBg": "Spravovat galerii",
    "newtabStatusLabel": "Stav nové karty",
    "btnHomepageReset": "Obnovit horní tlačítko",
    "btnNewtabToggle": "Obnovit výchozí novou kartu",
    "btnDeadLink": "Zkontrolovat nefunkční odkazy",
    "btnCreateFolder": "Nová složka",
    "brandLogoSubtitle": "Plátno se záložkami prohlížeče",
    "googleVoiceTitle": "Hlasové vyhledávání",
    "googleLensTitle": "Hledat podle obrázku",
    "googleAiModeText": "Režim AI",
    "googleAiModeTitle": "Přepnout režim zobrazení",
    "btnNewtabToggleEnable": "Aktivovat CanvasTab Novou kartu",
    "newtabActiveNormal": "Nová karta aktivována",
    "newtabActiveHover": "Deaktivovat",
    "newtabActiveTitle": "Klikněte pro obnovení výchozí systémové stránky nové karty",
    "newtabInactiveText": "Aktivovat Novou kartu",
    "newtabInactiveTitle": "Nastavit CanvasTab jako vaši stránku nové karty",
    "newtabStatusActive": "Spravováno CanvasTabem",
    "newtabStatusInactive": "Výchozí nová karta systému",
    "theme_dark": "Půlnoční Tma",
    "theme_light": "Světlé Sklo",
    "theme_aurora": "Neonová Aurora",
    "theme_ocean": "Hluboký Oceán",
    "theme_forest": "Lesní Zeleň",
    "theme_sunset": "Zapadající Oranžová",
    "theme_sakura": "Třešňová Růžová",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "el": {
    "ctxAdd": "Δημιουργία υποφακέλου",
    "ctxRename": "Μετονομασία φακέλου",
    "ctxDelete": "Διαγραφή φακέλου",
    "appName": "📌 CanvasTab Σελιδοδείκτες",
    "manageMode": "🗃️ Διαχείριση",
    "visualMode": "🎨 Οπτική",
    "viewCard": "🎴 Κάρτες",
    "viewList": "📝 Λίστα",
    "viewIcon": "📱 Εικονίδια",
    "searchPlaceholder": "Αναζήτηση σελιδοδεικτών, συνδέσμων ή φακέλων...",
    "loadingFolders": "Φόρτωση φακέλων...",
    "versionTag": "v1.7 | Παρουσίαση φόντου",
    "allBookmarks": "Όλοι οι σελιδοδείκτες",
    "folderStatsAll": "Συνολικά συλλέχθηκαν {count} σύνδεσμοι σελιδοδεικτών",
    "folderStatsFolder": "Περιέχει {folders} φακέλους, {links} συνδέσμους",
    "folderStatsVisual": "Οπτική προβολή | {folders} φάκελοι, {links} σύνδεσμοι",
    "emptyState": "Δεν βρέθηκαν υποφάκελοι ή σύνδεσμοι εδώ~",
    "modalFolderTitle": "Περιεχόμενο φακέλου",
    "folderCardCount": "{count} στοιχεία",
    "statsSearch": "Αναζήτηση | Βρέθηκαν {folders} φάκελοι, {links} σύνδεσμοι",
    "tooltipBack": "Επιστροφή στον γονικό φάκελο",
    "tooltipClose": "Κλείσιμο",
    "drawerTitle": "Κέντρο ελέγχου",
    "secMode": "Λειτουργία Dashboard",
    "secModeDesc": "Εναλλαγή μεταξύ απλής διαχείρισης και οπτικού dashboard χωρίς περιθώρια",
    "secLayout": "Διάταξη γραμμής αναζήτησης",
    "secLayoutDesc": "Προσαρμογή θέσης πλαισίου αναζήτησης και ορατότητας του dashboard",
    "layoutGoogleVisual": "Αναζήτηση + Dashboard",
    "layoutGoogleCollapse": "Αναζήτηση + Συρτάρι",
    "layoutPureVisual": "Κλασική γραμμή σελιδοδεικτών",
    "secView": "Στυλ σελιδοδεικτών",
    "secViewDesc": "Εναλλαγή διάταξης πλέγματος καρτών σελιδοδεικτών",
    "secTheme": "Εξατομικευμένο θέμα",
    "secThemeDesc": "Επιλογή γενικού θέματος χρωμάτων συστήματος",
    "secLang": "Γλώσσα",
    "secWallpaper": "Ρυθμίσεις ταπετσαρίας φόντου",
    "wallpaperDrawerDesc": "Οι διακόπτες, οι λειτουργίες προβολής, η διαφάνεια και οι ρυθμίσεις παρουσίασης διαχειρίζονται στη γκαλερί.",
    "btnUploadBg": "Μεταφόρτωση ταπετσαρίας",
    "btnManageBg": "Διαχείριση γκαλερί",
    "newtabStatusLabel": "Κατάσταση Νέας Καρτέλας",
    "btnHomepageReset": "Επαναφορά κουμπιού κεφαλίδας",
    "btnNewtabToggle": "Επαναφορά προεπιλεγμένης νέας καρτέλας",
    "btnDeadLink": "Έλεγχος νεκρών συνδέσμων",
    "btnCreateFolder": "Νέος φάκελος",
    "brandLogoSubtitle": "Καμβάς σελιδοδεικτών προγράμματος περιήγησης",
    "googleVoiceTitle": "Φωνητική αναζήτηση",
    "googleLensTitle": "Αναζήτηση με εικόνα",
    "googleAiModeText": "Λειτουργία AI",
    "googleAiModeTitle": "Εναλλαγή λειτουργίας προβολής",
    "btnNewtabToggleEnable": "Ενεργοποίηση CanvasTab Νέας Καρτέλας",
    "newtabActiveNormal": "Η νέα καρτέλα ενεργοποιήθηκε",
    "newtabActiveHover": "Απενεργοποίηση",
    "newtabActiveTitle": "Κάντε κλικ για να επαναφέρετε την προεπιλεγμένη σελίδα νέας καρτέλας του συστήματος",
    "newtabInactiveText": "Ενεργοποίηση Νέας Καρτέλας",
    "newtabInactiveTitle": "Ορίστε το CanvasTab ως σελίδα νέας καρτέλας",
    "newtabStatusActive": "Διαχειρίζεται από το CanvasTab",
    "newtabStatusInactive": "Προεπιλεγμένη νέα καρτέλα συστήματος",
    "theme_dark": "Σκοτάδι Μεσάνυχτων",
    "theme_light": "Γυαλί Φωτός",
    "theme_aurora": "Αυγή Νέον",
    "theme_ocean": "Βαθύς Ωκεανός",
    "theme_forest": "Πράσινο Δάσος",
    "theme_sunset": "Πορτοκαλί Ηλιοβασίλεμα",
    "theme_sakura": "Ροζ Σακούρα",
    "theme_cyberpunk": "Cyberpunk Νέον"
  },
  "he": {
    "ctxAdd": "צור תת-תיקייה",
    "ctxRename": "שנה שם תיקייה",
    "ctxDelete": "מחק תיקייה זו",
    "appName": "📌 סימניות CanvasTab",
    "manageMode": "🗃️ ניהול",
    "visualMode": "🎨 ויזואלי",
    "viewCard": "🎴 כרטיסים",
    "viewList": "📝 רשימה",
    "viewIcon": "📱 סמלים",
    "searchPlaceholder": "חיפוש סימניות, קישורים או תיקיות...",
    "loadingFolders": "טוען תיקיות...",
    "versionTag": "v1.7 | מצגת רקעים",
    "allBookmarks": "כל הסימניות",
    "folderStatsAll": "סך הכל נאספו {count} קישורי סימניות",
    "folderStatsFolder": "מכיל {folders} תיקיות, {links} קישורים",
    "folderStatsVisual": "מצב ויזואלי | {folders} תיקיות, {links} קישורים",
    "emptyState": "לא נמצאו כאן תתי-תיקיות או קישורי סימניות~",
    "modalFolderTitle": "תוכן התיקייה",
    "folderCardCount": "{count} פריטים",
    "statsSearch": "חיפוש | נמצאו {folders} תיקיות, {links} קישורים",
    "tooltipBack": "חזור לתיקיית האם",
    "tooltipClose": "סגור",
    "drawerTitle": "מרכז בקרה",
    "secMode": "מצב לוח בקרה",
    "secModeDesc": "מעבר בין מנהל פשוט ללוח בקרה ויזואלי ללא שוליים",
    "secLayout": "פריסת סרגל חיפוש",
    "secLayoutDesc": "כוונן את מיקום תיבת החיפוש ואת נראות לוח הבקרה",
    "layoutGoogleVisual": "חיפוש + לוח בקרה",
    "layoutGoogleCollapse": "חיפוש + מגירה",
    "layoutPureVisual": "סרגל סימניות קלאסי",
    "secView": "סגנון סימניות",
    "secViewDesc": "שינוי פריסת רשת כרטיסי הסימניות",
    "secTheme": "ערכת נושא אישית",
    "secThemeDesc": "בחירת ערכת נושא לצבעי המערכת הכללית",
    "secLang": "שפה",
    "secWallpaper": "הגדרות רקע תמונה",
    "wallpaperDrawerDesc": "מתגי הפעלה, מצבי תצוגה, שקיפות והגדרות מצגת מנוהלים בגלריה.",
    "btnUploadBg": "העלה רקע",
    "btnManageBg": "נהל גלריה",
    "newtabStatusLabel": "מצב כרטיסייה חדשה",
    "btnHomepageReset": "שחזר כפתור כותרת",
    "btnNewtabToggle": "שחזר כרטיסייה חדשה כברירת מחדל",
    "btnDeadLink": "בודק קישורים שבורים",
    "btnCreateFolder": "תיקייה חדשה",
    "brandLogoSubtitle": "קנבס סימניות הדפדפן",
    "googleVoiceTitle": "חיפוש קולי",
    "googleLensTitle": "חיפוש לפי תמונה",
    "googleAiModeText": "מצב AI",
    "googleAiModeTitle": "החלף מצב תצוגה",
    "btnNewtabToggleEnable": "הפעל את CanvasTab ככרטיסייה חדשה",
    "newtabActiveNormal": "כרטיסייה חדשה מופעלת",
    "newtabActiveHover": "השבת",
    "newtabActiveTitle": "לחץ כדי לשחזר את דף הכרטיסייה החדשה כברירת מחדל של המערכת",
    "newtabInactiveText": "הפעל כרטיסייה חדשה",
    "newtabInactiveTitle": "הגדר את CanvasTab כדף הכרטיסייה החדשה שלך",
    "newtabStatusActive": "מנוהל על ידי CanvasTab",
    "newtabStatusInactive": "כרטיסיית ברירת מחדל של המערכת",
    "theme_dark": "חושך חצות",
    "theme_light": "זכוכית בהירה",
    "theme_aurora": "אורורה ניאון",
    "theme_ocean": "אוקיינוס עמוק",
    "theme_forest": "ירוק יער",
    "theme_sunset": "כתום שקיעה",
    "theme_sakura": "ורוד סאקורה",
    "theme_cyberpunk": "סייברפאנק ניאון"
  },
  "hu": {
    "ctxAdd": "Új almappa létrehozása",
    "ctxRename": "Mappa átnevezése",
    "ctxDelete": "Mappa törlése",
    "appName": "📌 CanvasTab Könyvjelzők",
    "manageMode": "🗃️ Kezelés",
    "visualMode": "🎨 Vizuális",
    "viewCard": "🎴 Kártyák",
    "viewList": "📝 Lista",
    "viewIcon": "📱 Ikonok",
    "searchPlaceholder": "Könyvjelzők, linkek vagy mappák keresése...",
    "loadingFolders": "Mappák betöltése...",
    "versionTag": "v1.7 | Háttérkép diavetítés",
    "allBookmarks": "Összes könyvjelző",
    "folderStatsAll": "Összesen {count} könyvjelző link összegyűjtve",
    "folderStatsFolder": "{folders} mappát, {links} linket tartalmaz",
    "folderStatsVisual": "Vizuális mód | {folders} mappa, {links} link",
    "emptyState": "Nem találhatók itt almappák vagy könyvjelző linkek~",
    "modalFolderTitle": "Mappa tartalma",
    "folderCardCount": "{count} elem",
    "statsSearch": "Keresés | {folders} mappa, {links} link találva",
    "tooltipBack": "Vissza a szülőmappához",
    "tooltipClose": "Bezárás",
    "drawerTitle": "Vezérlőközpont",
    "secMode": "Vezérlőpult mód",
    "secModeDesc": "Váltás az egyszerűsített kezelő és a keret nélküli vizuális vezérlőpult között",
    "secLayout": "Keresősáv elrendezése",
    "secLayoutDesc": "A keresőmező pozíciójának és a vezérlőpult láthatóságának beállítása",
    "layoutGoogleVisual": "Keresés + Vezérlőpult",
    "layoutGoogleCollapse": "Keresés + Fiók",
    "layoutPureVisual": "Klasszikus könyvjelzősáv",
    "secView": "Könyvjelző stílusa",
    "secViewDesc": "Váltás a könyvjelzőkártyák rácsos elrendezésére",
    "secTheme": "Személyre szabott téma",
    "secThemeDesc": "Rendszerszintű globális színtéma kiválasztása",
    "secLang": "Nyelv",
    "secWallpaper": "Háttérkép beállításai",
    "wallpaperDrawerDesc": "A be/kikapcsolás, a megjelenítési módok, az átlátszóság és a diavetítés beállításai a galériában kezelhetők.",
    "btnUploadBg": "Háttérkép feltöltése",
    "btnManageBg": "Galéria kezelése",
    "newtabStatusLabel": "Új lap állapota",
    "btnHomepageReset": "Fejlécgomb visszaállítása",
    "btnNewtabToggle": "Alapértelmezett új lap visszaállítása",
    "btnDeadLink": "Törött linkek ellenőrzése",
    "btnCreateFolder": "Új mappa",
    "brandLogoSubtitle": "Böngésző könyvjelző vászon",
    "googleVoiceTitle": "Hangalapú keresés",
    "googleLensTitle": "Keresés kép alapján",
    "googleAiModeText": "AI mód",
    "googleAiModeTitle": "Megjelenítési mód váltása",
    "btnNewtabToggleEnable": "CanvasTab Új lap engedélyezése",
    "newtabActiveNormal": "Új lap engedélyezve",
    "newtabActiveHover": "Letiltás",
    "newtabActiveTitle": "Kattintson ide a rendszer alapértelmezett új lap oldalának visszaállításához",
    "newtabInactiveText": "Új lap engedélyezése",
    "newtabInactiveTitle": "Állítsa be a CanvasTab-ot új lapként",
    "newtabStatusActive": "A CanvasTab által felügyelt",
    "newtabStatusInactive": "A rendszer alapértelmezett új lapja",
    "theme_dark": "Éjféli Sötétség",
    "theme_light": "Világos Üveg",
    "theme_aurora": "Neon Aurora",
    "theme_ocean": "Mély Óceán",
    "theme_forest": "Erdőzöld",
    "theme_sunset": "Naplemente Narancs",
    "theme_sakura": "Cseresznyevirág Rózsaszín",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "ro": {
    "ctxAdd": "Creează subdosar",
    "ctxRename": "Redenumește dosarul",
    "ctxDelete": "Șterge dosarul",
    "appName": "📌 Semne de carte CanvasTab",
    "manageMode": "🗃️ Administrare",
    "visualMode": "🎨 Vizual",
    "viewCard": "🎴 Carduri",
    "viewList": "📝 Listă",
    "viewIcon": "📱 Pictograme",
    "searchPlaceholder": "Caută semne de carte, linkuri sau dosare...",
    "loadingFolders": "Se încarcă dosarele...",
    "versionTag": "v1.7 | Prezentare imagini de fundal",
    "allBookmarks": "Toate semnele de carte",
    "folderStatsAll": "Total de {count} linkuri colectate",
    "folderStatsFolder": "Conține {folders} dosare, {links} linkuri",
    "folderStatsVisual": "Mod Vizual | {folders} dosare, {links} linkuri",
    "emptyState": "Nu s-au găsit subdosare sau semne de carte aici~",
    "modalFolderTitle": "Conținutul dosarului",
    "folderCardCount": "{count} elemente",
    "statsSearch": "Căutare | S-au găsit {folders} dosare, {links} linkuri",
    "tooltipBack": "Înapoi la dosarul părinte",
    "tooltipClose": "Închide",
    "drawerTitle": "Centru de control",
    "secMode": "Mod Dashboard",
    "secModeDesc": "Comutați între managerul simplificat și dashboardul vizual fără margini",
    "secLayout": "Băra de căutare layout",
    "secLayoutDesc": "Ajustați poziția căutării și vizibilitatea dashboardului",
    "layoutGoogleVisual": "Căutare + Dashboard",
    "layoutGoogleCollapse": "Căutare + Sertar",
    "layoutPureVisual": "Bara clasică de semne de carte",
    "secView": "Stil semne de carte",
    "secViewDesc": "Schimbați aspectul grilei cardurilor",
    "secTheme": "Temă personalizată",
    "secThemeDesc": "Selectați tema de culori globală a sistemului",
    "secLang": "Limbă",
    "secWallpaper": "Setări imagine de fundal",
    "wallpaperDrawerDesc": "Comutatoarele, modurile de afișare, opacitatea și slideshow-ul se gestionează în galerie.",
    "btnUploadBg": "Încarcă imagine de fundal",
    "btnManageBg": "Administrează galeria",
    "newtabStatusLabel": "Stare Tab Nou",
    "btnHomepageReset": "Restaurează butonul antet",
    "btnNewtabToggle": "Restaurează Tab Nou implicit",
    "btnDeadLink": "Verificare linkuri nefuncționale",
    "btnCreateFolder": "Dosar nou",
    "brandLogoSubtitle": "Pânza de semne de carte a browserului",
    "googleVoiceTitle": "Căutare vocală",
    "googleLensTitle": "Căutare după imagine",
    "googleAiModeText": "Mod AI",
    "googleAiModeTitle": "Comută modul de afișare",
    "btnNewtabToggleEnable": "Activează CanvasTab Tab Nou",
    "newtabActiveNormal": "Tab Nou activat",
    "newtabActiveHover": "Dezactivează",
    "newtabActiveTitle": "Faceți clic pentru a restaura pagina implicită de tab nou a sistemului",
    "newtabInactiveText": "Activează Tab Nou",
    "newtabInactiveTitle": "Setați CanvasTab ca pagină de tab nou",
    "newtabStatusActive": "Administrat de CanvasTab",
    "newtabStatusInactive": "Tab-ul nou implicit al sistemului",
    "theme_dark": "Întuneric de Miez de Nopte",
    "theme_light": "Sticlă Luminoasă",
    "theme_aurora": "Aurora de Neon",
    "theme_ocean": "Ocean Profund",
    "theme_forest": "Verde Pădure",
    "theme_sunset": "Portocaliu Apus",
    "theme_sakura": "Roz Sakura",
    "theme_cyberpunk": "Cyberpunk Neon"
  },
  "uk": {
    "ctxAdd": "Створити підпапку",
    "ctxRename": "Перейменувати папку",
    "ctxDelete": "Видалити цю папку",
    "appName": "📌 Візуальні закладки CanvasTab",
    "manageMode": "🗃️ Менеджер",
    "visualMode": "🎨 Візуальний",
    "viewCard": "🎴 Картки",
    "viewList": "📝 Список",
    "viewIcon": "📱 Значки",
    "searchPlaceholder": "Пошук закладок, посилань або папок...",
    "loadingFolders": "Завантаження папок...",
    "versionTag": "v1.7 | Слайд-шоу шпалер",
    "allBookmarks": "Усі закладки",
    "folderStatsAll": "Всього зібрано {count} посилань",
    "folderStatsFolder": "Містить {folders} папок, {links} посилань",
    "folderStatsVisual": "Візуальний режим | {folders} папок, {links} посилань",
    "emptyState": "Тут немає підпапок або закладок~",
    "modalFolderTitle": "Вміст папки",
    "folderCardCount": "{count} елементів",
    "statsSearch": "Пошук | Знайдено {folders} папок, {links} посилань",
    "tooltipBack": "Назад до батьківської папки",
    "tooltipClose": "Закрити",
    "drawerTitle": "Центр управління",
    "secMode": "Режим панелі",
    "secModeDesc": "Перемикання між спрощеним менеджером та безрамочною панеллю",
    "secLayout": "Макет панелі пошуку",
    "secLayoutDesc": "Налаштування положення рядка пошуку та видимості панелі",
    "layoutGoogleVisual": "Пошук + Панель",
    "layoutGoogleCollapse": "Поиск + Висувний список",
    "layoutPureVisual": "Класична панель закладок",
    "secView": "Стиль закладок",
    "secViewDesc": "Перемикання сітки карток закладок",
    "secTheme": "Персональна тема",
    "secThemeDesc": "Вибір глобальної колірної схеми системи",
    "secLang": "Мова",
    "secWallpaper": "Налаштування фонових шпалер",
    "wallpaperDrawerDesc": "Увімкнення, режими відображення, чіткість та слайд-шоу налаштовуються в галереї.",
    "btnUploadBg": "Завантажити шпалери",
    "btnManageBg": "Керування галереєю",
    "newtabStatusLabel": "Стан нової вкладки",
    "btnHomepageReset": "Відновити кнопку в шапці",
    "btnNewtabToggle": "Відновити стандартну нову вкладку",
    "btnDeadLink": "Перевірка битих посилань",
    "btnCreateFolder": "Створити папку",
    "brandLogoSubtitle": "Полотно закладок браузера",
    "googleVoiceTitle": "Голосовий пошук",
    "googleLensTitle": "Пошук за зображенням",
    "googleAiModeText": "Режим ШІ",
    "googleAiModeTitle": "Зміна режиму відображення",
    "btnNewtabToggleEnable": "Увімкнути CanvasTab на новій вкладці",
    "newtabActiveNormal": "Нова вкладка активована",
    "newtabActiveHover": "Вимкнути",
    "newtabActiveTitle": "Натисніть для повернення до стандартної нової вкладки",
    "newtabInactiveText": "Активувати нову вкладку",
    "newtabInactiveTitle": "Використовувати CanvasTab як нову вкладку",
    "newtabStatusActive": "Керується CanvasTab",
    "newtabStatusInactive": "Системна нова вкладка за замовчуванням",
    "theme_dark": "Опівнічна темрява",
    "theme_light": "Світле скло",
    "theme_aurora": "Неонова аврора",
    "theme_ocean": "Глибокий океан",
    "theme_forest": "Лісова зелень",
    "theme_sunset": "Західний помаранчевий",
    "theme_sakura": "Рожева сакура",
    "theme_cyberpunk": "Кіберпанк неон"
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
  {
    "id": "zh-CN",
    "name": "简体中文"
  },
  {
    "id": "zh-TW",
    "name": "繁體中文"
  },
  {
    "id": "en",
    "name": "English"
  },
  {
    "id": "ja",
    "name": "日本語"
  },
  {
    "id": "ko",
    "name": "한국어"
  },
  {
    "id": "es",
    "name": "Español"
  },
  {
    "id": "fr",
    "name": "Français"
  },
  {
    "id": "de",
    "name": "Deutsch"
  },
  {
    "id": "it",
    "name": "Italiano"
  },
  {
    "id": "ru",
    "name": "Русский"
  },
  {
    "id": "pt",
    "name": "Português"
  },
  {
    "id": "nl",
    "name": "Nederlands"
  },
  {
    "id": "pl",
    "name": "Polski"
  },
  {
    "id": "tr",
    "name": "Türkçe"
  },
  {
    "id": "ar",
    "name": "العربية"
  },
  {
    "id": "hi",
    "name": "हिन्दी"
  },
  {
    "id": "th",
    "name": "ไทย"
  },
  {
    "id": "vi",
    "name": "Tiếng Việt"
  },
  {
    "id": "id",
    "name": "Bahasa Indonesia"
  },
  {
    "id": "ms",
    "name": "Bahasa Melayu"
  },
  {
    "id": "sv",
    "name": "Svenska"
  },
  {
    "id": "no",
    "name": "Norsk"
  },
  {
    "id": "da",
    "name": "Dansk"
  },
  {
    "id": "fi",
    "name": "Suomi"
  },
  {
    "id": "cs",
    "name": "Čeština"
  },
  {
    "id": "el",
    "name": "Ελληνικά"
  },
  {
    "id": "he",
    "name": "עברית"
  },
  {
    "id": "hu",
    "name": "Magyar"
  },
  {
    "id": "ro",
    "name": "Română"
  },
  {
    "id": "uk",
    "name": "Українська"
  }
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
  const savedLang = localStorage.getItem('language');
  const browserLang = navigator.language || navigator.userLanguage;
  const targetLang = savedLang || browserLang;
  currentLang = 'en';

  if (targetLang) {
    const langKeys = Object.keys(i18n);
    if (langKeys.includes(targetLang)) {
      currentLang = targetLang;
    } else {
      const prefix = targetLang.split('-')[0];
      if (prefix === 'zh') {
        if (targetLang.toLowerCase().includes('tw') || targetLang.toLowerCase().includes('hk')) {
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

  // 1. 顶部栏/按钮与输入框翻译
  const txtAddFolderBtn = document.getElementById('txt-add-folder-btn');
  if (txtAddFolderBtn) txtAddFolderBtn.textContent = t.btnCreateFolder;

  const addGlobalBtn = document.getElementById('add-folder-global-btn');
  if (addGlobalBtn) addGlobalBtn.title = t.btnCreateFolder;

  const googleAddFolderText = document.getElementById('google-add-folder-text');
  if (googleAddFolderText) googleAddFolderText.textContent = t.btnCreateFolder;

  const ctxTxtAdd = document.getElementById('ctx-txt-add');
  if (ctxTxtAdd) ctxTxtAdd.textContent = t.ctxAdd;

  const ctxTxtRename = document.getElementById('ctx-txt-rename');
  if (ctxTxtRename) ctxTxtRename.textContent = t.ctxRename;

  const ctxTxtDelete = document.getElementById('ctx-txt-delete');
  if (ctxTxtDelete) ctxTxtDelete.textContent = t.ctxDelete;

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;
  
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.title = t.tooltipClose;
  
  const modalBack = document.getElementById('modal-back-btn');
  if (modalBack) modalBack.title = t.tooltipBack;

  // 2. Google 主区大 Logo 与搜索区域翻译
  const brandSubtitle = document.querySelector('.brand-logo-subtitle');
  if (brandSubtitle) brandSubtitle.textContent = t.brandLogoSubtitle;

  const googleSearchInput = document.getElementById('google-search-input');
  if (googleSearchInput) googleSearchInput.placeholder = t.searchPlaceholder;

  const voiceBtn = document.getElementById('google-voice-btn');
  if (voiceBtn) voiceBtn.title = t.googleVoiceTitle;

  const lensBtn = document.getElementById('google-lens-btn');
  if (lensBtn) lensBtn.title = t.googleLensTitle;

  const aiModeText = document.getElementById('google-ai-mode-text');
  if (aiModeText) aiModeText.textContent = t.googleAiModeText;

  const aiModeBtn = document.getElementById('google-ai-mode-btn');
  if (aiModeBtn) aiModeBtn.title = t.googleAiModeTitle;

  const loadingPlaceholder = document.querySelector('.loading-placeholder');
  if (loadingPlaceholder) loadingPlaceholder.textContent = t.loadingFolders;

  const collapseText = document.getElementById('google-collapse-toggle-text');
  if (collapseText) {
    const isOpen = document.body.classList.contains('google-collapse-board-open');
    if (isOpen) {
      collapseText.textContent = currentLang.startsWith('zh') ? '收起书签看板' : 'Hide bookmark board';
    } else {
      collapseText.textContent = currentLang.startsWith('zh') ? '展开书签看板' : 'Show bookmark board';
    }
  }

  // 返回上一级按钮翻译
  const universalBackText = document.querySelector('#universal-folder-back-btn span');
  if (universalBackText) {
    universalBackText.textContent = t.tooltipBack;
  }
  const googleBackText = document.getElementById('google-back-folder-text');
  if (googleBackText) {
    googleBackText.textContent = t.tooltipBack;
  }

  // 3. 侧边滑出控制中心 (Control Drawer) 翻译
  const txtDrawerTitle = document.getElementById('txt-drawer-title');
  if (txtDrawerTitle) txtDrawerTitle.textContent = t.drawerTitle;

  // 看板运行模式
  const txtSecMode = document.getElementById('txt-sec-mode');
  if (txtSecMode) txtSecMode.textContent = t.secMode;
  const txtSecModeDesc = document.getElementById('txt-sec-mode-desc');
  if (txtSecModeDesc) txtSecModeDesc.textContent = t.secModeDesc;

  const manageBtn = document.querySelector('#drawer-mode-switcher [data-mode="manage"]');
  if (manageBtn) manageBtn.textContent = t.manageMode;
  const visualBtn = document.querySelector('#drawer-mode-switcher [data-mode="visual"]');
  if (visualBtn) visualBtn.textContent = t.visualMode;

  // 搜索栏布局
  const txtSecLayout = document.getElementById('txt-sec-layout');
  if (txtSecLayout) txtSecLayout.textContent = t.secLayout;
  const txtSecLayoutDesc = document.getElementById('txt-sec-layout-desc');
  if (txtSecLayoutDesc) txtSecLayoutDesc.textContent = t.secLayoutDesc;

  const layoutBtn1 = document.querySelector('#drawer-layout-switcher [data-layout="google-visual"]');
  if (layoutBtn1) layoutBtn1.textContent = t.layoutGoogleVisual;
  const layoutBtn2 = document.querySelector('#drawer-layout-switcher [data-layout="google-collapse"]');
  if (layoutBtn2) layoutBtn2.textContent = t.layoutGoogleCollapse;
  const layoutBtn3 = document.querySelector('#drawer-layout-switcher [data-layout="pure-visual"]');
  if (layoutBtn3) layoutBtn3.textContent = t.layoutPureVisual;

  // 书签显示样式
  const txtSecView = document.getElementById('txt-sec-view');
  if (txtSecView) txtSecView.textContent = t.secView;
  const txtSecViewDesc = document.getElementById('txt-sec-view-desc');
  if (txtSecViewDesc) txtSecViewDesc.textContent = t.secViewDesc;

  const viewCardBtn = document.querySelector('#drawer-view-switcher [data-view="card"]');
  if (viewCardBtn) viewCardBtn.textContent = t.viewCard;
  const viewListBtn = document.querySelector('#drawer-view-switcher [data-view="list"]');
  if (viewListBtn) viewListBtn.textContent = t.viewList;
  const viewIconBtn = document.querySelector('#drawer-view-switcher [data-view="icon"]');
  if (viewIconBtn) viewIconBtn.textContent = t.viewIcon;

  // 个性化主题
  const txtSecTheme = document.getElementById('txt-sec-theme');
  if (txtSecTheme) txtSecTheme.textContent = t.secTheme;
  const txtSecThemeDesc = document.getElementById('txt-sec-theme-desc');
  if (txtSecThemeDesc) txtSecThemeDesc.textContent = t.secThemeDesc;

  // 多国语言
  const txtSecLang = document.getElementById('txt-sec-lang');
  if (txtSecLang) txtSecLang.textContent = t.secLang;

  // 壁纸背景设置
  const txtSecWallpaper = document.getElementById('txt-sec-wallpaper');
  if (txtSecWallpaper) txtSecWallpaper.textContent = t.secWallpaper;
  const txtWpDrawerDesc = document.getElementById('txt-wallpaper-drawer-desc');
  if (txtWpDrawerDesc) txtWpDrawerDesc.textContent = t.wallpaperDrawerDesc;

  const btnUploadBg = document.getElementById('drawer-bg-upload-trigger');
  if (btnUploadBg) btnUploadBg.textContent = t.btnUploadBg;
  const btnManageBg = document.getElementById('drawer-bg-manage-btn');
  if (btnManageBg) btnManageBg.textContent = t.btnManageBg;

  const newtabStatusRowLabel = document.querySelector('#drawer-homepage-status-row span:first-child');
  if (newtabStatusRowLabel) newtabStatusRowLabel.textContent = t.newtabStatusLabel;

  const btnHomepageReset = document.getElementById('drawer-btn-homepage-reset');
  if (btnHomepageReset) btnHomepageReset.textContent = t.btnHomepageReset;
  const btnNewtabToggle = document.getElementById('drawer-btn-newtab-toggle');
  if (btnNewtabToggle) btnNewtabToggle.textContent = t.btnNewtabToggle;

  const btnDeadLink = document.getElementById('dead-link-check-btn');
  if (btnDeadLink) btnDeadLink.textContent = t.btnDeadLink;

  // 4. 壁纸管理弹窗 (Gallery Manager Modal) 翻译
  const txtWpManagerTitle = document.getElementById('txt-wp-manager-title');
  if (txtWpManagerTitle) txtWpManagerTitle.textContent = t.drawerTitle;

  const txtWpManagerDesc = document.getElementById('txt-wp-manager-desc');
  if (txtWpManagerDesc) txtWpManagerDesc.textContent = t.wallpaperDrawerDesc;

  const wpManagerText = (id, textVal) => {
    const el = document.getElementById(id);
    if (el) el.textContent = textVal;
  };

  wpManagerText('txt-wp-playback-title', currentLang.startsWith('zh') ? '播放设置' : 'Playback settings');
  wpManagerText('txt-wp-playback-desc', currentLang.startsWith('zh') ? '在二处控制壁纸循环模式' : 'Configure wallpaper automatic loop.');
  wpManagerText('txt-wp-display-title', t.secWallpaper);
  wpManagerText('txt-wp-display-desc', t.wallpaperDrawerDesc);
  wpManagerText('txt-wp-enable', currentLang.startsWith('zh') ? '启用壁纸' : 'Enable wallpaper');
  wpManagerText('txt-wp-fit', currentLang.startsWith('zh') ? '背景模式' : 'Background mode');
  wpManagerText('txt-wp-opacity', currentLang.startsWith('zh') ? '壁纸清晰度' : 'Wallpaper clarity');
  wpManagerText('txt-wp-fit-cover', currentLang.startsWith('zh') ? '填充' : 'Cover');
  wpManagerText('txt-wp-fit-contain', currentLang.startsWith('zh') ? '适应' : 'Contain');
  wpManagerText('txt-wp-fit-repeat', currentLang.startsWith('zh') ? '平铺' : 'Tile');
  wpManagerText('txt-wp-auto-switch', currentLang.startsWith('zh') ? '自动切换' : 'Auto switch');
  wpManagerText('txt-wp-playback-mode', currentLang.startsWith('zh') ? '播放模式' : 'Playback mode');
  wpManagerText('txt-wp-playback-interval', currentLang.startsWith('zh') ? '切换间隔' : 'Switch interval');
  wpManagerText('txt-wp-mode-sequential', currentLang.startsWith('zh') ? '顺序播放' : 'Sequential');
  wpManagerText('txt-wp-mode-random', currentLang.startsWith('zh') ? '随机播放' : 'Random');
  wpManagerText('wp-manager-save-btn', currentLang.startsWith('zh') ? '保存设置' : 'Save settings');

  const intervalSelect = document.getElementById('wp-manager-slideshow-interval');
  if (intervalSelect) {
    Array.from(intervalSelect.options).forEach(option => {
      option.textContent = currentLang.startsWith('zh') ? `${option.value} 秒` : `${option.value} seconds`;
    });
  }

  // 5. Onboarding / 欢迎引导弹窗翻译
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
    else if (currentLang === 'zh-TW') onboardingDesc.innerHTML = '本插件已就緒。為了符合你的瀏覽習慣，請選擇是否将本看板作為你的<b>預設新分頁</b>？';
    else if (currentLang === 'es') onboardingDesc.innerHTML = 'La extensión está lista. Para adaptarse a tus habits de navigation, ¿deseas configurar CanvasTab como tu <b>nueva pestaña predeterminada</b>?';
    else if (currentLang === 'ja') onboardingDesc.innerHTML = '拡張機能の準備ができました。ブラウジングの習慣に合わせて、CanvasTab を<b>デフォルトの新しいタブページ</b>に設定しますか？';
    else if (currentLang === 'ko') onboardingDesc.innerHTML = '확장 프로그램이 준비되었습니다. 브라우징 습관에 맞추어 CanvasTab을 <b>기본 새 탭 페이지</b>로 설정하시겠습니까?';
    else if (currentLang === 'fr') onboardingDesc.innerHTML = 'L\'extension est prête. Pour s\'adapter à vos habitudes de navigation, souhaitez-vous définir CanvasTab comme <b>nouvel onglet par défaut</b> ?';
    else if (currentLang === 'de') onboardingDesc.innerHTML = 'Die Erweiterung ist bereit. Möchten Sie CanvasTab als <b>Standard-Neuer-Tab-Seite</b> festlegen, um sie an Ihre Surfgewohnheiten anzupassen?';
    else onboardingDesc.innerHTML = 'CanvasTab is ready. To match your browsing habits, would you like to set CanvasTab as your <b>default new tab page</b>?';
  }

  const btnOnboardingKeep = document.getElementById('btn-onboarding-keep');
  if (btnOnboardingKeep) {
    if (currentLang === 'zh-CN') btnOnboardingKeep.textContent = '✨ 是的，设置为新标签页';
    else if (currentLang === 'zh-TW') btnOnboardingKeep.textContent = '✨ 是的，設置為新分頁';
    else if (currentLang === 'es') btnOnboardingKeep.textContent = '✨ Sí, establecer como nueva pestaña';
    else if (currentLang === 'ja') btnOnboardingKeep.textContent = '✨ はい、新しいタブページに設定する';
    else if (currentLang === 'ko') btnOnboardingKeep.textContent = '✨ 예, 새 탭 페이지로 설정';
    else if (currentLang === 'fr') btnOnboardingKeep.textContent = '✨ Oui, définir comme nouvel onglet';
    else if (currentLang === 'de') btnOnboardingKeep.textContent = '✨ Ja, als Neuer-Tab-Seite festlegen';
    else btnOnboardingKeep.textContent = '✨ Yes, set as new tab page';
  }

  const btnOnboardingHomepage = document.getElementById('btn-onboarding-homepage');
  if (btnOnboardingHomepage) {
    if (currentLang === 'zh-CN') btnOnboardingHomepage.textContent = '否';
    else if (currentLang === 'zh-TW') btnOnboardingHomepage.textContent = '否';
    else if (currentLang === 'es') btnOnboardingHomepage.textContent = 'No';
    else if (currentLang === 'ja') btnOnboardingHomepage.textContent = 'いいえ';
    else if (currentLang === 'ko') btnOnboardingHomepage.textContent = '아니오';
    else if (currentLang === 'fr') btnOnboardingHomepage.textContent = 'Non';
    else if (currentLang === 'de') btnOnboardingHomepage.textContent = 'Nein';
    else btnOnboardingHomepage.textContent = 'No';
  }

  // 渲染新标签页接管状态 (指示器与按钮)
  checkNewtabVisibility();

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
  const statusDot = document.getElementById('drawer-homepage-status-dot') || document.getElementById('homepage-status-dot');
  const statusText = document.getElementById('drawer-homepage-status-text') || document.getElementById('homepage-status-text');
  const resetBtn = document.getElementById('btn-homepage-reset');
  const drawerNewtabToggle = document.getElementById('drawer-btn-newtab-toggle');
  const t = i18n[currentLang] || i18n.en;

  // 1. 始终保持顶部主按钮显示，更新内容与状态类名以展示已设置/取消接管交互
  if (btn) {
    btn.style.display = 'flex';
    if (isEnabled) {
      btn.classList.add('is-homepage-active'); // 复用原本的 CSS 高亮样式
      btn.innerHTML = `
        <span class="btn-icon">${SVGS.check}</span>
        <span class="btn-text-normal">${t.newtabActiveNormal}</span>
        <span class="btn-text-hover" style="display: none;">${t.newtabActiveHover}</span>
      `;
      btn.title = t.newtabActiveTitle;
    } else {
      btn.classList.remove('is-homepage-active');
      btn.innerHTML = `
        <span class="btn-icon">${SVGS.homepage}</span>
        <span class="btn-text">${t.newtabInactiveText}</span>
      `;
      btn.title = t.newtabInactiveTitle;
    }
  }

  // 2. 更新壁纸设置面板中的指示器状态
  if (statusDot && statusText) {
    if (isEnabled) {
      statusDot.style.backgroundColor = '#10b981'; // 亮绿灯
      statusText.textContent = t.newtabStatusActive;
      statusText.style.color = '#10b981';
    } else {
      statusDot.style.backgroundColor = '#9ca3af'; // 灰色
      statusText.textContent = t.newtabStatusInactive;
      statusText.style.color = 'var(--text-secondary)';
    }
  }

  // 3. 更新设置侧栏底部的接管状态控制按钮文本
  if (drawerNewtabToggle) {
    drawerNewtabToggle.textContent = isEnabled ? t.btnNewtabToggle : t.btnNewtabToggleEnable;
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

  const opacitySlider = document.getElementById('wp-manager-opacity-slider');
  if (opacitySlider) opacitySlider.value = wallpaperOpacity;

  const opacityVal = document.getElementById('wp-manager-opacity-value');
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
    <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 4px;">${escapeHtml(folder.title)}${countBadge}</span>
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
        <div class="bookmark-title">${escapeHtml(folder.title || '...')}</div>
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
        <div class="bookmark-title">${escapeHtml(bookmark.title || 'No Title')}</div>
      </div>
      <div class="card-bottom">${escapeHtml(hostname)}</div>
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
    const langPack = i18n[currentLang] || i18n.en;
    textSpan.textContent = langPack['theme_' + t.id] || t.name;

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
          <span class="engine-icon-wrapper">${iconHtml}</span> <span>${escapeHtml(engine.name)}</span>
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
            <span class="engine-icon-wrapper">${iconHtml}</span> <span>${escapeHtml(engine.name)}</span>
          </div>
          <span class="engine-delete-btn" title="${currentLang.startsWith('zh') ? '删除此引擎' : 'Delete Engine'}">&times;</span>
        `;
        gOpt.querySelector('.engine-delete-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomSearchEngine(engine.id);
        });
      } else {
        gOpt.innerHTML = `<span class="engine-icon-wrapper">${iconHtml}</span> <span>${escapeHtml(engine.name)}</span>`;
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
    if (customBgList.length >= 15) {
      alert(currentLang.startsWith('zh') ? "最多仅支持添加 15 张幻灯片背景哦！" : "Maximum 15 wallpapers supported!");
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
          if (processedCount === pendingFiles.length || customBgList.length >= 15) {
            currentBgIndex = customBgList.length - 1; 
            wallpaperEnabled = true;
            applyBackgroundSettings();
            syncDrawerControls();
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

// 渲染壁纸管理卡片
function renderThumbnails() {
  const grid = document.getElementById('wp-manager-grid');
  if (!grid) return;

  grid.innerHTML = '';
  customBgList.forEach((bg, index) => {
    const card = document.createElement('div');
    card.className = 'wp-card';
    if (index === currentBgIndex) card.classList.add('active');
    
    card.innerHTML = `
      <div class="wp-card-preview" title="${currentLang.startsWith('zh') ? '设为背景' : 'Set as Background'}">
        <img src="${bg}" class="wp-card-img">
        <span class="wp-card-active-badge">${currentLang.startsWith('zh') ? '使用中' : 'Active'}</span>
        <button class="thumb-preview" style="left: auto; right: 8px; top: 8px;" title="${currentLang.startsWith('zh') ? '预览大图' : 'Preview Image'}">🔍</button>
      </div>
      <div class="wp-card-actions">
        <button class="wp-card-btn wp-card-delete-btn">${currentLang.startsWith('zh') ? '删除' : 'Delete'}</button>
      </div>
    `;

    // Click on preview to select
    card.querySelector('.wp-card-preview').addEventListener('click', (e) => {
      if (e.target.closest('.thumb-preview')) return;
      currentBgIndex = index;
      applyBackgroundSettings();
      renderThumbnails(); // Re-render to update active states
    });

    // Click on zoom button to view lightbox
    card.querySelector('.thumb-preview').addEventListener('click', (e) => {
      e.stopPropagation();
      showImageLightbox(bg);
    });

    // Click on delete button to delete
    card.querySelector('.wp-card-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteWallpaper(index, e);
    });

    grid.appendChild(card);
  });
}

// 弹出大图预览小窗口
function showImageLightbox(imgSrc) {
  let overlay = document.getElementById('lightbox-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0, 0, 0, 0.85)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '3000';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.25s ease';
  
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.maxWidth = '90vw';
  container.style.maxHeight = '90vh';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.transform = 'scale(0.9)';
  container.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
  
  const img = document.createElement('img');
  img.src = imgSrc;
  img.style.maxWidth = '100%';
  img.style.maxHeight = '90vh';
  img.style.borderRadius = '8px';
  img.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
  img.style.objectFit = 'contain';

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '-20px';
  closeBtn.style.right = '-20px';
  closeBtn.style.width = '36px';
  closeBtn.style.height = '36px';
  closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
  closeBtn.style.color = '#333333';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.fontSize = '24px';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.display = 'flex';
  closeBtn.style.alignItems = 'center';
  closeBtn.style.justifyContent = 'center';
  closeBtn.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
  closeBtn.style.transition = 'background 0.2s, transform 0.2s';
  closeBtn.style.zIndex = '3100';

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#ffffff';
    closeBtn.style.transform = 'scale(1.1)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
    closeBtn.style.transform = 'scale(1)';
  });

  const closeLightbox = () => {
    overlay.style.opacity = '0';
    container.style.transform = 'scale(0.9)';
    setTimeout(() => {
      overlay.remove();
    }, 250);
  };

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', () => {
    closeLightbox();
  });

  container.appendChild(img);
  container.appendChild(closeBtn);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    container.style.transform = 'scale(1)';
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
  const drawerBgOpacity = document.getElementById('wp-manager-opacity-slider');
  if (drawerBgOpacity) drawerBgOpacity.addEventListener('input', (event) => {
    wallpaperOpacity = Number(event.target.value);
    const value = document.getElementById('wp-manager-opacity-value');
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

  const wpManageBtn = document.getElementById('drawer-bg-manage-btn');
  const wpManagerOverlay = document.getElementById('wp-manager-modal-overlay');
  const wpManagerClose = document.getElementById('wp-manager-close-btn');
  if (wpManageBtn && wpManagerOverlay) {
    wpManageBtn.addEventListener('click', () => {
      wpManagerOverlay.classList.add('active');
      renderThumbnails();
    });
  }
  if (wpManagerClose && wpManagerOverlay) {
    wpManagerClose.addEventListener('click', () => {
      wpManagerOverlay.classList.remove('active');
    });
    wpManagerOverlay.addEventListener('click', (e) => {
      if (e.target === wpManagerOverlay) {
        wpManagerOverlay.classList.remove('active');
      }
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
  const bgOpacitySlider = document.getElementById('wp-manager-opacity-slider');
  const bgOpacityVal = document.getElementById('wp-manager-opacity-value');
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
      btn.className = 'theme-dot-btn'; // 使用 CSS 定义的主题按钮类名
      btn.dataset.theme = item.id;
      
      const langPack = i18n[currentLang] || i18n.en;
      const localizedName = langPack['theme_' + item.id] || item.name;
      
      btn.innerHTML = `
        <span class="theme-color-dot" style="background:${item.color}"></span>
        <span class="theme-dot-name">${localizedName}</span>
      `;
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
  const bgOpacity = document.getElementById('wp-manager-opacity-slider');
  const bgOpacityVal = document.getElementById('wp-manager-opacity-value');
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

  // 点击设置界面（抽屉）以外的其他区域时，自动收起设置界面
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('active') && !drawer.contains(e.target) && !settings.contains(e.target)) {
      const isModalOverlay = e.target.closest('.folder-modal-overlay') || e.target.closest('#lightbox-overlay');
      if (!isModalOverlay) {
        closeDrawer();
      }
    }
  });

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
