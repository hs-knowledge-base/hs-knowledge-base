// 全局类型声明

declare global {
  interface Window {
    __playground__?: any;
  }

  // 扩展 Element 接口，添加常用的样式属性
  interface Element {
    style: CSSStyleDeclaration;
  }

  // 扩展 HTMLElement 接口
  interface HTMLElement {
    disabled?: boolean;
  }

  // 为 querySelector 提供更宽松的类型
  interface Document {
    querySelector<T = Element>(selectors: string): T | null;
    querySelectorAll<T = Element>(selectors: string): NodeListOf<T>;
  }

  interface Element {
    querySelector<T = Element>(selectors: string): T | null;
    querySelectorAll<T = Element>(selectors: string): NodeListOf<T>;
  }
}

// 确保这个文件被当作模块
export {};
