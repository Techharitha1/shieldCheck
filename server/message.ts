const LINK_PATTERN =
  /(?<![@\w.-])((?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,24}(?::\d+)?(?:\/[^\s<>"']*)?)/gi;

const FILE_ENDINGS = new Set([
  'js', 'ts', 'json', 'md', 'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt', 'css', 'html', 'docx', 'xlsx', 'pptx',
]);

export const MAX_LINKS = 5;

export function extractLinks(message: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  for (const match of message.matchAll(LINK_PATTERN)) {
    const link = match[1].replace(/[.,;:!?)\]}'"]+$/, '');
    if (!link) continue;

    const hasProtocol = /^https?:\/\//i.test(link);
    const hasPath = link.includes('/');
    const ending = link.split('/')[0].split('.').pop()?.toLowerCase() || '';
    if (!hasProtocol && !hasPath && FILE_ENDINGS.has(ending)) continue;

    const key = link.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(link);
    if (found.length === MAX_LINKS) break;
  }

  return found;
}