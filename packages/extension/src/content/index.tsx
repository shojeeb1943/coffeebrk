import browser from 'webextension-polyfill';
import { removeLinkTargetElement } from '@dailydotdev/shared/src/lib/strings';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';

const isRendered = !!globalThis?.document?.querySelector('daily-companion-app');

if (!isRendered) {
  // Inject app div
  const appContainer = globalThis?.document?.createElement('daily-companion-app');
  globalThis?.document?.body.appendChild(appContainer);

  // Create shadow dom
  const shadow = document
    .querySelector('daily-companion-app')
    .attachShadow({ mode: 'open' });

  const wrapper = globalThis?.document?.createElement('div');
  wrapper.id = 'daily-companion-wrapper';
  shadow.appendChild(wrapper);

  browser.runtime.sendMessage({ type: ExtensionMessageType.ContentLoaded });

  let lastUrl = removeLinkTargetElement(globalThis?.window?.location.href);
  new MutationObserver(() => {
    const current = removeLinkTargetElement(globalThis?.window?.location.href);
    if (current !== lastUrl) {
      lastUrl = current;
      browser.runtime.sendMessage({ type: ExtensionMessageType.ContentLoaded });
    }
  }).observe(document, { subtree: true, childList: true });
}
