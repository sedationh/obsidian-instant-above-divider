import {
	App,
	Editor,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import { OutlineView, OUTLINE_VIEW_TYPE } from "./outline-view";

interface PluginSettings {
	respectHeadings: boolean;
	showOutlineInSidebar: boolean;
	maxContentLength: number;
}

const DEFAULT_SETTINGS: PluginSettings = {
	respectHeadings: true,
	showOutlineInSidebar: true,
	maxContentLength: 10,
};

export default class InstantAboveDividerPlugin extends Plugin {
	settings: PluginSettings;
	private debounceTimer: NodeJS.Timeout | null = null;

	// 检测 frontmatter 并返回其结束位置
	private getFrontmatterEndLine(lines: string[]): number {
		if (lines.length < 2 || lines[0] !== "---") {
			return -1;
		}

		// 从第二行开始寻找结束的 "---"
		for (let i = 1; i < lines.length; i++) {
			if (lines[i] === "---") {
				return i;
			}
		}
		return -1;
	}

	async onload() {
		await this.loadSettings();

		// 注册 Outline View
		this.registerView(
			OUTLINE_VIEW_TYPE,
			(leaf: WorkspaceLeaf) =>
				new OutlineView(leaf, this.app, this.settings.maxContentLength)
		);

		// 如果设置中启用了大纲视图，则延迟打开（等待工作区初始化）
		if (this.settings.showOutlineInSidebar) {
			// 延迟执行，确保工作区完全初始化
			setTimeout(() => {
				this.showOutline();
			}, 100);
		}

		// 监听各种事件，自动更新大纲
		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				if (this.debounceTimer) {
					clearTimeout(this.debounceTimer);
				}
				this.debounceTimer = setTimeout(() => {
					console.log("Plugin: 文件打开事件触发");
					this.updateOutlineView();
				}, 500); // 500ms 防抖
			})
		);

		this.registerEvent(
			this.app.workspace.on("editor-change", () => {
				if (this.debounceTimer) {
					clearTimeout(this.debounceTimer);
				}
				this.debounceTimer = setTimeout(() => {
					console.log("Plugin: 编辑器变化事件触发");
					this.updateOutlineView();
				}, 500); // 500ms 防抖
			})
		);

		// 添加分隔线命令
		this.addCommand({
			id: "add-section",
			name: "Add Section",
			editorCallback: (editor: Editor) => {
				const content = editor.getValue();

				const formatterEndLine = this.getFrontmatterEndLine(
					content.split("\n")
				);
				let insertLine = formatterEndLine + 1; // 默认在文件开头
				const cursorPos = editor.getCursor();
				const lines = content.split("\n");

				if (this.settings.respectHeadings) {
					// 查找光标之前的最近标题
					for (let i = cursorPos.line - 1; i >= 0; i--) {
						if (lines[i].match(/^#{1,6}\s/)) {
							insertLine = i + 1;
							break;
						}
					}
				}

				if (insertLine === 0) {
					editor.setCursor(0, 0);
					const newContent = "\n\n---\n\n";
					editor.replaceRange(newContent, {
						line: insertLine,
						ch: 0,
					});
					return;
				}

				const newContent = "\n\n\n---\n";
				editor.replaceRange(newContent, { line: insertLine, ch: 0 });
				editor.setCursor(insertLine + 1, 0);
			},
		});

		this.addSettingTab(new InstantAboveDividerSettingTab(this.app, this));
	}

	/**
	 * 切换大纲视图显示/隐藏
	 */
	private showOutline(): void {
		try {
			// 检查是否已经有大纲视图
			const existingLeaf =
				this.app.workspace.getLeavesOfType(OUTLINE_VIEW_TYPE);

			if (existingLeaf.length > 0) {
				// 如果已存在，检查是否可见
				const leaf = existingLeaf[0];
				if (leaf.getViewState().state?.active) {
					// 如果大纲视图是活动的，则隐藏它
					console.log("Plugin: 隐藏大纲视图");
					leaf.detach();
				} else {
					// 如果大纲视图存在但不活动，则激活它
					console.log("Plugin: 激活大纲视图");
					this.app.workspace.revealLeaf(leaf);
				}
			} else {
				// 创建新的大纲视图
				console.log("Plugin: 创建新的大纲视图");

				// 尝试多种方式创建大纲视图
				let leaf = this.app.workspace.getRightLeaf(false);

				// 如果右侧叶子不可用，尝试左侧
				if (!leaf) {
					leaf = this.app.workspace.getLeftLeaf(false);
				}

				// 如果仍然不可用，尝试创建新的叶子
				if (!leaf) {
					leaf = this.app.workspace.getRightLeaf(true);
				}

				if (leaf) {
					leaf.setViewState({
						type: OUTLINE_VIEW_TYPE,
						active: true,
					});
					this.app.workspace.revealLeaf(leaf);
					console.log("Plugin: 大纲视图创建成功");
				} else {
					console.error(
						"Plugin: 无法创建大纲视图，工作区可能未完全初始化"
					);
				}
			}
		} catch (error) {
			console.error("Plugin: 显示大纲视图时发生错误:", error);
		}
	}

	/**
	 * 更新所有大纲视图
	 */
	private updateOutlineView(): void {
		console.log("Plugin: 开始更新大纲视图");
		const outlineLeaves =
			this.app.workspace.getLeavesOfType(OUTLINE_VIEW_TYPE);
		console.log("Plugin: 找到大纲视图数量:", outlineLeaves.length);

		// 只用更新一个大纲视图
		const leaf = outlineLeaves[0];
		const view = leaf.view as OutlineView;
		if (view && typeof view.updateOutline === "function") {
			console.log(`Plugin: 更新大纲视图`);
			view.updateOutline();
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	public updateOutlineConfig(): void {
		const outlineLeaves =
			this.app.workspace.getLeavesOfType(OUTLINE_VIEW_TYPE);
		const leaf = outlineLeaves[0];
		const view = leaf.view as OutlineView;
		if (view && typeof view.updateConfig === "function") {
			console.log("Plugin: 更新大纲视图配置");
			view.updateConfig(this.settings.maxContentLength);
		}

		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}
		this.debounceTimer = setTimeout(() => {
			console.log("Plugin: 配置更新导致大纲视图更新");
			this.updateOutlineView();
		}, 500);
	}
}

class InstantAboveDividerSettingTab extends PluginSettingTab {
	plugin: InstantAboveDividerPlugin;

	constructor(app: App, plugin: InstantAboveDividerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Respect Headings")
			.setDesc(
				"When enabled, new sections will be inserted above the nearest heading"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.respectHeadings)
					.onChange(async (value) => {
						this.plugin.settings.respectHeadings = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show Outline in Sidebar")
			.setDesc(
				"When enabled, the outline view will be automatically opened when the plugin loads"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showOutlineInSidebar)
					.onChange(async (value) => {
						this.plugin.settings.showOutlineInSidebar = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Max Content Length")
			.setDesc(
				"Maximum number of characters to extract from divider content (default: 10)"
			)
			.addText((text) =>
				text
					.setPlaceholder("10")
					.setValue(this.plugin.settings.maxContentLength.toString())
					.onChange(async (value) => {
						const numValue = parseInt(value) || 10;
						this.plugin.settings.maxContentLength = numValue;
						await this.plugin.saveSettings();
						this.plugin.updateOutlineConfig();
					})
			);
	}
}
