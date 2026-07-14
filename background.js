chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ newtabEnabled: true });
    chrome.tabs.create({ url: 'dashboard.html?onboarding=true' });
  }
});

// 动态控制工具栏图标点击行为
// 如果用户关闭了新标签页接管，则点击图标展示小窗口 popup.html，方便用户管理书签并提供重新启用入口
// 如果已启用接管，则直接在新标签页中打开看板大页面
function updatePopupState(isNewtabDisabled) {
  if (isNewtabDisabled) {
    chrome.action.setPopup({ popup: 'popup.html' });
  } else {
    chrome.action.setPopup({ popup: '' });
  }
}

// 启动时加载状态
chrome.storage.local.get(['isNewtabDisabled'], (data) => {
  const disabled = data.isNewtabDisabled === true || data.isNewtabDisabled === 'true';
  updatePopupState(disabled);
});

// 监听状态变更
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.isNewtabDisabled) {
    const disabled = changes.isNewtabDisabled.newValue;
    updatePopupState(disabled === true || disabled === 'true');
  }
});

// 当未开启小窗口模式（新标签页接管已启用）时，点击图标直接大窗口打开看板
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'dashboard.html?mode=dashboard' });
});
