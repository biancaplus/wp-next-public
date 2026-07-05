// @wp-next-public/cli — Route generator
// Generates Next.js App Router files from WP site scan data

import type { ScanResult, PostTypeScan } from '@wp-next-public/core';
import type { FileEntry } from './file-writer';
import { applyTemplate, templateFile } from './file-writer.js';

export interface GeneratedProject {
  projectName: string;
  files: FileEntry[];
  routeSummary: string[];
}

function escapeSingleQuotedString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Generate a complete Next.js project from a WP site scan.
 */
export async function generateProject(
  scan: ScanResult,
  projectName: string,
  options: {
    mode?: 'ssr' | 'ssg';
    dataMode?: 'rest' | 'hmac';
    template?: 'minimal' | 'blog' | 'full';
  } = {},
): Promise<GeneratedProject> {
  const { mode = 'ssr', dataMode = 'rest', template = 'blog' } = options;
  const files: FileEntry[] = [];
  const routeSummary: string[] = [];

  const wpHost = new URL(scan.site.url).hostname;

  // Determine which post types to generate routes for
  const postTypes = scan.postTypes.filter(
    (pt) => pt.samplePosts.length > 0 && pt.restBase,
  );

  // —— Package.json ——
  const pkgJson = await applyTemplate(templateFile('package.json.tpl'), {
    projectName,
  });
  files.push({ filePath: 'package.json', content: pkgJson });

  // —— next.config ——
  const nextConfig = await applyTemplate(
    templateFile('next.config.ts.tpl'),
    { wpHost },
  );
  files.push({ filePath: 'next.config.ts', content: nextConfig });

  // —— Type definitions ——
  const typesContent = await applyTemplate(templateFile('types.ts.tpl'), {});
  files.push({ filePath: 'lib/types.ts', content: typesContent });

  // —— WP Client ——
  const wpClientContent = await applyTemplate(
    templateFile('wp-client.ts.tpl'),
    {
      wpUrl: escapeSingleQuotedString(scan.site.url),
      dataMode,
    },
  );
  files.push({ filePath: 'lib/wp-client.ts', content: wpClientContent });

  // —— Environment example ——
  const envExample = await applyTemplate(templateFile('env.example.tpl'), {
    wpUrl: scan.site.url,
  });
  files.push({ filePath: '.env.example', content: envExample });

  // —— WordPress webhook receiver ——
  const webhookRoute = await applyTemplate(templateFile('webhook-route.ts.tpl'), {});
  files.push({
    filePath: 'app/api/wp-next/webhook/route.ts',
    content: webhookRoute,
  });
  routeSummary.push('app/api/wp-next/webhook/route.ts (webhook)');

  // —— Project README ——
  const readme = await applyTemplate(templateFile('readme.md.tpl'), {
    projectName,
  });
  files.push({ filePath: 'README.md', content: readme });

  // —— Post types: detail pages ——
  for (const pt of postTypes) {
    const isPage = pt.slug === 'page';
    const routeDir = isPage ? 'pages' : pt.restBase;
    const tplName = mode === 'ssg' ? 'page-ssg.tsx.tpl' : 'page-ssr.tsx.tpl';

    const pageContent = await applyTemplate(templateFile(tplName), {});
    files.push({
      filePath: `app/${routeDir}/[slug]/page.tsx`,
      content: pageContent,
    });
    routeSummary.push(`app/${routeDir}/[slug]/page.tsx (${mode.toUpperCase()})`);

    // List page (only for post types with archive)
    if (template !== 'minimal' && pt.totalPosts > 0) {
      const listContent = await applyTemplate(
        templateFile('page-list.tsx.tpl'),
        {
          postType: pt.restBase,
          routeDir,
        },
      );
      files.push({
        filePath: `app/${routeDir}/page.tsx`,
        content: listContent,
      });
      routeSummary.push(`app/${routeDir}/page.tsx (list)`);
    }
  }

  // —— Taxonomies: category/tag pages ——
  if (template !== 'minimal') {
    const categoryPostType = postTypes.find((pt) => pt.categories.length > 0);
    if (categoryPostType) {
      const routeDir = categoryPostType.slug === 'page'
        ? 'pages'
        : categoryPostType.restBase;
      const content = await applyTemplate(templateFile('taxonomy-page.tsx.tpl'), {
        taxonomyTitle: 'Category',
        filterKey: 'category',
        postType: categoryPostType.restBase,
        routeDir,
      });
      files.push({
        filePath: `app/category/[slug]/page.tsx`,
        content,
      });
      routeSummary.push(`app/category/[slug]/page.tsx (archive)`);
    }

    const tagPostType = postTypes.find((pt) => pt.tags.length > 0);
    if (tagPostType) {
      const routeDir = tagPostType.slug === 'page' ? 'pages' : tagPostType.restBase;
      const content = await applyTemplate(templateFile('taxonomy-page.tsx.tpl'), {
        taxonomyTitle: 'Tag',
        filterKey: 'tag',
        postType: tagPostType.restBase,
        routeDir,
      });
      files.push({
        filePath: `app/tag/[slug]/page.tsx`,
        content,
      });
      routeSummary.push(`app/tag/[slug]/page.tsx (archive)`);
    }
  }

  // —— Root layout ——
  const layoutContent = await applyTemplate(
    templateFile('layout.tsx.tpl'),
    {},
  );
  files.push({ filePath: 'app/layout.tsx', content: layoutContent });

  // —— Home page ——
  if (template !== 'minimal') {
    files.push({
      filePath: 'app/page.tsx',
      content: `// Generated by wp-next — Home page\nexport default function Home() {\n  return (\n    <main className=\"mx-auto max-w-3xl px-4 py-16\">\n      <h1 className=\"text-4xl font-bold mb-4\">Welcome</h1>\n      <p className=\"text-lg text-gray-600\">\n        Your WordPress content is now powered by Next.js.\n      </p>\n    </main>\n  );\n}\n`,
    });
    routeSummary.push('app/page.tsx (home)');
  }

  // —— Global CSS ——
  files.push({
    filePath: 'app/globals.css',
    content: `@import "tailwindcss";\n`,
  });

  // —— Tailwind postcss config ——
  files.push({
    filePath: 'postcss.config.mjs',
    content: `/** @type {import('postcss-load-config').Config} */\nconst config = {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\n\nexport default config;\n`,
  });

  // —— TypeScript config ——
  files.push({
    filePath: 'tsconfig.json',
    content: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "lib": ["ES2022", "DOM", "DOM.Iterable"],\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "jsx": "react-jsx",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true,\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "paths": {\n      "@/*": ["./*"]\n    }\n  },\n  "include": ["**/*.ts", "**/*.tsx"],\n  "exclude": ["node_modules"]\n}\n`,
  });

  return {
    projectName,
    files,
    routeSummary,
  };
}
