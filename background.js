chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'dashboard.html?onboarding=true' });
  }
});

// 响应来自 dashboard 页面的状态查询请求
// 通过 service worker 中转读取 chrome.storage.local 比页面直接读取更可靠
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getHomepageState') {
    chrome.storage.local.get(['isHomepageSet'], (data) => {
      sendResponse({ isHomepageSet: data.isHomepageSet || null });
    });
    return true; // 表示异步返回响应
  }
  if (request.action === 'setHomepageState') {
    chrome.storage.local.set({ isHomepageSet: request.value }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
