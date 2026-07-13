// 全局状态管理
const SVGS = {
  folder: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  star: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  empty: `<svg class="svg-icon" style="width:48px;height:48px;opacity:0.45;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`
};

let allFolders = [];
let activeFolderId = null;
let bookmarksCache = {}; // 缓存各文件夹下的书签

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
  const openDashboardBtn = document.getElementById('open-dashboard-btn');
  if (openDashboardBtn) {
    openDashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html?mode=dashboard') });
      window.close();
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
      allFolders.push({
        id: node.id,
        title: node.title || (node.id === '1' ? '书签栏' : node.id === '2' ? '其他书签' : '未命名文件夹')
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
  const allItem = createSidebarItem('all', SVGS.folder, '所有书签');
  folderList.appendChild(allItem);

  // 渲染实际文件夹项
  allFolders.forEach(folder => {
    // 只渲染有书签或有子集概念的文件夹
    const count = (bookmarksCache[folder.id] || []).length;
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
    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</span>
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
  if (id === 'all') {
    folderTitle.textContent = '所有书签';
  } else {
    const folder = allFolders.find(f => f.id === id);
    folderTitle.textContent = folder ? folder.title : '未知目录';
  }

  // 渲染对应的书签卡片
  renderBookmarks(bookmarksCache[id] || []);
}

// 渲染书签卡片
function renderBookmarks(bookmarksList) {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';

  if (bookmarksList.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${SVGS.empty}</div>
        <p>这个文件夹空空如也~</p>
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
        <div class="bookmark-title">${bookmark.title || '无标题'}</div>
      </div>
      <div class="card-bottom">${hostname}</div>
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

    document.getElementById('current-folder-title').textContent = `搜索结果: "${query}"`;
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
