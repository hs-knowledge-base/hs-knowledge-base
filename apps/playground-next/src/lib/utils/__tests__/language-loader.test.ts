/**
 * 语言加载器测试
 * 验证按需加载机制是否正常工作
 */

import { LanguageLoader } from '../language-loader';
import type { Language } from '@/types';

// Mock 服务
const mockLanguageService = {
  normalizeLanguage: (lang: string) => lang as Language,
  getLanguageConfig: (lang: Language) => {
    const configs = {
      html: { name: 'html', editorType: 'markup' },
      css: { name: 'css', editorType: 'style' },
      javascript: { name: 'javascript', editorType: 'script' },
      typescript: { 
        name: 'typescript', 
        editorType: 'script',
        compiler: { vendorKey: 'typescript' }
      },
      markdown: {
        name: 'markdown',
        editorType: 'markup', 
        compiler: { vendorKey: 'marked' }
      }
    };
    return configs[lang as keyof typeof configs] || null;
  }
};

const mockVendorService = {
  loadVendor: jest.fn().mockResolvedValue(undefined)
};

const mockCompilerFactory = {
  // Mock implementation
};

describe('LanguageLoader', () => {
  let loader: LanguageLoader;

  beforeEach(() => {
    loader = new LanguageLoader(mockLanguageService, mockVendorService, mockCompilerFactory);
    mockVendorService.loadVendor.mockClear();
  });

  test('应该能加载不需要编译器的语言', async () => {
    await loader.loadLanguage('html');
    expect(mockVendorService.loadVendor).not.toHaveBeenCalled();
    expect(loader.isLanguageLoaded('html')).toBe(true);
  });

  test('应该能加载需要编译器的语言', async () => {
    await loader.loadLanguage('typescript');
    expect(mockVendorService.loadVendor).toHaveBeenCalledWith('typescript');
    expect(loader.isLanguageLoaded('typescript')).toBe(true);
  });

  test('应该能处理不支持的语言', async () => {
    await loader.loadLanguage('unsupported' as Language);
    expect(loader.getLanguageError('unsupported' as Language)).toBeDefined();
  });

  test('应该能批量加载语言', async () => {
    await loader.loadLanguages(['html', 'css', 'javascript']);
    expect(loader.isLanguageLoaded('html')).toBe(true);
    expect(loader.isLanguageLoaded('css')).toBe(true);
    expect(loader.isLanguageLoaded('javascript')).toBe(true);
  });

  test('应该避免重复加载', async () => {
    await loader.loadLanguage('typescript');
    await loader.loadLanguage('typescript');
    expect(mockVendorService.loadVendor).toHaveBeenCalledTimes(1);
  });
});

console.log('语言加载器测试文件已创建');
