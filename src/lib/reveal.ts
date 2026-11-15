// Move keyboard focus to an element and bring it into view with the page's
// own scroll behaviour. A plain focus() always jumps, ignoring the smooth
// scrolling set on <html>; scrollIntoView with behavior 'auto' follows it, so
// reduced-motion users (scroll-behavior: auto) still get an instant move.
// Nothing scrolls when the element is already fully in view.
export function focusAndReveal(
  element: HTMLElement | null | undefined,
  block: ScrollLogicalPosition = 'start',
): void {
  if (!element) return;
  element.focus({ preventScroll: true });
  const rect = element.getBoundingClientRect();
  // Respect the space a sticky header claims (scroll-margin / scroll-padding).
  const top = Math.max(
    parseFloat(getComputedStyle(element).scrollMarginTop) || 0,
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
      0,
  );
  if (rect.top >= top && rect.bottom <= window.innerHeight) return;
  element.scrollIntoView({ block, behavior: 'auto' });
}
