$newTab = new App

chrome.tabs.getSelected(null,(tab)-> # null defaults to current window
  console.log tab.title
)