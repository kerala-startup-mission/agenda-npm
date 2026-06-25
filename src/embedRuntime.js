import cssText from './embed.css?inline';

const STYLE_ID = 'agenda-embed-styles';

export function injectStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = cssText;
  document.head.appendChild(style);
}

export function readAttr(element, name, fallback) {
  return element.hasAttribute(name) ? element.getAttribute(name) : fallback;
}

export function getMountNodes(root = document, selector) {
  if (root instanceof HTMLElement && root.matches(selector)) {
    return [root, ...root.querySelectorAll(selector)];
  }

  if (root instanceof Document || root instanceof DocumentFragment || root instanceof HTMLElement) {
    return Array.from(root.querySelectorAll(selector));
  }

  return [];
}

export function createEmbedApi({ selector, globalName, createInstance }) {
  function init(root) {
    return getMountNodes(root, selector).map(createInstance).filter(Boolean);
  }

  return {
    globalName,
    init
  };
}
