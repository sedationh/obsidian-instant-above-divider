import { App, Editor, MarkdownView } from "obsidian";
import { OutlineParser } from "./outline-parser";
import { OutlineItem } from "./types";

export class OutlineService {
	private parser: OutlineParser;
	private app: App;

	constructor(app: App, maxContentLength: number = 10) {
		this.app = app;
		this.parser = new OutlineParser(maxContentLength);
	}

	/**
	 * 生成大纲数据
	 */
	generateOutline(content: string): OutlineItem[] {
		if (!content || content.trim() === "") {
			return [];
		}

		const parsedContent = this.parser.parseContent(content);
		const outlineItems: OutlineItem[] = [];

		// 处理标题
		parsedContent.headings.forEach((heading) => {
			outlineItems.push({
				id: this.parser.generateId("heading", heading.line),
				type: "heading",
				level: heading.level,
				title: heading.title,
				line: heading.line,
				ch: heading.ch,
				isExpanded: true,
			});
		});

		// 处理分隔线
		parsedContent.dividers.forEach((divider) => {
			if (this.parser.isValidContent(divider.title)) {
				outlineItems.push({
					id: this.parser.generateId("divider", divider.line),
					type: "divider",
					level: divider.level, // 使用计算出的层级
					title: divider.title,
					line: divider.line,
					ch: divider.ch,
					isExpanded: true,
				});
			}
		});

		// 按行号排序
		outlineItems.sort((a, b) => a.line - b.line);

		return outlineItems;
	}

	/**
	 * 获取当前笔记的大纲
	 */
	getOutlineForCurrentNote(): OutlineItem[] {
		console.log("OutlineService: 开始获取当前笔记大纲");
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			console.log("OutlineService: 没有找到活动的 Markdown 视图");
			return [];
		}

		const editor = activeView.editor;
		const content = editor.getValue();
		console.log("OutlineService: 获取到内容长度:", content.length);
		console.log(
			"OutlineService: 内容预览:",
			content.substring(0, 100) + "..."
		);

		const outline = this.generateOutline(content);
		console.log("OutlineService: 生成大纲项目数量:", outline.length);

		// 输出大纲项目的详细信息
		outline.forEach((item, index) => {
			console.log(
				`OutlineService: 项目 ${index + 1}: [${item.type}] ${
					item.title
				} (层级: ${item.level}, 行: ${item.line})`
			);
		});

		return outline;
	}

	/**
	 * 导航到指定位置
	 */
	navigateToPosition(editor: Editor, line: number, ch: number): void {
		try {
			console.log("OutlineService: 开始导航到位置:", line, ch);

			// 验证行号是否有效
			const lineCount = editor.lineCount();
			if (line < 0 || line >= lineCount) {
				console.error(
					"OutlineService: 无效的行号:",
					line,
					"总行数:",
					lineCount
				);
				return;
			}

			// 验证列号是否有效
			const lineContent = editor.getLine(line);
			if (lineContent && ch > lineContent.length) {
				ch = lineContent.length; // 调整到行尾
				console.log("OutlineService: 列号调整到行尾:", ch);
			}

			// 设置光标位置
			editor.setCursor(line, ch);
			console.log("OutlineService: 光标位置已设置到:", line, ch);

			// 聚焦编辑器
			editor.focus();
			console.log("OutlineService: 编辑器已聚焦");

			// 确保目标位置在视图中可见
			editor.scrollIntoView(
				{ from: { line, ch }, to: { line, ch } },
				true
			);
			console.log("OutlineService: 视图已滚动到目标位置");

			// 可选：选中当前行（提供视觉反馈）
			// editor.setSelection({ line, ch: 0 }, { line, ch: lineContent?.length || 0 });
		} catch (error) {
			console.error("OutlineService: 导航失败:", error);
		}
	}

	/**
	 * 导航到大纲项目
	 */
	navigateToOutlineItem(editor: Editor, item: OutlineItem): void {
		console.log(
			"OutlineService: 导航到大纲项目:",
			item.title,
			"类型:",
			item.type
		);

		let targetLine = item.line;
		let targetCh = item.ch;

		// 根据项目类型调整光标位置
		if (item.type === "heading") {
			// 对于标题，光标移动到标题文本的开始位置
			const lineContent = editor.getLine(item.line);
			if (lineContent) {
				// 找到标题文本的开始位置（跳过 # 符号和空格）
				const match = lineContent.match(/^(#{1,6})\s+(.+)$/);
				if (match) {
					targetCh = match[1].length + 1; // # 符号长度 + 1个空格
					console.log(
						"OutlineService: 标题光标位置调整到:",
						targetCh
					);
				}
			}
		} else if (item.type === "divider") {
			// 对于分隔线，光标移动到分隔线后的内容开始位置
			const lines = editor.getValue().split("\n");
			const content = this.parser.extractDividerContent(lines, item.line);
			if (content) {
				// 查找分隔线后的第一个非空行
				for (let i = item.line + 1; i < lines.length; i++) {
					const line = lines[i].trim();
					if (line && line !== "---" && !line.match(/^#{1,6}\s/)) {
						targetLine = i;
						targetCh = 0; // 移动到该行的开头
						console.log(
							"OutlineService: 分隔线光标位置调整到行:",
							targetLine
						);
						break;
					}
				}
			}
		}

		// 执行导航
		this.navigateToPosition(editor, targetLine, targetCh);
	}
}
