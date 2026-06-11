import React from 'react';

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'TEXTAREA',
  'INPUT',
  'CODE',
  'PRE',
  'KBD',
  'SAMP'
]);

export const PH_EVO_COPY_REPLACEMENTS = [
  [/\bSovereign Intelligence\b/g, 'PromptHouse Evo Intelligence'],
  [/\bSovereign Chat\b/g, 'Evo Chat'],
  [/\bSovereign Core\b/g, 'PromptHouse Evo Core'],
  [/\bSovereign OS\b/g, 'PromptHouse Evo OS'],
  [/\bSovereign Command\b/g, 'Evo Command'],
  [/\bSovereign Control\b/g, 'PromptHouse Control'],
  [/\bSovereignty Policy\b/g, 'PromptHouse Control Policy'],
  [/\bSovereignty\b/g, 'PromptHouse Control'],
  [/\bSovereign\b/g, 'PromptHouse'],
  [/\bSOVEREIGN\b/g, 'PROMPTHOUSE'],
  [/\bAdmin Root\b/g, 'Owner Command Core'],
  [/\bGlobal Infrastructure\b/g, 'PromptHouse Runtime Grid'],
  [/\bUNBOUND DEPLOYMENT MODE\b/g, 'EVO OVERRIDE MODE'],
  [/\bUnbound Deployment Mode\b/g, 'Evo Override Mode'],
  [/\bUnbound mode\b/g, 'Evo Override mode'],
  [/\bEnable Automated Deployment\b/g, 'Enable Evo Deployment Flow'],
  [/\bManifest Singularity Engine\b/g, 'Open Evo Singularity Engine'],
  [/\bManifest\b/g, 'Open Evo'],
  [/\bOwner authority\b/g, 'PromptHouse owner approval'],
  [/\bfinal approval for risky actions\b/g, 'owner approval for high-impact Evo actions']
];

function shouldSkip(node) {
  const parent = node?.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  if (parent.closest('[data-ph-evo-copy-raw="true"]')) return true;
  return false;
}

export function applyPromptHouseCopyTheme(value) {
  if (typeof value !== 'string' || value.length === 0) return value;

  return PH_EVO_COPY_REPLACEMENTS.reduce(
    (nextValue, [pattern, replacement]) => nextValue.replace(pattern, replacement),
    value
  );
}

function rewriteTextNode(node) {
  if (shouldSkip(node)) return;
  const nextValue = applyPromptHouseCopyTheme(node.nodeValue);
  if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
}

function rewriteAttributes(element) {
  if (!element || SKIP_TAGS.has(element.tagName)) return;

  ['aria-label', 'title', 'placeholder', 'alt'].forEach((name) => {
    const value = element.getAttribute?.(name);
    if (!value) return;
    const nextValue = applyPromptHouseCopyTheme(value);
    if (nextValue !== value) element.setAttribute(name, nextValue);
  });
}

function rewriteTree(root) {
  if (!root || typeof document === 'undefined') return;

  if (root.nodeType === Node.TEXT_NODE) {
    rewriteTextNode(root);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

  if (root.nodeType === Node.ELEMENT_NODE) rewriteAttributes(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    rewriteTextNode(node);
    node = walker.nextNode();
  }

  if (root.querySelectorAll) {
    root.querySelectorAll('[aria-label], [title], [placeholder], img[alt]').forEach(rewriteAttributes);
  }
}

export default function PromptHouseCopyGuard() {
  React.useEffect(() => {
    const root = document.body;
    rewriteTree(root);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          rewriteTextNode(mutation.target);
          continue;
        }

        mutation.addedNodes.forEach((node) => rewriteTree(node));

        if (mutation.type === 'attributes') {
          rewriteAttributes(mutation.target);
        }
      }
    });

    observer.observe(root, {
      childList: true,
      characterData: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-label', 'title', 'placeholder', 'alt']
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
