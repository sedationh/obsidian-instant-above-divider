import { App, Editor, Plugin, PluginSettingTab, Setting } from "obsidian";

interface PluginSettings {
	respectHeadings: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
	respectHeadings: true,
};

export default class InstantAboveDividerPlugin extends Plugin {
	settings: PluginSettings;

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
	}
}
