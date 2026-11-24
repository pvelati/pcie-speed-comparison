/** Minimal DOM builder used by all components. */
export type Attrs = Record<string, string | number | boolean | null | undefined>;

const BOOLEAN_PROPS = new Set(['checked', 'disabled', 'selected', 'hidden']);

/** Keeps one phrase on a single line (heading line-break control). */
export function w(text: string): HTMLSpanElement {
  return el('span', { class: 'w' }, text);
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Array<Node | string | null | undefined>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') {
      node.className = String(value);
    } else if (BOOLEAN_PROPS.has(key)) {
      (node as unknown as Record<string, boolean>)[key] = Boolean(value);
    } else if (value === true) {
      node.setAttribute(key, '');
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(child);
  }
  return node;
}
