import { App, ItemView, WorkspaceLeaf, MarkdownView } from "obsidian";
import { OutlineService } from "./outline-service";
import { OutlineItem } from "./types";

export const OUTLINE_VIEW_TYPE = "outline-view";

export class OutlineView extends ItemView {
	private outlineService: OutlineService;
	private outlineItems: OutlineItem[] = [];

	constructor(leaf: WorkspaceLeaf, app: App, maxContentLength: number = 10) {
		super(leaf);
		this.outlineService = new OutlineService(app, maxContentLength);
	}

	getViewType(): string {
		return OUTLINE_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Outline";
	}

	getIcon(): string {
		return "list-tree";
	}

	async onOpen(): Promise<void> {
		const container = this.contentEl;
		container.empty();

		// 获取当前笔记的大纲数据
		this.updateOutline();
	}

	/**
	 * 渲染大纲界面
	 */
	render(outlineItems?: OutlineItem[]): void {
		console.log(
			"OutlineView: 开始渲染大纲，项目数量:",
			outlineItems?.length || this.outlineItems.length
		);

		if (outlineItems) {
			this.outlineItems = outlineItems;
		}

		// 清除现有内容（保留标题）
		const container = this.contentEl as HTMLElement;
		const contentEl = container.querySelector(".outline-content");
		if (contentEl) {
			contentEl.remove();
		}

		const contentContainer = container.createDiv("outline-content");

		if (this.outlineItems.length === 0) {
			contentContainer.createEl("p", {
				text: "No outline content found. Add headings (# ## ###) or dividers (---) to your note.",
				cls: "outline-empty",
			});
			console.log("OutlineView: 渲染空内容提示");
			return;
		}

		// 渲染大纲项目
		this.outlineItems.forEach((item) => {
			this.renderOutlineItem(contentContainer, item);
		});
	}

	/**
	 * 渲染单个大纲项目
	 */
	private renderOutlineItem(container: HTMLElement, item: OutlineItem): void {
		const itemEl = container.createDiv("outline-item");

		// 添加数据属性
		itemEl.setAttribute("data-type", item.type);
		itemEl.setAttribute("data-level", item.level.toString());

		// 创建图标
		const iconEl = itemEl.createSpan("outline-item-icon");
		if (item.type === "heading") {
			// 使用 H1、H2、H3 等层级标识
			iconEl.innerHTML = `H${item.level}`;
		} else {
			// 分隔线使用分割线图标
			iconEl.innerHTML = "➖";
		}

		// 创建标题
		const titleEl = itemEl.createSpan("outline-item-title");
		titleEl.textContent = item.title;

		// 添加点击事件
		itemEl.addEventListener("click", () => {
			this.handleItemClick(item);
		});
	}

	/**
	 * 处理项目点击
	 */
	private handleItemClick(item: OutlineItem): void {
		console.log("OutlineView: 点击大纲项目:", item.title, "行:", item.line);

		// 查找所有 Markdown 视图
		const markdownLeaves = this.app.workspace.getLeavesOfType("markdown");
		console.log(
			"OutlineView: 找到 Markdown 视图数量:",
			markdownLeaves.length
		);

		if (markdownLeaves.length === 0) {
			console.log("OutlineView: 没有找到任何 Markdown 视图");
			return;
		}

		// 获取第一个 Markdown 视图（通常是最新打开的）
		const markdownView = markdownLeaves[0].view as MarkdownView;
		if (!markdownView) {
			console.log("OutlineView: Markdown 视图无效");
			return;
		}

		// 激活 Markdown 视图
		this.app.workspace.setActiveLeaf(markdownLeaves[0], { focus: true });

		// 获取编辑器
		const editor = markdownView.editor;

		// 执行导航
		this.outlineService.navigateToOutlineItem(editor, item);
	}

	/**
	 * 显示大纲
	 */
	show(): void {
		this.render();
	}

	/**
	 * 隐藏大纲
	 */
	hide(): void {
		// 大纲视图的隐藏由 Obsidian 处理
	}

	/**
	 * 更新大纲内容
	 */
	updateOutline(): void {
		console.log("OutlineView: 开始更新大纲");

		// 强制重新获取当前笔记的大纲
		const outlineItems = this.outlineService.getOutlineForCurrentNote();
		console.log(
			"OutlineView: 获取到大纲项目数量:",
			outlineItems.length,
			outlineItems
		);

		// 清空现有数据并重新渲染
		this.outlineItems = [];
		this.render(outlineItems);

		console.log("OutlineView: 大纲更新完成");
	}

	/**
	 * 更新配置
	 */
	updateConfig(maxContentLength: number): void {
		console.log("OutlineView: 开始更新配置");
		this.outlineService = new OutlineService(this.app, maxContentLength);
		console.log(
			"OutlineView: 配置更新完成，maxContentLength:",
			maxContentLength
		);
	}
}
