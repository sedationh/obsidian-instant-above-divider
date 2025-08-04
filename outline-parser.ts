import { HeadingItem, DividerItem, ParsedContent } from './types';

export class OutlineParser {
  private maxContentLength: number;

  constructor(maxContentLength: number = 10) {
    this.maxContentLength = maxContentLength;
  }

  /**
   * 解析笔记内容，提取标题和分隔线信息
   */
  parseContent(content: string): ParsedContent {
    const lines = content.split('\n');
    const headings: HeadingItem[] = [];
    const dividers: DividerItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 解析标题
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();
        headings.push({
          level,
          title,
          line: i,
          ch: 0
        });
        continue;
      }

      // 解析分隔线
      if (line.trim() === '---') {
        const content = this.extractDividerContent(lines, i);
        if (content) {
          // 计算分隔线的层级：找到当前分隔线之前的最近标题层级，然后+1
          const level = this.calculateDividerLevel(lines, i);
          dividers.push({
            line: i,
            ch: 0,
            title: content,
            level // 添加层级信息
          });
        }
      }
    }

    return {
      headings,
      dividers,
      outlineItems: []
    };
  }

  /**
   * 提取分隔线后的内容
   */
  extractDividerContent(lines: string[], dividerIndex: number): string {
    // 从分隔线后开始查找第一个非空行
    for (let i = dividerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 跳过空行
      if (line === '') continue;
      
      // 跳过另一个分隔线
      if (line === '---') break;
      
      // 跳过标题行
      if (line.match(/^#{1,6}\s/)) break;
      
      // 找到有效内容，提取前N个有效字符
      return this.getFirstNValidChars(line);
    }
    
    return '';
  }

  /**
   * 获取前N个有效字符
   */
  getFirstNValidChars(text: string): string {
    // 移除首尾空白字符
    const trimmed = text.trim();
    
    // 如果内容少于配置的字符数，返回全部
    if (trimmed.length <= this.maxContentLength) {
      return trimmed;
    }
    
    // 提取前N个字符
    return trimmed.substring(0, this.maxContentLength);
  }

  /**
   * 验证内容是否有效
   */
  isValidContent(content: string): boolean {
    return content.trim().length > 0;
  }

  /**
   * 计算分隔线的层级
   * 分隔线的层级 = 最近标题的层级 + 1
   * 如果没有标题，则为1级
   */
  private calculateDividerLevel(lines: string[], dividerIndex: number): number {
    // 从分隔线向前查找最近的标题
    for (let i = dividerIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      // 跳过空行
      if (line === '') continue;
      
      // 跳过其他分隔线
      if (line === '---') continue;
      
      // 找到标题，返回其层级+1
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        return level + 1;
      }
    }
    
    // 如果没有找到标题，默认为1级
    return 1;
  }

  /**
   * 生成唯一ID
   */
  generateId(type: string, line: number): string {
    return `${type}-${line}-${Date.now()}`;
  }
} 