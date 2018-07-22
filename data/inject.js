'use strict';

var style = document.createElement('style');
style.type = 'text/css';
var enabled = true;

chrome.storage.onChanged.addListener(prefs => {
  if (prefs.enabled) {
    enabled = prefs.enabled.newValue;
    if (enabled) {
      document.documentElement.appendChild(style);
    }
    else {
      try {
        document.documentElement.removeChild(style);
      }
      catch (e) {}
    }
  }
});

// load style
var req = new XMLHttpRequest();
req.open('GET', chrome.runtime.getURL('data/style.css'));
req.onload = () => {
  chrome.storage.local.get({
    'front-color': '#8C8C8C',
    'link-color': '#00ADEE',
    'visited-color': '#A0A0A0',
    'bg-color': '#2a2d2d',
    'selection-bg': '#cccccc'
  }, prefs => {
    let response = req.response;
    Object.keys(prefs).forEach(name => {
      const r = new RegExp('--' + name + '--'.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'), 'g');
      response = response.replace(r, prefs[name]);
    });
    style.textContent = response;
  });
};
req.send();

// reinsert when body is ready
var mutation = new MutationObserver(() => {
  if (enabled) {
    document.documentElement.appendChild(style);
  }
  mutation.disconnect();
});

chrome.storage.local.get({
  enabled: true
}, prefs => {
  enabled = prefs.enabled;
  if (enabled) {
    document.documentElement.appendChild(style);
  }
  mutation.observe(document, {childList: true, subtree: true});
});
