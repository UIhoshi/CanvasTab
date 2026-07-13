chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ newtabEnabled: true });
    chrome.tabs.create({ url: 'dashboard.html?onboarding=true' });
  }
});

// 响应来自 dashboard 页面的状态查询请求
// 通过 service worker 中转读取 chrome.storage.local 比页面直接读取更可靠
