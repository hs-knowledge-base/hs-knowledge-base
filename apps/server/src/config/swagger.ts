import { knife4jSetup } from 'nestjs-knife4j';
import { writeFileSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';

type SwaggerPaths = NonNullable<OpenAPIObject['paths']>;
type SwaggerPathItem = SwaggerPaths[string];

interface DocumentConfig {
  prefix: string;
  tag: string;
  title: string;
  path: string;
  jsonFile: string;
  jsonPath: string;
  knife4jName: string;
}

/**
 * Swagger 基础配置
 */
const SWAGGER_CONFIG = {
  title: 'hs-knowledge-base-server',
  description: '火山知识库平台API文档',
  version: '0.0.1',
  contact: {
    name: '火山',
    url: 'https://github.com/hs-knowledge-base/hs-knowledge-base',
    email: '2633057734@qq.com',
  },
  auth: {
    type: 'http' as const,
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'Authorization',
    description: '请输入 JWT 格式的 Token',
    in: 'header' as const,
  },
} as const;

/**
 * 文档配置
 */
const DOCUMENTS: Record<string, DocumentConfig> = {
  blog: {
    prefix: '/docs/',
    tag: 'docs',
    title: '知识库前台 API 文档',
    path: 'docs-api-docs',
    jsonFile: './docs-openapi.json',
    jsonPath: '/docs-api-docs-json',
    knife4jName: '知识库前台 API',
  },
  admin: {
    prefix: '/admin/',
    tag: 'admin',
    title: '知识库后台 API 文档',
    path: 'admin-api-docs',
    jsonFile: './admin-openapi.json',
    jsonPath: '/admin-api-docs-json',
    knife4jName: '后台管理 API',
  },
} as const;

/**
 * UI 配置
 */
const UI_CONFIG = {
  favicon: '/static/ai.svg',
  customCss: '.swagger-ui .topbar { display: none }',
} as const;

/**
 * 创建基础 Swagger 配置
 */
function createSwaggerConfig(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version)
    .addBearerAuth(SWAGGER_CONFIG.auth)
    .setContact(
      SWAGGER_CONFIG.contact.name,
      SWAGGER_CONFIG.contact.url,
      SWAGGER_CONFIG.contact.email,
    )
    .build();
}

/**
 * 检查路径是否包含指定标签
 */
function hasMatchingTag(pathItem: SwaggerPathItem, targetTag: string): boolean {
  if (!pathItem) return false;

  const operations = Object.values(pathItem);
  return operations.some(operation => {
    if (!operation || typeof operation !== 'object') return false;
    const tags = (operation as { tags?: string[] }).tags;
    return tags?.some(tag => tag.toLowerCase().includes(targetTag.toLowerCase()));
  });
}

/**
 * 筛选文档路径
 */
function filterDocumentPaths(document: OpenAPIObject, config: DocumentConfig): OpenAPIObject {
  const filteredDocument: OpenAPIObject = JSON.parse(JSON.stringify(document));

  if (!document.paths) {
    return filteredDocument;
  }

  const filteredPaths: SwaggerPaths = {};

  for (const [path, pathItem] of Object.entries(document.paths)) {
    if (!pathItem) continue;

    const isTargetPath = path.startsWith(config.prefix) ||
                        hasMatchingTag(pathItem, config.tag);

    if (isTargetPath) {
      filteredPaths[path] = pathItem;
    }
  }

  filteredDocument.paths = filteredPaths;
  return filteredDocument;
}

/**
 * 设置单个文档的 Swagger UI
 */
function setupSwaggerUI(app: INestApplication, document: OpenAPIObject, config: DocumentConfig): void {
  SwaggerModule.setup(config.path, app, document, {
    customSiteTitle: config.title,
    customfavIcon: UI_CONFIG.favicon,
    customCss: UI_CONFIG.customCss,
  });
}

/**
 * 保存文档为 JSON 文件
 */
function saveDocumentAsJson(document: OpenAPIObject, filePath: string): void {
  writeFileSync(filePath, JSON.stringify(document, null, 2));
}

/**
 * 设置 Knife4j 文档聚合
 */
function setupKnife4j(app: INestApplication): void {
  const urls = Object.values(DOCUMENTS).map(config => ({
    name: config.knife4jName,
    url: config.jsonPath,
    swaggerVersion: '3.0' as const,
    location: config.jsonPath,
  }));

  knife4jSetup(app, { urls });
}

/**
 * 生成 Swagger 文档
 */
export function generateSwaggerDocument(app: INestApplication): void {
  const config = createSwaggerConfig();

  const fullDocument = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // 为每个文档类型生成独立的文档
  for (const [key, docConfig] of Object.entries(DOCUMENTS)) {
    const filteredDocument = filterDocumentPaths(fullDocument, docConfig);

    setupSwaggerUI(app, filteredDocument, docConfig);
    saveDocumentAsJson(filteredDocument, docConfig.jsonFile);
  }

  setupKnife4j(app);
}
