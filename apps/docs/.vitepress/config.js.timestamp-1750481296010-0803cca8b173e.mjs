// .vitepress/config.js
import { defineConfig } from "file:///D:/1_project/hs-knowledge-base/node_modules/.pnpm/vitepress@1.6.3_@algolia+client-search@5.25.0_@types+node@22.15.29_postcss@8.5.4_search-insig_wz6wpo5dcxn5vae66v42yybyqa/node_modules/vitepress/dist/node/index.js";
import { resolve as resolve2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// .vitepress/sidebar.js
import fs from "fs";
import path from "path";
import { resolve } from "path";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///D:/1_project/hs-knowledge-base/apps/docs/.vitepress/sidebar.js";
var __dirname = fileURLToPath(new URL(".", __vite_injected_original_import_meta_url));
var rootDir = resolve(__dirname, "../../..");
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}
function formatDirTitle(dirName) {
  return dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, " ");
}
function scanDirRecursive(dir, rootPath, maxDepth = -1, currentDepth = 0) {
  const fullPath = path.join(rootPath, dir);
  const relativePath = dir;
  if (!fileExists(fullPath) || maxDepth !== -1 && currentDepth > maxDepth) {
    return [];
  }
  const result = [];
  const items = fs.readdirSync(fullPath);
  const dirs = [];
  const files = [];
  for (const item of items) {
    const itemPath = path.join(fullPath, item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      dirs.push(item);
    } else if (stats.isFile() && item.endsWith(".md")) {
      files.push(item);
    }
  }
  const indexFile = files.find((file) => file === "index.md");
  if (indexFile) {
    const linkPath = `/${relativePath}/`;
    result.push({
      text: "\u6982\u8FF0",
      link: linkPath
    });
    files.splice(files.indexOf(indexFile), 1);
  }
  for (const file of files) {
    const fileName = file.replace(/\.md$/, "");
    const title = formatDirTitle(fileName);
    const linkPath = `/${path.join(relativePath, fileName)}`;
    result.push({
      text: title,
      link: linkPath
    });
  }
  for (const subDir of dirs) {
    if (subDir.startsWith(".") || subDir === "node_modules" || subDir === "public") {
      continue;
    }
    const subDirPath = path.join(fullPath, subDir);
    const subDirRelPath = path.join(relativePath, subDir);
    const hasIndex = fileExists(path.join(subDirPath, "index.md"));
    const subItems = scanDirRecursive(subDirRelPath, rootPath, maxDepth, currentDepth + 1);
    if (subItems.length > 0 || hasIndex) {
      const subGroup = {
        text: formatDirTitle(subDir),
        collapsed: false,
        items: subItems
      };
      if (hasIndex) {
        subGroup.link = `/${subDirRelPath}/`;
      }
      result.push(subGroup);
    }
  }
  return result;
}
function createNavigationLinks(currentPath) {
  const parts = currentPath.split("/").filter(Boolean);
  const navItems = [];
  navItems.push({
    text: "\u9996\u9875",
    link: "/"
  });
  if (parts.length > 0) {
    const topDir = parts[0];
    if (parts.length === 2) {
      navItems.push({
        text: `\u8FD4\u56DE ${formatDirTitle(topDir)}`,
        link: `/${topDir}/`
      });
    } else if (parts.length > 2) {
      navItems.push({
        text: formatDirTitle(topDir),
        link: `/${topDir}/`
      });
      const parentPath = parts.slice(0, -1).join("/");
      navItems.push({
        text: `\u8FD4\u56DE\u4E0A\u7EA7`,
        link: `/${parentPath}/`
      });
    }
  }
  return navItems;
}
function generateSidebars() {
  const docsPath = path.resolve(rootDir, "apps/docs");
  const sidebars = {};
  const topDirs = ["client", "server", "systems", "devops", "ai"];
  for (const dir of topDirs) {
    const sidebarItems = scanDirRecursive(dir, docsPath, 0);
    if (sidebarItems.length > 0) {
      sidebars[`/${dir}/`] = [
        {
          text: "\u5BFC\u822A",
          items: [
            { text: "\u9996\u9875", link: "/" }
          ]
        },
        {
          text: formatDirTitle(dir),
          items: sidebarItems
        }
      ];
    }
    const dirPath = path.join(docsPath, dir);
    if (fileExists(dirPath)) {
      const subDirs = fs.readdirSync(dirPath).filter((item) => {
        const itemPath = path.join(dirPath, item);
        return fs.statSync(itemPath).isDirectory() && !item.startsWith(".") && item !== "node_modules" && item !== "public";
      });
      for (const subDir of subDirs) {
        const subDirPath = `${dir}/${subDir}`;
        const subItems = scanDirRecursive(subDirPath, docsPath, -1);
        if (subItems.length > 0) {
          sidebars[`/${subDirPath}/`] = [
            {
              text: "\u5BFC\u822A",
              items: createNavigationLinks(subDirPath)
            },
            {
              text: formatDirTitle(subDir),
              items: subItems
            }
          ];
        }
      }
    }
  }
  sidebars["/"] = [
    {
      text: "\u5BFC\u822A",
      items: [
        { text: "\u9996\u9875", link: "/" },
        { text: "\u5BA2\u6237\u7AEF", link: "/client/" },
        { text: "\u670D\u52A1\u7AEF", link: "/server/" },
        { text: "\u7CFB\u7EDF\u4E0E\u5E95\u5C42", link: "/systems/" },
        { text: "DevOps", link: "/devops/" },
        { text: "AI\u5E94\u7528\u4E0E\u5927\u6A21\u578B", link: "/ai/" },
        { text: "\u5173\u4E8E", link: "/about" }
      ]
    }
  ];
  return sidebars;
}

// .vitepress/plugins/contributors.js
var VIRTUAL_MODULE_ID = "virtual:contributors";
var RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID;

// scripts/contributors.js
import { createHash } from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import path2 from "path";
import fs2 from "fs";
var execAsync = promisify(exec);
async function getContributorsAt(filePath) {
  try {
    const gitCommand = `git log --pretty=format:"%an|%ae" --encoding=UTF-8 -- "${filePath}"`;
    const { stdout } = await execAsync(gitCommand, {
      encoding: "utf8",
      env: { ...process.env, LC_ALL: "C.UTF-8" }
    });
    if (!stdout.trim()) {
      return [];
    }
    const commits = stdout.split("\n").filter((line) => line.trim()).map((line) => {
      const [name, email] = line.split("|");
      return { name: name?.trim(), email: email?.trim() };
    }).filter((commit) => commit.name && commit.email);
    const contributorMap = /* @__PURE__ */ new Map();
    commits.forEach(({ name, email }) => {
      const key = email.toLowerCase();
      if (contributorMap.has(key)) {
        contributorMap.get(key).count++;
      } else {
        contributorMap.set(key, {
          name,
          email,
          count: 1,
          hash: createHash("md5").update(email.toLowerCase()).digest("hex")
        });
      }
    });
    return Array.from(contributorMap.values()).sort((a, b) => b.count - a.count);
  } catch (error) {
    console.warn(`\u83B7\u53D6\u8D21\u732E\u8005\u4FE1\u606F\u5931\u8D25 (${filePath}):`, error.message);
    return [];
  }
}
function getAllMarkdownFiles(dir) {
  const files = [];
  const items = fs2.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name.startsWith(".")) continue;
    const fullPath = path2.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}
async function getDocumentContributors() {
  const currentDir = process.cwd();
  const docsDir = currentDir.endsWith("apps/docs") || currentDir.endsWith("apps\\docs") ? currentDir : path2.resolve(currentDir, "apps/docs");
  const targetDirs = ["client", "server", "ai", "devops", "systems"];
  const allFiles = [];
  for (const dir of targetDirs) {
    const dirPath = path2.join(docsDir, dir);
    if (fs2.existsSync(dirPath)) {
      allFiles.push(...getAllMarkdownFiles(dirPath));
    }
  }
  console.log(`\u6B63\u5728\u5206\u6790 ${allFiles.length} \u4E2A\u6587\u6863\u6587\u4EF6\u7684\u8D21\u732E\u8005...`);
  const contributorsMap = {};
  const batchSize = 10;
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (filePath) => {
        const contributors = await getContributorsAt(filePath);
        const relativePath = path2.relative(docsDir, filePath);
        return { key: relativePath, contributors };
      })
    );
    batchResults.forEach(({ key, contributors }) => {
      if (contributors.length > 0) {
        contributorsMap[key] = contributors;
      }
    });
    console.log(`\u5DF2\u5904\u7406 ${Math.min(i + batchSize, allFiles.length)}/${allFiles.length} \u4E2A\u6587\u4EF6`);
  }
  console.log(`\u6210\u529F\u5206\u6790\u4E86 ${Object.keys(contributorsMap).length} \u4E2A\u6709\u8D21\u732E\u8BB0\u5F55\u7684\u6587\u6863`);
  return contributorsMap;
}

// .vitepress/config.js
var __vite_injected_original_import_meta_url2 = "file:///D:/1_project/hs-knowledge-base/apps/docs/.vitepress/config.js";
var __dirname2 = fileURLToPath2(new URL(".", __vite_injected_original_import_meta_url2));
var rootDir2 = resolve2(__dirname2, "../../..");
var contributorsData = await getDocumentContributors();
console.log(`\u{1F3AF} [VitePress Config] \u8D21\u732E\u8005\u6570\u636E\u52A0\u8F7D\u5B8C\u6210\uFF0C\u5171 ${Object.keys(contributorsData).length} \u4E2A\u6587\u6863`);
var config_default = defineConfig({
  base: "/",
  title: "\u706B\u5C71\u77E5\u8BC6\u5E93",
  description: "\u5BA2\u6237\u7AEF\u3001\u670D\u52A1\u7AEF\u3001\u7CFB\u7EDF\u5E95\u5C42\u53CADevOps\u7684\u6280\u672F\u77E5\u8BC6\u6574\u7406\u4E0E\u5206\u4EAB",
  head: [
    ["link", { rel: "icon", href: "/img/logo.png" }]
  ],
  lang: "zh-CN",
  // 内容配置
  srcDir: "./",
  // 忽略死链接检查
  ignoreDeadLinks: true,
  // 配置额外的内容目录
  srcExclude: ["**/node_modules/**"],
  // 添加Markdown配置
  markdown: {
    // 代码块中启用行号
    lineNumbers: true,
    theme: {
      light: "github-light",
      dark: "github-dark"
    }
  },
  vite: {
    server: {
      fs: {
        // 允许访问上层目录
        allow: [rootDir2]
      }
    },
    build: {
      // 调整chunk大小警告阈值
      chunkSizeWarningLimit: 2e3,
      // 禁用CSS代码分割，避免Vue组件样式加载顺序问题
      cssCodeSplit: false,
      // 启用更好的压缩
      minify: "esbuild",
      // 基础的rollup配置用于代码分割
      rollupOptions: {
        output: {
          // 使用函数形式的manualChunks来避免外部模块冲突
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("shiki")) {
                return "shiki";
              }
              if (id.includes("markdown-it")) {
                return "markdown";
              }
              if (id.includes("minisearch")) {
                return "search";
              }
              return "vendor";
            }
          }
        }
      }
    },
    // 集成自定义配置
    configFile: resolve2(__dirname2, "vite.config.js")
  },
  themeConfig: {
    logo: "/img/logo.png",
    nav: [
      { text: "\u9996\u9875", link: "/" },
      { text: "\u5BA2\u6237\u7AEF", link: "/client/" },
      { text: "\u670D\u52A1\u7AEF", link: "/server/" },
      { text: "\u7CFB\u7EDF\u4E0E\u5E95\u5C42", link: "/systems/" },
      { text: "DevOps", link: "/devops/" },
      { text: "AI\u5E94\u7528\u4E0E\u5927\u6A21\u578B", link: "/ai/" },
      { text: "\u8D21\u732E\u8005", link: "/contributors" },
      { text: "\u5173\u4E8E", link: "/about" }
    ],
    sidebar: generateSidebars(),
    socialLinks: [
      { icon: "github", link: "https://github.com/hs-knowledge-base/hs-knowledge-base" },
      { icon: "discord", link: "https://discord.gg/m86wyGfs" }
    ],
    footer: {
      message: "\u7528\u77E5\u8BC6\u70B9\u71C3\u6280\u672F\u7684\u706B\u5C71",
      copyright: "Copyright \xA92025 \u706B\u5C71\u77E5\u8BC6\u5E93"
    },
    search: {
      provider: "local"
    }
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcuanMiLCAiLnZpdGVwcmVzcy9zaWRlYmFyLmpzIiwgIi52aXRlcHJlc3MvcGx1Z2lucy9jb250cmlidXRvcnMuanMiLCAic2NyaXB0cy9jb250cmlidXRvcnMuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFwxX3Byb2plY3RcXFxcaHMta25vd2xlZGdlLWJhc2VcXFxcYXBwc1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXDFfcHJvamVjdFxcXFxocy1rbm93bGVkZ2UtYmFzZVxcXFxhcHBzXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LzFfcHJvamVjdC9ocy1rbm93bGVkZ2UtYmFzZS9hcHBzL2RvY3MvLnZpdGVwcmVzcy9jb25maWcuanNcIjtpbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSAndml0ZXByZXNzJ1xyXG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7ZmlsZVVSTFRvUGF0aH0gZnJvbSAndXJsJ1xyXG5pbXBvcnQge2dlbmVyYXRlU2lkZWJhcnN9IGZyb20gJy4vc2lkZWJhci5qcydcclxuaW1wb3J0IHsgQ29udHJpYnV0b3JzUGx1Z2luIH0gZnJvbSAnLi9wbHVnaW5zL2NvbnRyaWJ1dG9ycy5qcydcclxuaW1wb3J0IHsgTWFya2Rvd25UcmFuc2Zvcm1QbHVnaW4gfSBmcm9tICcuL3BsdWdpbnMvbWFya2Rvd24tdHJhbnNmb3JtLmpzJ1xyXG5pbXBvcnQgeyBnZXREb2N1bWVudENvbnRyaWJ1dG9ycyB9IGZyb20gJy4uL3NjcmlwdHMvY29udHJpYnV0b3JzLmpzJ1xyXG5cclxuLy8gXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU2NTg3XHU0RUY2XHU3Njg0XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbmNvbnN0IF9fZGlybmFtZSA9IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLicsIGltcG9ydC5tZXRhLnVybCkpXHJcblxyXG4vLyBcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcclxuY29uc3Qgcm9vdERpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4nKVxyXG5cclxuLy8gXHU4M0I3XHU1M0Q2XHU4RDIxXHU3MzJFXHU4MDA1XHU2NTcwXHU2MzZFXHJcbmNvbnN0IGNvbnRyaWJ1dG9yc0RhdGEgPSBhd2FpdCBnZXREb2N1bWVudENvbnRyaWJ1dG9ycygpXHJcbmNvbnNvbGUubG9nKGBcdUQ4M0NcdURGQUYgW1ZpdGVQcmVzcyBDb25maWddIFx1OEQyMVx1NzMyRVx1ODAwNVx1NjU3MFx1NjM2RVx1NTJBMFx1OEY3RFx1NUI4Q1x1NjIxMFx1RkYwQ1x1NTE3MSAke09iamVjdC5rZXlzKGNvbnRyaWJ1dG9yc0RhdGEpLmxlbmd0aH0gXHU0RTJBXHU2NTg3XHU2ODYzYClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogJy8nLFxyXG4gIHRpdGxlOiAnXHU3MDZCXHU1QzcxXHU3N0U1XHU4QkM2XHU1RTkzJyxcclxuICBkZXNjcmlwdGlvbjogJ1x1NUJBMlx1NjIzN1x1N0FFRlx1MzAwMVx1NjcwRFx1NTJBMVx1N0FFRlx1MzAwMVx1N0NGQlx1N0VERlx1NUU5NVx1NUM0Mlx1NTNDQURldk9wc1x1NzY4NFx1NjI4MFx1NjcyRlx1NzdFNVx1OEJDNlx1NjU3NFx1NzQwNlx1NEUwRVx1NTIwNlx1NEVBQicsXHJcbiAgaGVhZDogW1xyXG4gICAgWydsaW5rJywgeyByZWw6ICdpY29uJywgaHJlZjogJy9pbWcvbG9nby5wbmcnIH1dXHJcbiAgXSxcclxuICBsYW5nOiAnemgtQ04nLFxyXG5cclxuICAvLyBcdTUxODVcdTVCQjlcdTkxNERcdTdGNkVcclxuICBzcmNEaXI6ICcuLycsXHJcblxyXG4gIC8vIFx1NUZGRFx1NzU2NVx1NkI3Qlx1OTRGRVx1NjNBNVx1NjhDMFx1NjdFNVxyXG4gIGlnbm9yZURlYWRMaW5rczogdHJ1ZSxcclxuXHJcbiAgLy8gXHU5MTREXHU3RjZFXHU5ODlEXHU1OTE2XHU3Njg0XHU1MTg1XHU1QkI5XHU3NkVFXHU1RjU1XHJcbiAgc3JjRXhjbHVkZTogWycqKi9ub2RlX21vZHVsZXMvKionXSxcclxuXHJcbiAgLy8gXHU2REZCXHU1MkEwTWFya2Rvd25cdTkxNERcdTdGNkVcclxuICBtYXJrZG93bjoge1xyXG4gICAgLy8gXHU0RUUzXHU3ODAxXHU1NzU3XHU0RTJEXHU1NDJGXHU3NTI4XHU4ODRDXHU1M0Y3XHJcbiAgICBsaW5lTnVtYmVyczogdHJ1ZSxcclxuXHJcbiAgICB0aGVtZToge1xyXG4gICAgICBsaWdodDogJ2dpdGh1Yi1saWdodCcsXHJcbiAgICAgIGRhcms6ICdnaXRodWItZGFyaydcclxuICAgIH1cclxuICB9LFxyXG5cclxuICB2aXRlOiB7XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgZnM6IHtcclxuICAgICAgICAvLyBcdTUxNDFcdThCQjhcdThCQkZcdTk1RUVcdTRFMEFcdTVDNDJcdTc2RUVcdTVGNTVcclxuICAgICAgICBhbGxvdzogW3Jvb3REaXJdXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAvLyBcdThDMDNcdTY1NzRjaHVua1x1NTkyN1x1NUMwRlx1OEI2Nlx1NTQ0QVx1OTYwOFx1NTAzQ1xyXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsXHJcbiAgICAgIC8vIFx1Nzk4MVx1NzUyOENTU1x1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1RkYwQ1x1OTA3Rlx1NTE0RFZ1ZVx1N0VDNFx1NEVGNlx1NjgzN1x1NUYwRlx1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1OTVFRVx1OTg5OFxyXG4gICAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxyXG4gICAgICAvLyBcdTU0MkZcdTc1MjhcdTY2RjRcdTU5N0RcdTc2ODRcdTUzOEJcdTdGMjlcclxuICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXHJcbiAgICAgIC8vIFx1NTdGQVx1Nzg0MFx1NzY4NHJvbGx1cFx1OTE0RFx1N0Y2RVx1NzUyOFx1NEU4RVx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3MlxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAvLyBcdTRGN0ZcdTc1MjhcdTUxRkRcdTY1NzBcdTVGNjJcdTVGMEZcdTc2ODRtYW51YWxDaHVua3NcdTY3NjVcdTkwN0ZcdTUxNERcdTU5MTZcdTkwRThcdTZBMjFcdTU3NTdcdTUxQjJcdTdBODFcclxuICAgICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xyXG4gICAgICAgICAgICAvLyBcdTUyMDZcdTc5QkJub2RlX21vZHVsZXNcdTRFMkRcdTc2ODRcdTRGOURcdThENTZcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgICAgICAgICAgIC8vIFx1NUMwNnNoaWtpXHU0RUUzXHU3ODAxXHU5QUQ4XHU0RUFFXHU1RTkzXHU1MzU1XHU3MkVDXHU1MjA2XHU3OUJCXHVGRjA4XHU5MDFBXHU1RTM4XHU2QkQ0XHU4RjgzXHU1OTI3XHVGRjA5XHJcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzaGlraScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3NoaWtpJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBcdTVDMDZtYXJrZG93bi1pdFx1NzZGOFx1NTE3M1x1NUU5M1x1NTIwNlx1NzlCQlxyXG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbWFya2Rvd24taXQnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdtYXJrZG93bidcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gXHU1QzA2XHU2NDFDXHU3RDIyXHU3NkY4XHU1MTczXHU3Njg0XHU1RTkzXHU1MjA2XHU3OUJCXHJcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdtaW5pc2VhcmNoJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnc2VhcmNoJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdTdCMkNcdTRFMDlcdTY1QjlcdTRGOURcdThENTZcclxuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIFx1OTZDNlx1NjIxMFx1ODFFQVx1NUI5QVx1NEU0OVx1OTE0RFx1N0Y2RVxyXG4gICAgY29uZmlnRmlsZTogcmVzb2x2ZShfX2Rpcm5hbWUsICd2aXRlLmNvbmZpZy5qcycpXHJcbiAgfSxcclxuXHJcbiAgdGhlbWVDb25maWc6IHtcclxuICAgIGxvZ286IFwiL2ltZy9sb2dvLnBuZ1wiLFxyXG4gICAgbmF2OiBbXHJcbiAgICAgIHt0ZXh0OiAnXHU5OTk2XHU5ODc1JywgbGluazogJy8nfSxcclxuICAgICAge3RleHQ6ICdcdTVCQTJcdTYyMzdcdTdBRUYnLCBsaW5rOiAnL2NsaWVudC8nfSxcclxuICAgICAge3RleHQ6ICdcdTY3MERcdTUyQTFcdTdBRUYnLCBsaW5rOiAnL3NlcnZlci8nfSxcclxuICAgICAge3RleHQ6ICdcdTdDRkJcdTdFREZcdTRFMEVcdTVFOTVcdTVDNDInLCBsaW5rOiAnL3N5c3RlbXMvJ30sXHJcbiAgICAgIHt0ZXh0OiAnRGV2T3BzJywgbGluazogJy9kZXZvcHMvJ30sXHJcbiAgICAgIHt0ZXh0OiAnQUlcdTVFOTRcdTc1MjhcdTRFMEVcdTU5MjdcdTZBMjFcdTU3OEInLCBsaW5rOiAnL2FpLyd9LFxyXG4gICAgICB7dGV4dDogJ1x1OEQyMVx1NzMyRVx1ODAwNScsIGxpbms6ICcvY29udHJpYnV0b3JzJ30sXHJcbiAgICAgIHt0ZXh0OiAnXHU1MTczXHU0RThFJywgbGluazogJy9hYm91dCd9XHJcbiAgICBdLFxyXG5cclxuICAgIHNpZGViYXI6IGdlbmVyYXRlU2lkZWJhcnMoKSxcclxuXHJcbiAgICBzb2NpYWxMaW5rczogW1xyXG4gICAgICB7aWNvbjogJ2dpdGh1YicsIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vaHMta25vd2xlZGdlLWJhc2UvaHMta25vd2xlZGdlLWJhc2UnfSxcclxuICAgICAge2ljb246ICdkaXNjb3JkJywgbGluazogJ2h0dHBzOi8vZGlzY29yZC5nZy9tODZ3eUdmcyd9XHJcbiAgICBdLFxyXG5cclxuICAgIGZvb3Rlcjoge1xyXG4gICAgICBtZXNzYWdlOiAnXHU3NTI4XHU3N0U1XHU4QkM2XHU3MEI5XHU3MUMzXHU2MjgwXHU2NzJGXHU3Njg0XHU3MDZCXHU1QzcxJyxcclxuICAgICAgY29weXJpZ2h0OiAnQ29weXJpZ2h0IFx1MDBBOTIwMjUgXHU3MDZCXHU1QzcxXHU3N0U1XHU4QkM2XHU1RTkzJ1xyXG4gICAgfSxcclxuXHJcbiAgICBzZWFyY2g6IHtcclxuICAgICAgcHJvdmlkZXI6ICdsb2NhbCdcclxuICAgIH1cclxuICB9XHJcbn0pIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFwxX3Byb2plY3RcXFxcaHMta25vd2xlZGdlLWJhc2VcXFxcYXBwc1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXDFfcHJvamVjdFxcXFxocy1rbm93bGVkZ2UtYmFzZVxcXFxhcHBzXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxzaWRlYmFyLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi8xX3Byb2plY3QvaHMta25vd2xlZGdlLWJhc2UvYXBwcy9kb2NzLy52aXRlcHJlc3Mvc2lkZWJhci5qc1wiO2ltcG9ydCBmcyBmcm9tICdmcydcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJ1xyXG5pbXBvcnQge2ZpbGVVUkxUb1BhdGh9IGZyb20gJ3VybCdcclxuXHJcbi8qKlxyXG4gKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTc2ODRcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICovXHJcbmNvbnN0IF9fZGlybmFtZSA9IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLicsIGltcG9ydC5tZXRhLnVybCkpXHJcblxyXG4vKipcclxuICogXHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHJcbiAqL1xyXG5jb25zdCByb290RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLicpXHJcblxyXG4vKipcclxuICogXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XHJcbiAqIEBwYXJhbSB7Kn0gZmlsZVBhdGggXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHJcbiAqIEByZXR1cm5zIFx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxyXG4gKi9cclxuZnVuY3Rpb24gZmlsZUV4aXN0cyhmaWxlUGF0aCkge1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhmaWxlUGF0aClcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFx1ODNCN1x1NTNENlx1NzZFRVx1NUY1NVx1NTQwRFx1NzY4NFx1NjgzQ1x1NUYwRlx1NTMxNlx1NjgwN1x1OTg5OFxyXG4gKiBAcGFyYW0geyp9IGRpck5hbWUgXHU3NkVFXHU1RjU1XHU1NDBEXHJcbiAqIEByZXR1cm5zIFx1NjgzQ1x1NUYwRlx1NTMxNlx1NTQwRVx1NzY4NFx1NjgwN1x1OTg5OFxyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0RGlyVGl0bGUoZGlyTmFtZSkge1xyXG4gIC8vIFx1NUMwNlx1NzZFRVx1NUY1NVx1NTQwRFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NjgwN1x1OTg5OFx1NjgzQ1x1NUYwRlx1RkYwOFx1OTk5Nlx1NUI1N1x1NkJDRFx1NTkyN1x1NTE5OVx1RkYwQ1x1NjZGRlx1NjM2Mlx1OEZERVx1NUI1N1x1N0IyNlx1NEUzQVx1N0E3QVx1NjgzQ1x1RkYwOVxyXG4gIHJldHVybiBkaXJOYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICtcclxuICAgICAgZGlyTmFtZS5zbGljZSgxKS5yZXBsYWNlKC8tL2csICcgJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTkwMTJcdTVGNTJcdTYyNkJcdTYzQ0ZcdTc2RUVcdTVGNTVcdUZGMENcdTc1MUZcdTYyMTBcdTRGQTdcdThGQjlcdTY4MEZcdTdFRDNcdTY3ODRcclxuICogQHBhcmFtIHsqfSBkaXIgXHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbiAqIEBwYXJhbSB7Kn0gcm9vdFBhdGggXHU2ODM5XHU4REVGXHU1Rjg0XHJcbiAqIEBwYXJhbSB7Kn0gbWF4RGVwdGggXHU2NzAwXHU1OTI3XHU5MDEyXHU1RjUyXHU2REYxXHU1RUE2XHVGRjBDLTFcdTg4NjhcdTc5M0FcdTY1RTBcdTk2NTBcdTUyMzZcclxuICogQHBhcmFtIHsqfSBjdXJyZW50RGVwdGggXHU1RjUzXHU1MjREXHU5MDEyXHU1RjUyXHU2REYxXHU1RUE2XHJcbiAqIEByZXR1cm5zIFx1NEZBN1x1OEZCOVx1NjgwRlx1N0VEM1x1Njc4NFx1NjU3MFx1N0VDNFxyXG4gKi9cclxuZnVuY3Rpb24gc2NhbkRpclJlY3Vyc2l2ZShkaXIsIHJvb3RQYXRoLCBtYXhEZXB0aCA9IC0xLCBjdXJyZW50RGVwdGggPSAwKSB7XHJcbiAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4ocm9vdFBhdGgsIGRpcilcclxuICBjb25zdCByZWxhdGl2ZVBhdGggPSBkaXIgLy8gXHU3NkY4XHU1QkY5XHU0RThFZG9jc1x1NzZFRVx1NUY1NVx1NzY4NFx1OERFRlx1NUY4NFxyXG5cclxuICAvLyBcdTU5ODJcdTY3OUNcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdTYyMTZcdTgwMDVcdThEODVcdThGQzdcdTY3MDBcdTU5MjdcdTZERjFcdTVFQTZcdUZGMENcdTUyMTlcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcclxuICBpZiAoIWZpbGVFeGlzdHMoZnVsbFBhdGgpIHx8IChtYXhEZXB0aCAhPT0gLTEgJiYgY3VycmVudERlcHRoID4gbWF4RGVwdGgpKSB7XHJcbiAgICByZXR1cm4gW11cclxuICB9XHJcblxyXG4gIGNvbnN0IHJlc3VsdCA9IFtdXHJcblxyXG4gIC8vIFx1OEJGQlx1NTNENlx1NzZFRVx1NUY1NVx1NTE4NVx1NUJCOVxyXG4gIGNvbnN0IGl0ZW1zID0gZnMucmVhZGRpclN5bmMoZnVsbFBhdGgpXHJcblxyXG4gIC8vIFx1NTE0OFx1NjI3RVx1NTFGQVx1NjI0MFx1NjcwOVx1NzZFRVx1NUY1NVx1NTQ4Q1x1NjU4N1x1NEVGNlxyXG4gIGNvbnN0IGRpcnMgPSBbXVxyXG4gIGNvbnN0IGZpbGVzID0gW11cclxuXHJcbiAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XHJcbiAgICBjb25zdCBpdGVtUGF0aCA9IHBhdGguam9pbihmdWxsUGF0aCwgaXRlbSlcclxuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoaXRlbVBhdGgpXHJcblxyXG4gICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgZGlycy5wdXNoKGl0ZW0pXHJcbiAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRmlsZSgpICYmIGl0ZW0uZW5kc1dpdGgoJy5tZCcpKSB7XHJcbiAgICAgIGZpbGVzLnB1c2goaXRlbSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFx1NTkwNFx1NzQwNmluZGV4Lm1kXHU2NTg3XHU0RUY2XHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XHJcbiAgY29uc3QgaW5kZXhGaWxlID0gZmlsZXMuZmluZChmaWxlID0+IGZpbGUgPT09ICdpbmRleC5tZCcpXHJcbiAgaWYgKGluZGV4RmlsZSkge1xyXG4gICAgY29uc3QgbGlua1BhdGggPSBgLyR7cmVsYXRpdmVQYXRofS9gXHJcbiAgICByZXN1bHQucHVzaCh7XHJcbiAgICAgIHRleHQ6ICdcdTY5ODJcdThGRjAnLFxyXG4gICAgICBsaW5rOiBsaW5rUGF0aFxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBcdTRFQ0VmaWxlc1x1NEUyRFx1NzlGQlx1OTY2NGluZGV4Lm1kXHVGRjBDXHU1NkUwXHU0RTNBXHU1REYyXHU3RUNGXHU1MzU1XHU3MkVDXHU1OTA0XHU3NDA2XHU0RTg2XHJcbiAgICBmaWxlcy5zcGxpY2UoZmlsZXMuaW5kZXhPZihpbmRleEZpbGUpLCAxKVxyXG4gIH1cclxuXHJcbiAgLy8gXHU1OTA0XHU3NDA2XHU1MTc2XHU0RUQ2bWFya2Rvd25cdTY1ODdcdTRFRjZcclxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcclxuICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZS5yZXBsYWNlKC9cXC5tZCQvLCAnJylcclxuICAgIGNvbnN0IHRpdGxlID0gZm9ybWF0RGlyVGl0bGUoZmlsZU5hbWUpXHJcbiAgICBjb25zdCBsaW5rUGF0aCA9IGAvJHtwYXRoLmpvaW4ocmVsYXRpdmVQYXRoLCBmaWxlTmFtZSl9YFxyXG4gICAgXHJcbiAgICByZXN1bHQucHVzaCh7XHJcbiAgICAgIHRleHQ6IHRpdGxlLFxyXG4gICAgICBsaW5rOiBsaW5rUGF0aFxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8vIFx1NTkwNFx1NzQwNlx1NUI1MFx1NzZFRVx1NUY1NVx1RkYwOFx1OTAxMlx1NUY1Mlx1RkYwOVxyXG4gIGZvciAoY29uc3Qgc3ViRGlyIG9mIGRpcnMpIHtcclxuICAgIC8vIFx1OERGM1x1OEZDN1x1NzI3OVx1NkI4QVx1NzZFRVx1NUY1NVxyXG4gICAgaWYgKFxyXG4gICAgICBzdWJEaXIuc3RhcnRzV2l0aCgnLicpIHx8XHJcbiAgICAgIHN1YkRpciA9PT0gJ25vZGVfbW9kdWxlcycgfHxcclxuICAgICAgc3ViRGlyID09PSAncHVibGljJ1xyXG4gICAgKSB7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFx1NjhDMFx1NjdFNVx1NUI1MFx1NzZFRVx1NUY1NVx1NjYyRlx1NTQyNlx1NTMwNVx1NTQyQm1hcmtkb3duXHU2NTg3XHU0RUY2XHJcbiAgICBjb25zdCBzdWJEaXJQYXRoID0gcGF0aC5qb2luKGZ1bGxQYXRoLCBzdWJEaXIpXHJcbiAgICBjb25zdCBzdWJEaXJSZWxQYXRoID0gcGF0aC5qb2luKHJlbGF0aXZlUGF0aCwgc3ViRGlyKVxyXG4gICAgY29uc3QgaGFzSW5kZXggPSBmaWxlRXhpc3RzKHBhdGguam9pbihzdWJEaXJQYXRoLCAnaW5kZXgubWQnKSlcclxuICAgIFxyXG4gICAgLy8gXHU5MDEyXHU1RjUyXHU2MjZCXHU2M0NGXHU1QjUwXHU3NkVFXHU1RjU1XHJcbiAgICBjb25zdCBzdWJJdGVtcyA9IHNjYW5EaXJSZWN1cnNpdmUoc3ViRGlyUmVsUGF0aCwgcm9vdFBhdGgsIG1heERlcHRoLCBjdXJyZW50RGVwdGggKyAxKVxyXG4gICAgXHJcbiAgICBpZiAoc3ViSXRlbXMubGVuZ3RoID4gMCB8fCBoYXNJbmRleCkge1xyXG4gICAgICBjb25zdCBzdWJHcm91cCA9IHtcclxuICAgICAgICB0ZXh0OiBmb3JtYXREaXJUaXRsZShzdWJEaXIpLFxyXG4gICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXHJcbiAgICAgICAgaXRlbXM6IHN1Ykl0ZW1zXHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOGluZGV4Lm1kXHVGRjBDXHU1MjE5XHU2REZCXHU1MkEwXHU5NEZFXHU2M0E1XHJcbiAgICAgIGlmIChoYXNJbmRleCkge1xyXG4gICAgICAgIHN1Ykdyb3VwLmxpbmsgPSBgLyR7c3ViRGlyUmVsUGF0aH0vYFxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXN1bHQucHVzaChzdWJHcm91cClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHRcclxufVxyXG5cclxuLyoqXHJcbiAqIFx1NTIxQlx1NUVGQVx1OEZENFx1NTZERVx1NEUwQVx1N0VBN1x1NzY4NFx1NUJGQ1x1ODIyQVx1OTg3OVxyXG4gKiBAcGFyYW0geyp9IGN1cnJlbnRQYXRoIFx1NUY1M1x1NTI0RFx1OERFRlx1NUY4NFxyXG4gKiBAcmV0dXJucyBcdTVCRkNcdTgyMkFcdTk4NzlcdTY1NzBcdTdFQzRcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZU5hdmlnYXRpb25MaW5rcyhjdXJyZW50UGF0aCkge1xyXG4gIGNvbnN0IHBhcnRzID0gY3VycmVudFBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7XHJcbiAgY29uc3QgbmF2SXRlbXMgPSBbXTtcclxuICBcclxuICAvLyBcdTZERkJcdTUyQTBcdThGRDRcdTU2REVcdTk5OTZcdTk4NzVcclxuICBuYXZJdGVtcy5wdXNoKHtcclxuICAgIHRleHQ6ICdcdTk5OTZcdTk4NzUnLFxyXG4gICAgbGluazogJy8nXHJcbiAgfSk7XHJcbiAgXHJcbiAgLy8gXHU2REZCXHU1MkEwXHU3MjM2XHU3RUE3XHU1QkZDXHU4MjJBXHU5NEZFXHU2M0E1XHJcbiAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcclxuICAgIGNvbnN0IHRvcERpciA9IHBhcnRzWzBdO1xyXG4gICAgXHJcbiAgICAvLyBcdTU5ODJcdTY3OUNcdTY2MkZcdTRFOENcdTdFQTdcdTc2RUVcdTVGNTVcdUZGMENcdTUzRUFcdTZERkJcdTUyQTBcdThGRDRcdTU2REVcdTk4NzZcdTdFQTdcdTc2RUVcdTVGNTVcdTc2ODRcdTk0RkVcdTYzQTVcclxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgbmF2SXRlbXMucHVzaCh7XHJcbiAgICAgICAgdGV4dDogYFx1OEZENFx1NTZERSAke2Zvcm1hdERpclRpdGxlKHRvcERpcil9YCxcclxuICAgICAgICBsaW5rOiBgLyR7dG9wRGlyfS9gXHJcbiAgICAgIH0pO1xyXG4gICAgfSBcclxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRlx1NjZGNFx1NkRGMVx1NUM0Mlx1N0VBN1x1RkYwQ1x1NkRGQlx1NTJBMFx1OEZENFx1NTZERVx1OTg3Nlx1N0VBN1x1NzZFRVx1NUY1NVx1NTQ4Q1x1NEUwQVx1N0VBN1x1NzZFRVx1NUY1NVx1NzY4NFx1OTRGRVx1NjNBNVxyXG4gICAgZWxzZSBpZiAocGFydHMubGVuZ3RoID4gMikge1xyXG4gICAgICBuYXZJdGVtcy5wdXNoKHtcclxuICAgICAgICB0ZXh0OiBmb3JtYXREaXJUaXRsZSh0b3BEaXIpLFxyXG4gICAgICAgIGxpbms6IGAvJHt0b3BEaXJ9L2BcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBcdTY3ODRcdTVFRkFcdTRFMEFcdTdFQTdcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICAgICAgY29uc3QgcGFyZW50UGF0aCA9IHBhcnRzLnNsaWNlKDAsIC0xKS5qb2luKCcvJyk7XHJcbiAgICAgIG5hdkl0ZW1zLnB1c2goe1xyXG4gICAgICAgIHRleHQ6IGBcdThGRDRcdTU2REVcdTRFMEFcdTdFQTdgLFxyXG4gICAgICAgIGxpbms6IGAvJHtwYXJlbnRQYXRofS9gXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICByZXR1cm4gbmF2SXRlbXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTc1MUZcdTYyMTBcdTRFM0JcdTg5ODFcdTc2RUVcdTVGNTVcdTc2ODRcdTRGQTdcdThGQjlcdTY4MEZcclxuICogQHJldHVybnMgXHU2MjQwXHU2NzA5XHU0RkE3XHU4RkI5XHU2ODBGXHU5MTREXHU3RjZFXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTaWRlYmFycygpIHtcclxuICBjb25zdCBkb2NzUGF0aCA9IHBhdGgucmVzb2x2ZShyb290RGlyLCAnYXBwcy9kb2NzJylcclxuICBjb25zdCBzaWRlYmFycyA9IHt9O1xyXG4gIFxyXG4gIC8vIFx1ODNCN1x1NTNENlx1OTg3Nlx1N0VBN1x1NzZFRVx1NUY1NVxyXG4gIGNvbnN0IHRvcERpcnMgPSBbJ2NsaWVudCcsICdzZXJ2ZXInLCAnc3lzdGVtcycsICdkZXZvcHMnLCAnYWknXTtcclxuICBcclxuICAvLyBcdTRFM0FcdTZCQ0ZcdTRFMkFcdTk4NzZcdTdFQTdcdTc2RUVcdTVGNTVcdTc1MUZcdTYyMTBcdTRGQTdcdThGQjlcdTY4MEZcclxuICBmb3IgKGNvbnN0IGRpciBvZiB0b3BEaXJzKSB7XHJcbiAgICAvLyBcdTk4NzZcdTdFQTdcdTc2RUVcdTVGNTVcdTY2M0VcdTc5M0FcdTYyNDBcdTY3MDlcdTRFMDBcdTdFQTdcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMENcdTRGNDZcdTRFMERcdTkwMTJcdTVGNTJcdTY2RjRcdTZERjFcdTVDNDJcdTZCMjFcclxuICAgIGNvbnN0IHNpZGViYXJJdGVtcyA9IHNjYW5EaXJSZWN1cnNpdmUoZGlyLCBkb2NzUGF0aCwgMCk7XHJcbiAgICBpZiAoc2lkZWJhckl0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgc2lkZWJhcnNbYC8ke2Rpcn0vYF0gPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGV4dDogJ1x1NUJGQ1x1ODIyQScsXHJcbiAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTk5OTZcdTk4NzUnLCBsaW5rOiAnLycgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGV4dDogZm9ybWF0RGlyVGl0bGUoZGlyKSxcclxuICAgICAgICAgIGl0ZW1zOiBzaWRlYmFySXRlbXNcclxuICAgICAgICB9XHJcbiAgICAgIF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFx1NEUzQVx1NkJDRlx1NEUyQVx1NEUwMFx1N0VBN1x1NUI1MFx1NzZFRVx1NUY1NVx1NzUxRlx1NjIxMFx1NzJFQ1x1N0FDQlx1NEZBN1x1OEZCOVx1NjgwRlxyXG4gICAgY29uc3QgZGlyUGF0aCA9IHBhdGguam9pbihkb2NzUGF0aCwgZGlyKTtcclxuICAgIGlmIChmaWxlRXhpc3RzKGRpclBhdGgpKSB7XHJcbiAgICAgIGNvbnN0IHN1YkRpcnMgPSBmcy5yZWFkZGlyU3luYyhkaXJQYXRoKS5maWx0ZXIoaXRlbSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXRlbVBhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgaXRlbSk7XHJcbiAgICAgICAgcmV0dXJuIGZzLnN0YXRTeW5jKGl0ZW1QYXRoKS5pc0RpcmVjdG9yeSgpICYmIFxyXG4gICAgICAgICAgICAgICAhaXRlbS5zdGFydHNXaXRoKCcuJykgJiYgXHJcbiAgICAgICAgICAgICAgIGl0ZW0gIT09ICdub2RlX21vZHVsZXMnICYmIFxyXG4gICAgICAgICAgICAgICBpdGVtICE9PSAncHVibGljJztcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKGNvbnN0IHN1YkRpciBvZiBzdWJEaXJzKSB7XHJcbiAgICAgICAgY29uc3Qgc3ViRGlyUGF0aCA9IGAke2Rpcn0vJHtzdWJEaXJ9YDtcclxuICAgICAgICBjb25zdCBzdWJJdGVtcyA9IHNjYW5EaXJSZWN1cnNpdmUoc3ViRGlyUGF0aCwgZG9jc1BhdGgsIC0xKTsgLy8gXHU2NUUwXHU5NjUwXHU2REYxXHU1RUE2XHU2MjZCXHU2M0NGXHU1QjUwXHU3NkVFXHU1RjU1XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHN1Ykl0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHNpZGViYXJzW2AvJHtzdWJEaXJQYXRofS9gXSA9IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHRleHQ6ICdcdTVCRkNcdTgyMkEnLFxyXG4gICAgICAgICAgICAgIGl0ZW1zOiBjcmVhdGVOYXZpZ2F0aW9uTGlua3Moc3ViRGlyUGF0aClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHRleHQ6IGZvcm1hdERpclRpdGxlKHN1YkRpciksXHJcbiAgICAgICAgICAgICAgaXRlbXM6IHN1Ykl0ZW1zXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vIFx1NkRGQlx1NTJBMFx1OUVEOFx1OEJBNFx1NEZBN1x1OEZCOVx1NjgwRlx1RkYwOFx1NzUyOFx1NEU4RVx1OTk5Nlx1OTg3NVx1NTQ4Q1x1NTE3Nlx1NEVENlx1OTg3NVx1OTc2Mlx1RkYwOVxyXG4gIHNpZGViYXJzWycvJ10gPSBbXHJcbiAgICB7XHJcbiAgICAgIHRleHQ6ICdcdTVCRkNcdTgyMkEnLFxyXG4gICAgICBpdGVtczogW1xyXG4gICAgICAgIHsgdGV4dDogJ1x1OTk5Nlx1OTg3NScsIGxpbms6ICcvJyB9LFxyXG4gICAgICAgIHsgdGV4dDogJ1x1NUJBMlx1NjIzN1x1N0FFRicsIGxpbms6ICcvY2xpZW50LycgfSxcclxuICAgICAgICB7IHRleHQ6ICdcdTY3MERcdTUyQTFcdTdBRUYnLCBsaW5rOiAnL3NlcnZlci8nIH0sXHJcbiAgICAgICAgeyB0ZXh0OiAnXHU3Q0ZCXHU3RURGXHU0RTBFXHU1RTk1XHU1QzQyJywgbGluazogJy9zeXN0ZW1zLycgfSxcclxuICAgICAgICB7IHRleHQ6ICdEZXZPcHMnLCBsaW5rOiAnL2Rldm9wcy8nIH0sXHJcbiAgICAgICAgeyB0ZXh0OiAnQUlcdTVFOTRcdTc1MjhcdTRFMEVcdTU5MjdcdTZBMjFcdTU3OEInLCBsaW5rOiAnL2FpLycgfSxcclxuICAgICAgICB7IHRleHQ6ICdcdTUxNzNcdTRFOEUnLCBsaW5rOiAnL2Fib3V0JyB9XHJcbiAgICAgIF1cclxuICAgIH1cclxuICBdO1xyXG4gIFxyXG4gIHJldHVybiBzaWRlYmFycztcclxufSAiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXDFfcHJvamVjdFxcXFxocy1rbm93bGVkZ2UtYmFzZVxcXFxhcHBzXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFwxX3Byb2plY3RcXFxcaHMta25vd2xlZGdlLWJhc2VcXFxcYXBwc1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1xcXFxjb250cmlidXRvcnMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LzFfcHJvamVjdC9ocy1rbm93bGVkZ2UtYmFzZS9hcHBzL2RvY3MvLnZpdGVwcmVzcy9wbHVnaW5zL2NvbnRyaWJ1dG9ycy5qc1wiO2NvbnN0IFZJUlRVQUxfTU9EVUxFX0lEID0gJ3ZpcnR1YWw6Y29udHJpYnV0b3JzJ1xyXG5jb25zdCBSRVNPTFZFRF9WSVJUVUFMX01PRFVMRV9JRCA9ICdcXDAnICsgVklSVFVBTF9NT0RVTEVfSURcclxuXHJcbi8qKlxyXG4gKiBcdThEMjFcdTczMkVcdTgwMDVcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTdcdTYzRDJcdTRFRjZcclxuICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBjb250cmlidXRvcnNEYXRhIC0gXHU4RDIxXHU3MzJFXHU4MDA1XHU2NTcwXHU2MzZFXHJcbiAqIEByZXR1cm5zIHtpbXBvcnQoJ3ZpdGUnKS5QbHVnaW59IFZpdGUgXHU2M0QyXHU0RUY2XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQ29udHJpYnV0b3JzUGx1Z2luKGNvbnRyaWJ1dG9yc0RhdGEpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ3Z1ZXVzZS1jb250cmlidXRvcnMnLFxyXG4gICAgcmVzb2x2ZUlkKGlkKSB7XHJcbiAgICAgIGlmIChpZCA9PT0gVklSVFVBTF9NT0RVTEVfSUQpIHtcclxuICAgICAgICByZXR1cm4gUkVTT0xWRURfVklSVFVBTF9NT0RVTEVfSURcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGxvYWQoaWQpIHtcclxuICAgICAgaWYgKGlkID09PSBSRVNPTFZFRF9WSVJUVUFMX01PRFVMRV9JRCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURDRTYgW0NvbnRyaWJ1dG9ycyBQbHVnaW5dIFx1NTJBMFx1OEY3RFx1ODY1QVx1NjJERlx1NkEyMVx1NTc1N1x1RkYwQ1x1NjU3MFx1NjM2RVx1Njc2MVx1NzZFRVx1NjU3MDogJHtPYmplY3Qua2V5cyhjb250cmlidXRvcnNEYXRhKS5sZW5ndGh9YClcclxuICAgICAgICBjb25zb2xlLmxvZyhgXHVEODNEXHVEQ0NCIFtDb250cmlidXRvcnMgUGx1Z2luXSBcdTUyNEQ1XHU0RTJBXHU2NTcwXHU2MzZFXHU5NTJFOmAsIE9iamVjdC5rZXlzKGNvbnRyaWJ1dG9yc0RhdGEpLnNsaWNlKDAsIDUpKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFx1OEZENFx1NTZERVx1OEQyMVx1NzMyRVx1ODAwNVx1NjU3MFx1NjM2RVx1NEY1Q1x1NEUzQSBFUyBcdTZBMjFcdTU3NTdcclxuICAgICAgICBjb25zdCBtb2R1bGVDb250ZW50ID0gYGV4cG9ydCBkZWZhdWx0ICR7SlNPTi5zdHJpbmdpZnkoY29udHJpYnV0b3JzRGF0YSwgbnVsbCwgMil9YFxyXG4gICAgICAgIHJldHVybiBtb2R1bGVDb250ZW50XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBcdTU3MjhcdTVGMDBcdTUzRDFcdTZBMjFcdTVGMEZcdTRFMEJcdTU0MkZcdTc1MjhcdTcwRURcdTY2RjRcdTY1QjBcclxuICAgIGhhbmRsZUhvdFVwZGF0ZSh7IGZpbGUsIHNlcnZlciB9KSB7XHJcbiAgICAgIGlmIChmaWxlLmluY2x1ZGVzKCdjb250cmlidXRvcnMuanMnKSB8fCBmaWxlLmluY2x1ZGVzKCdzY3JpcHRzL2NvbnRyaWJ1dG9ycycpKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1OEQyMVx1NzMyRVx1ODAwNVx1NjU3MFx1NjM2RVx1NURGMlx1NjZGNFx1NjVCMFx1RkYwQ1x1NkI2M1x1NTcyOFx1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RC4uLicpXHJcbiAgICAgICAgc2VydmVyLndzLnNlbmQoe1xyXG4gICAgICAgICAgdHlwZTogJ2Z1bGwtcmVsb2FkJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0gIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFwxX3Byb2plY3RcXFxcaHMta25vd2xlZGdlLWJhc2VcXFxcYXBwc1xcXFxkb2NzXFxcXHNjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXDFfcHJvamVjdFxcXFxocy1rbm93bGVkZ2UtYmFzZVxcXFxhcHBzXFxcXGRvY3NcXFxcc2NyaXB0c1xcXFxjb250cmlidXRvcnMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LzFfcHJvamVjdC9ocy1rbm93bGVkZ2UtYmFzZS9hcHBzL2RvY3Mvc2NyaXB0cy9jb250cmlidXRvcnMuanNcIjtpbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSAnY3J5cHRvJ1xyXG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2VzcydcclxuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAndXRpbCdcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xyXG5cclxuY29uc3QgZXhlY0FzeW5jID0gcHJvbWlzaWZ5KGV4ZWMpXHJcblxyXG4vLyBcdThEMjFcdTczMkVcdTgwMDVcdTRGRTFcdTYwNkZcdTYzQTVcdTUzRTNcclxuLyoqXHJcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvbnRyaWJ1dG9ySW5mb1xyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbmFtZSAtIFx1OEQyMVx1NzMyRVx1ODAwNVx1NTlEM1x1NTQwRFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZW1haWwgLSBcdThEMjFcdTczMkVcdTgwMDVcdTkwQUVcdTdCQjFcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IGNvdW50IC0gXHU4RDIxXHU3MzJFXHU2QjIxXHU2NTcwXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBoYXNoIC0gXHU5MEFFXHU3QkIxXHU3Njg0TUQ1XHU1NEM4XHU1RTBDXHU1MDNDXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFx1ODNCN1x1NTNENlx1NjMwN1x1NUI5QVx1OERFRlx1NUY4NFx1NzY4NFx1OEQyMVx1NzMyRVx1ODAwNVx1NEZFMVx1NjA2RlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZVBhdGggLSBcdTY1ODdcdTRFRjZcdTYyMTZcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICogQHJldHVybnMge1Byb21pc2U8Q29udHJpYnV0b3JJbmZvW10+fSBcdThEMjFcdTczMkVcdTgwMDVcdTUyMTdcdTg4NjhcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDb250cmlidXRvcnNBdChmaWxlUGF0aCkge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBcdTRGN0ZcdTc1MjggVVRGLTggXHU3RjE2XHU3ODAxXHU1OTA0XHU3NDA2XHU0RTJEXHU2NTg3XHU4REVGXHU1Rjg0XHJcbiAgICBjb25zdCBnaXRDb21tYW5kID0gYGdpdCBsb2cgLS1wcmV0dHk9Zm9ybWF0OlwiJWFufCVhZVwiIC0tZW5jb2Rpbmc9VVRGLTggLS0gXCIke2ZpbGVQYXRofVwiYFxyXG4gICAgXHJcbiAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgZXhlY0FzeW5jKGdpdENvbW1hbmQsIHtcclxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcclxuICAgICAgZW52OiB7IC4uLnByb2Nlc3MuZW52LCBMQ19BTEw6ICdDLlVURi04JyB9XHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBpZiAoIXN0ZG91dC50cmltKCkpIHtcclxuICAgICAgcmV0dXJuIFtdXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0IGNvbW1pdHMgPSBzdGRvdXRcclxuICAgICAgLnNwbGl0KCdcXG4nKVxyXG4gICAgICAuZmlsdGVyKGxpbmUgPT4gbGluZS50cmltKCkpXHJcbiAgICAgIC5tYXAobGluZSA9PiB7XHJcbiAgICAgICAgY29uc3QgW25hbWUsIGVtYWlsXSA9IGxpbmUuc3BsaXQoJ3wnKVxyXG4gICAgICAgIHJldHVybiB7IG5hbWU6IG5hbWU/LnRyaW0oKSwgZW1haWw6IGVtYWlsPy50cmltKCkgfVxyXG4gICAgICB9KVxyXG4gICAgICAuZmlsdGVyKGNvbW1pdCA9PiBjb21taXQubmFtZSAmJiBjb21taXQuZW1haWwpXHJcbiAgICBcclxuICAgIC8vIFx1N0VERlx1OEJBMVx1NkJDRlx1NEUyQVx1OEQyMVx1NzMyRVx1ODAwNVx1NzY4NFx1NjNEMFx1NEVBNFx1NkIyMVx1NjU3MFxyXG4gICAgY29uc3QgY29udHJpYnV0b3JNYXAgPSBuZXcgTWFwKClcclxuICAgIFxyXG4gICAgY29tbWl0cy5mb3JFYWNoKCh7IG5hbWUsIGVtYWlsIH0pID0+IHtcclxuICAgICAgY29uc3Qga2V5ID0gZW1haWwudG9Mb3dlckNhc2UoKVxyXG4gICAgICBpZiAoY29udHJpYnV0b3JNYXAuaGFzKGtleSkpIHtcclxuICAgICAgICBjb250cmlidXRvck1hcC5nZXQoa2V5KS5jb3VudCsrXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29udHJpYnV0b3JNYXAuc2V0KGtleSwge1xyXG4gICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIGVtYWlsLFxyXG4gICAgICAgICAgY291bnQ6IDEsXHJcbiAgICAgICAgICBoYXNoOiBjcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoZW1haWwudG9Mb3dlckNhc2UoKSkuZGlnZXN0KCdoZXgnKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBcclxuICAgIC8vIFx1NjMwOVx1OEQyMVx1NzMyRVx1NkIyMVx1NjU3MFx1NjM5Mlx1NUU4RlxyXG4gICAgcmV0dXJuIEFycmF5LmZyb20oY29udHJpYnV0b3JNYXAudmFsdWVzKCkpXHJcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmNvdW50IC0gYS5jb3VudClcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS53YXJuKGBcdTgzQjdcdTUzRDZcdThEMjFcdTczMkVcdTgwMDVcdTRGRTFcdTYwNkZcdTU5MzFcdThEMjUgKCR7ZmlsZVBhdGh9KTpgLCBlcnJvci5tZXNzYWdlKVxyXG4gICAgcmV0dXJuIFtdXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogXHU5MDEyXHU1RjUyXHU4M0I3XHU1M0Q2XHU3NkVFXHU1RjU1XHU0RTBCXHU2MjQwXHU2NzA5IE1hcmtkb3duIFx1NjU4N1x1NEVGNlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyIC0gXHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbiAqIEByZXR1cm5zIHtzdHJpbmdbXX0gTWFya2Rvd24gXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHU1MjE3XHU4ODY4XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRBbGxNYXJrZG93bkZpbGVzKGRpcikge1xyXG4gIGNvbnN0IGZpbGVzID0gW11cclxuICBjb25zdCBpdGVtcyA9IGZzLnJlYWRkaXJTeW5jKGRpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pXHJcbiAgXHJcbiAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XHJcbiAgICBpZiAoaXRlbS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWVcclxuICAgIFxyXG4gICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyLCBpdGVtLm5hbWUpXHJcbiAgICBpZiAoaXRlbS5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgIGZpbGVzLnB1c2goLi4uZ2V0QWxsTWFya2Rvd25GaWxlcyhmdWxsUGF0aCkpXHJcbiAgICB9IGVsc2UgaWYgKGl0ZW0ubmFtZS5lbmRzV2l0aCgnLm1kJykpIHtcclxuICAgICAgZmlsZXMucHVzaChmdWxsUGF0aClcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIGZpbGVzXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTY1ODdcdTY4NjNcdTc2ODRcdThEMjFcdTczMkVcdTgwMDVcdTRGRTFcdTYwNkZcclxuICogQHJldHVybnMge1Byb21pc2U8UmVjb3JkPHN0cmluZywgQ29udHJpYnV0b3JJbmZvW10+Pn0gXHU2NTg3XHU2ODYzXHU4REVGXHU1Rjg0XHU1MjMwXHU4RDIxXHU3MzJFXHU4MDA1XHU1MjE3XHU4ODY4XHU3Njg0XHU2NjIwXHU1QzA0XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RG9jdW1lbnRDb250cmlidXRvcnMoKSB7XHJcbiAgLy8gXHU4M0I3XHU1M0Q2XHU2QjYzXHU3ODZFXHU3Njg0IGRvY3MgXHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbiAgY29uc3QgY3VycmVudERpciA9IHByb2Nlc3MuY3dkKClcclxuICBjb25zdCBkb2NzRGlyID0gY3VycmVudERpci5lbmRzV2l0aCgnYXBwcy9kb2NzJykgfHwgY3VycmVudERpci5lbmRzV2l0aCgnYXBwc1xcXFxkb2NzJylcclxuICAgID8gY3VycmVudERpciBcclxuICAgIDogcGF0aC5yZXNvbHZlKGN1cnJlbnREaXIsICdhcHBzL2RvY3MnKVxyXG4gIFxyXG4gIGNvbnN0IHRhcmdldERpcnMgPSBbJ2NsaWVudCcsICdzZXJ2ZXInLCAnYWknLCAnZGV2b3BzJywgJ3N5c3RlbXMnXVxyXG4gIFxyXG4gIGNvbnN0IGFsbEZpbGVzID0gW11cclxuICBmb3IgKGNvbnN0IGRpciBvZiB0YXJnZXREaXJzKSB7XHJcbiAgICBjb25zdCBkaXJQYXRoID0gcGF0aC5qb2luKGRvY3NEaXIsIGRpcilcclxuICAgIGlmIChmcy5leGlzdHNTeW5jKGRpclBhdGgpKSB7XHJcbiAgICAgIGFsbEZpbGVzLnB1c2goLi4uZ2V0QWxsTWFya2Rvd25GaWxlcyhkaXJQYXRoKSlcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY29uc29sZS5sb2coYFx1NkI2M1x1NTcyOFx1NTIwNlx1Njc5MCAke2FsbEZpbGVzLmxlbmd0aH0gXHU0RTJBXHU2NTg3XHU2ODYzXHU2NTg3XHU0RUY2XHU3Njg0XHU4RDIxXHU3MzJFXHU4MDA1Li4uYClcclxuICBcclxuICBjb25zdCBjb250cmlidXRvcnNNYXAgPSB7fVxyXG4gIFxyXG4gIC8vIFx1NUU3Nlx1ODg0Q1x1NTkwNFx1NzQwNlx1NEVFNVx1NjNEMFx1OUFEOFx1NjAyN1x1ODBGRFxyXG4gIGNvbnN0IGJhdGNoU2l6ZSA9IDEwXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxGaWxlcy5sZW5ndGg7IGkgKz0gYmF0Y2hTaXplKSB7XHJcbiAgICBjb25zdCBiYXRjaCA9IGFsbEZpbGVzLnNsaWNlKGksIGkgKyBiYXRjaFNpemUpXHJcbiAgICBjb25zdCBiYXRjaFJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgYmF0Y2gubWFwKGFzeW5jIChmaWxlUGF0aCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRyaWJ1dG9ycyA9IGF3YWl0IGdldENvbnRyaWJ1dG9yc0F0KGZpbGVQYXRoKVxyXG4gICAgICAgIC8vIFx1NzUxRlx1NjIxMFx1NzZGOFx1NUJGOVx1NEU4RSBkb2NzIFx1NzZFRVx1NUY1NVx1NzY4NFx1OTUyRVx1NTQwRFxyXG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhdGgucmVsYXRpdmUoZG9jc0RpciwgZmlsZVBhdGgpXHJcbiAgICAgICAgcmV0dXJuIHsga2V5OiByZWxhdGl2ZVBhdGgsIGNvbnRyaWJ1dG9ycyB9XHJcbiAgICAgIH0pXHJcbiAgICApXHJcbiAgICBcclxuICAgIGJhdGNoUmVzdWx0cy5mb3JFYWNoKCh7IGtleSwgY29udHJpYnV0b3JzIH0pID0+IHtcclxuICAgICAgaWYgKGNvbnRyaWJ1dG9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29udHJpYnV0b3JzTWFwW2tleV0gPSBjb250cmlidXRvcnNcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coYFx1NURGMlx1NTkwNFx1NzQwNiAke01hdGgubWluKGkgKyBiYXRjaFNpemUsIGFsbEZpbGVzLmxlbmd0aCl9LyR7YWxsRmlsZXMubGVuZ3RofSBcdTRFMkFcdTY1ODdcdTRFRjZgKVxyXG4gIH1cclxuICBcclxuICBjb25zb2xlLmxvZyhgXHU2MjEwXHU1MjlGXHU1MjA2XHU2NzkwXHU0RTg2ICR7T2JqZWN0LmtleXMoY29udHJpYnV0b3JzTWFwKS5sZW5ndGh9IFx1NEUyQVx1NjcwOVx1OEQyMVx1NzMyRVx1OEJCMFx1NUY1NVx1NzY4NFx1NjU4N1x1Njg2M2ApXHJcbiAgcmV0dXJuIGNvbnRyaWJ1dG9yc01hcFxyXG59XHJcblxyXG4vKipcclxuICogXHU2ODM5XHU2MzZFXHU2NTg3XHU2ODYzXHU4REVGXHU1Rjg0XHU3NTFGXHU2MjEwXHU4RDIxXHU3MzJFXHU4MDA1XHU3RUM0XHU0RUY2XHU3Njg0XHU1NTJGXHU0RTAwXHU5NTJFXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aCAtIFx1NjU4N1x1Njg2M1x1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBcdTdFQzRcdTRFRjZcdTk1MkVcdTU0MERcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUNvbnRyaWJ1dG9yS2V5KGZpbGVQYXRoKSB7XHJcbiAgLy8gXHU3OUZCXHU5NjY0IC5tZCBcdTYyNjlcdTVDNTVcdTU0MERcdUZGMENcdThGNkNcdTYzNjJcdThERUZcdTVGODRcdTUyMDZcdTk2OTRcdTdCMjZcclxuICByZXR1cm4gZmlsZVBhdGhcclxuICAgIC5yZXBsYWNlKC9cXC5tZCQvLCAnJylcclxuICAgIC5yZXBsYWNlKC9cXFxcL2csICcvJylcclxuICAgIC5yZXBsYWNlKC9cXC9pbmRleCQvLCAnJykgLy8gXHU3OUZCXHU5NjY0XHU2NzJCXHU1QzNFXHU3Njg0IC9pbmRleFxyXG59ICJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlUsU0FBUSxvQkFBbUI7QUFDeFcsU0FBUSxXQUFBQSxnQkFBYztBQUN0QixTQUFRLGlCQUFBQyxzQkFBb0I7OztBQ0ZtVCxPQUFPLFFBQVE7QUFDOVYsT0FBTyxVQUFVO0FBQ2pCLFNBQVEsZUFBYztBQUN0QixTQUFRLHFCQUFvQjtBQUh5TCxJQUFNLDJDQUEyQztBQVF0USxJQUFNLFlBQVksY0FBYyxJQUFJLElBQUksS0FBSyx3Q0FBZSxDQUFDO0FBSzdELElBQU0sVUFBVSxRQUFRLFdBQVcsVUFBVTtBQU83QyxTQUFTLFdBQVcsVUFBVTtBQUM1QixNQUFJO0FBQ0YsV0FBTyxHQUFHLFdBQVcsUUFBUTtBQUFBLEVBQy9CLFNBQVMsS0FBSztBQUNaLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFPQSxTQUFTLGVBQWUsU0FBUztBQUUvQixTQUFPLFFBQVEsT0FBTyxDQUFDLEVBQUUsWUFBWSxJQUNqQyxRQUFRLE1BQU0sQ0FBQyxFQUFFLFFBQVEsTUFBTSxHQUFHO0FBQ3hDO0FBVUEsU0FBUyxpQkFBaUIsS0FBSyxVQUFVLFdBQVcsSUFBSSxlQUFlLEdBQUc7QUFDeEUsUUFBTSxXQUFXLEtBQUssS0FBSyxVQUFVLEdBQUc7QUFDeEMsUUFBTSxlQUFlO0FBR3JCLE1BQUksQ0FBQyxXQUFXLFFBQVEsS0FBTSxhQUFhLE1BQU0sZUFBZSxVQUFXO0FBQ3pFLFdBQU8sQ0FBQztBQUFBLEVBQ1Y7QUFFQSxRQUFNLFNBQVMsQ0FBQztBQUdoQixRQUFNLFFBQVEsR0FBRyxZQUFZLFFBQVE7QUFHckMsUUFBTSxPQUFPLENBQUM7QUFDZCxRQUFNLFFBQVEsQ0FBQztBQUVmLGFBQVcsUUFBUSxPQUFPO0FBQ3hCLFVBQU0sV0FBVyxLQUFLLEtBQUssVUFBVSxJQUFJ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LGFBQWEsR0FBRztBQUM5Qix1QkFBTztBQUFBLGNBQ1Q7QUFFQSxrQkFBSSxHQUFHLFNBQVMsWUFBWSxHQUFHO0FBQzdCLHVCQUFPO0FBQUEsY0FDVDtBQUVBLHFCQUFPO0FBQUEsWUFDVDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsWUFBWUMsU0FBUUgsWUFBVyxnQkFBZ0I7QUFBQSxFQUNqRDtBQUFBLEVBRUEsYUFBYTtBQUFBLElBQ1gsTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0gsRUFBQyxNQUFNLGdCQUFNLE1BQU0sSUFBRztBQUFBLE1BQ3RCLEVBQUMsTUFBTSxzQkFBTyxNQUFNLFdBQVU7QUFBQSxNQUM5QixFQUFDLE1BQU0sc0JBQU8sTUFBTSxXQUFVO0FBQUEsTUFDOUIsRUFBQyxNQUFNLGtDQUFTLE1BQU0sWUFBVztBQUFBLE1BQ2pDLEVBQUMsTUFBTSxVQUFVLE1BQU0sV0FBVTtBQUFBLE1BQ2pDLEVBQUMsTUFBTSwwQ0FBWSxNQUFNLE9BQU07QUFBQSxNQUMvQixFQUFDLE1BQU0sc0JBQU8sTUFBTSxnQkFBZTtBQUFBLE1BQ25DLEVBQUMsTUFBTSxnQkFBTSxNQUFNLFNBQVE7QUFBQSxJQUM3QjtBQUFBLElBRUEsU0FBUyxpQkFBaUI7QUFBQSxJQUUxQixhQUFhO0FBQUEsTUFDWCxFQUFDLE1BQU0sVUFBVSxNQUFNLHlEQUF3RDtBQUFBLE1BQy9FLEVBQUMsTUFBTSxXQUFXLE1BQU0sOEJBQTZCO0FBQUEsSUFDdkQ7QUFBQSxJQUVBLFFBQVE7QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFFQSxRQUFRO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJyZXNvbHZlIiwgImZpbGVVUkxUb1BhdGgiLCAicGF0aCIsICJmcyIsICJmcyIsICJwYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19kaXJuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAicm9vdERpciIsICJyZXNvbHZlIl0KfQo=
