import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Language } from '@/types';

interface CodeParams {
  markup?: string;
  style?: string;
  script?: string;
  markupLang?: Language;
  styleLang?: Language;
  scriptLang?: Language;
  autoRun?: boolean;
}

/**
 * 解析 URL 参数中的代码内容
 * 支持从知识库跳转时传递代码
 */
export function useUrlParams() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<CodeParams>({});
  const [isFromKnowledgeBase, setIsFromKnowledgeBase] = useState(false);

  useEffect(() => {
    const urlParams: CodeParams = {};
    let hasCodeParams = false;

    // 解析代码内容
    const markup = searchParams.get('markup') || searchParams.get('html');
    const style = searchParams.get('style') || searchParams.get('css');
    const script = searchParams.get('script') || searchParams.get('js');

    if (markup) {
      urlParams.markup = decodeURIComponent(markup);
      hasCodeParams = true;
    }

    if (style) {
      urlParams.style = decodeURIComponent(style);
      hasCodeParams = true;
    }

    if (script) {
      urlParams.script = decodeURIComponent(script);
      hasCodeParams = true;
    }

    // 解析语言类型
    const markupLang = searchParams.get('markupLang') || searchParams.get('htmlLang');
    const styleLang = searchParams.get('styleLang') || searchParams.get('cssLang');
    const scriptLang = searchParams.get('scriptLang') || searchParams.get('jsLang');

    if (markupLang) {
      urlParams.markupLang = markupLang as Language;
    }

    if (styleLang) {
      urlParams.styleLang = styleLang as Language;
    }

    if (scriptLang) {
      urlParams.scriptLang = scriptLang as Language;
    }

    // 解析自动运行参数
    const autoRun = searchParams.get('autoRun') || searchParams.get('run');
    if (autoRun === 'true' || autoRun === '1') {
      urlParams.autoRun = true;
    }

    // 检查是否来自知识库
    const source = searchParams.get('source') || searchParams.get('from');
    const isFromKB = source === 'kb' || source === 'knowledge-base' || hasCodeParams;

    setParams(urlParams);
    setIsFromKnowledgeBase(isFromKB);

    console.log('[UrlParams] 解析结果:', {
      params: urlParams,
      isFromKnowledgeBase: isFromKB,
      hasCodeParams
    });
  }, [searchParams]);

  return {
    params,
    isFromKnowledgeBase,
    hasParams: Object.keys(params).length > 0
  };
}

/**
 * 生成分享链接
 */
export function generateShareUrl(code: {
  markup: string;
  style: string;
  script: string;
}, languages: {
  markup: Language;
  style: Language;
  script: Language;
}, autoRun = false): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams();

  // 添加代码内容（只添加非空内容）
  if (code.markup.trim()) {
    params.set('markup', encodeURIComponent(code.markup));
  }
  if (code.style.trim()) {
    params.set('style', encodeURIComponent(code.style));
  }
  if (code.script.trim()) {
    params.set('script', encodeURIComponent(code.script));
  }

  // 添加语言类型（只在非默认时添加）
  if (languages.markup !== 'html') {
    params.set('markupLang', languages.markup);
  }
  if (languages.style !== 'css') {
    params.set('styleLang', languages.style);
  }
  if (languages.script !== 'javascript') {
    params.set('scriptLang', languages.script);
  }

  // 添加自动运行参数
  if (autoRun) {
    params.set('autoRun', 'true');
  }

  // 添加来源标识
  params.set('source', 'share');

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
