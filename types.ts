/**
 * 大纲项目接口
 * 用于表示文档大纲中的单个项目，可以是标题或分隔线
 */
export interface OutlineItem {
	/** 唯一标识符，用于区分不同的大纲项目 */
	id: string;
	
	/** 项目类型：标题或分隔线 */
	type: "heading" | "divider";
	
	/** 层级深度，数字越小层级越高（如：1=H1, 2=H2, 3=H3） */
	level: number;
	
	/** 显示标题，对于标题类型是标题文本，对于分隔线是分隔线后的内容 */
	title: string;
	
	/** 在文档中的行号（从0开始） */
	line: number;
	
	/** 在文档中的字符位置（从0开始） */
	ch: number;
	
	/** 子项目列表，用于支持层级结构 */
	children?: OutlineItem[];
	
	/** 是否展开显示，用于折叠/展开功能 */
	isExpanded?: boolean;
}

export interface HeadingItem {
	level: number;
	title: string;
	line: number;
	ch: number;
}

export interface DividerItem {
	line: number;
	ch: number;
	title: string;
	level: number;
}

export interface ParsedContent {
	headings: HeadingItem[];
	dividers: DividerItem[];
	outlineItems: OutlineItem[];
}
