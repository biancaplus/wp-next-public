// @wp-next-public/cli — File writer utility
// Handles creating directories and writing template-generated files

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export interface FileEntry {
  /** Relative path from project root */
  filePath: string;
  /** File content */
  content: string;
  /** Make file executable? */
  executable?: boolean;
}

/**
 * Write multiple files to disk, creating directories as needed.
 * Returns the list of created file paths.
 */
export async function writeFiles(
  projectDir: string,
  files: FileEntry[],
): Promise<string[]> {
  const created: string[] = [];
  const rootDir = path.resolve(projectDir);

  for (const file of files) {
    const fullPath = path.resolve(rootDir, file.filePath);
    const relative = path.relative(rootDir, fullPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Refusing to write outside project directory: ${file.filePath}`);
    }

    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, file.content, 'utf-8');

    if (file.executable) {
      await fs.chmod(fullPath, 0o755);
    }

    created.push(file.filePath);
  }

  return created;
}

/**
 * Read a template file and replace placeholders.
 * Placeholders are `#keyName` patterns.
 */
export async function applyTemplate(
  templatePath: string,
  replacements: Record<string, string>,
): Promise<string> {
  let content = await fs.readFile(templatePath, 'utf-8');

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(`#${key}`, value);
  }

  return content;
}

/**
 * Get the path to a template file.
 * Templates live in the source directory, not dist.
 * We resolve relative to the package root using import.meta.dirname.
 */
export function templateFile(name: string): string {
  // import.meta.dirname = packages/cli/src/generators (in dist)
  // Go up to packages/cli/, then into templates/
  return path.resolve(import.meta.dirname, '..', '..', 'templates', name);
}
