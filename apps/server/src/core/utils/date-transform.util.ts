/**
 * 日期转换工具类
 * 用于 VO 中的日期字段转换
 */
export class DateTransformUtil {
  /**
   * 将日期转换为 ISO 字符串
   * 支持 Date 对象、字符串、时间戳等多种格式
   * 
   * @param value 日期值
   * @returns ISO 字符串或 null
   */
  static toISOString(value: any): string | null {
    if (!value) return null;
    
    try {
      // 如果已经是 Date 对象
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      // 如果是字符串
      if (typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          console.warn(`无效的日期字符串: ${value}`);
          return null;
        }
        return date.toISOString();
      }
      
      // 如果是数字（时间戳）
      if (typeof value === 'number') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          console.warn(`无效的时间戳: ${value}`);
          return null;
        }
        return date.toISOString();
      }
      
      // 其他类型直接返回
      console.warn(`不支持的日期类型: ${typeof value}, 值: ${value}`);
      return null;
    } catch (error) {
      console.error(`日期转换失败:`, error);
      return null;
    }
  }

  /**
   * 将日期转换为本地日期字符串
   * 
   * @param value 日期值
   * @param locale 地区设置，默认为 'zh-CN'
   * @returns 本地日期字符串或 null
   */
  static toLocaleDateString(value: any, locale: string = 'zh-CN'): string | null {
    if (!value) return null;
    
    try {
      let date: Date;
      
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string' || typeof value === 'number') {
        date = new Date(value);
        if (isNaN(date.getTime())) {
          return null;
        }
      } else {
        return null;
      }
      
      return date.toLocaleDateString(locale);
    } catch (error) {
      console.error(`本地日期转换失败:`, error);
      return null;
    }
  }

  /**
   * 将日期转换为相对时间描述
   * 
   * @param value 日期值
   * @returns 相对时间描述或 null
   */
  static toRelativeTime(value: any): string | null {
    if (!value) return null;
    
    try {
      let date: Date;
      
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string' || typeof value === 'number') {
        date = new Date(value);
        if (isNaN(date.getTime())) {
          return null;
        }
      } else {
        return null;
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSeconds < 60) {
        return '刚刚';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else if (diffDays < 30) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    } catch (error) {
      console.error(`相对时间转换失败:`, error);
      return null;
    }
  }

  /**
   * 格式化日期为指定格式
   * 
   * @param value 日期值
   * @param format 格式字符串，如 'YYYY-MM-DD HH:mm:ss'
   * @returns 格式化后的日期字符串或 null
   */
  static format(value: any, format: string = 'YYYY-MM-DD HH:mm:ss'): string | null {
    if (!value) return null;
    
    try {
      let date: Date;
      
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string' || typeof value === 'number') {
        date = new Date(value);
        if (isNaN(date.getTime())) {
          return null;
        }
      } else {
        return null;
      }
      
      // 简单的格式化实现
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return format
        .replace('YYYY', year.toString())
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    } catch (error) {
      console.error(`日期格式化失败:`, error);
      return null;
    }
  }
}
