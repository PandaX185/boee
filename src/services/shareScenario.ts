import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export function slugifyFileBase(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'estimate';
}

export async function copyMarkdown(markdown: string): Promise<void> {
  await Clipboard.setStringAsync(markdown);
}

export async function shareMarkdown(markdown: string, fileName: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) {
    return false;
  }
  const file = new File(Paths.cache, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(markdown);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/markdown',
    dialogTitle: fileName,
  });
  return true;
}
