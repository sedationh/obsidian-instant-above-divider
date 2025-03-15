import { App, Editor, Plugin, PluginSettingTab, Setting } from "obsidian";

interface PluginSettings {
	respectHeadings: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
	respectHeadings: true,
};

export default class InstantAboveDividerPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "add-section",
			name: "Add Section",
			editorCallback: (editor: Editor) => {
				if (!this.settings.respectHeadings) {
					editor.setCursor(0, 0);
					const newContent = "\n\n---\n\n";
					editor.replaceRange(newContent, { line: 0, ch: 0 });
					return;
				}

				const cursorPos = editor.getCursor();
				const content = editor.getValue();
				const lines = content.split("\n");
				let insertLine = 0; // 默认在文件开头

				// 查找光标之前的最近标题
				for (let i = cursorPos.line - 1; i >= 0; i--) {
					if (lines[i].match(/^#{1,6}\s/)) {
						insertLine = i + 1;
						break;
					}
				}

				if (insertLine === 0) {
					editor.setCursor(0, 0);
					const newContent = "\n\n---\n\n";
					editor.replaceRange(newContent, { line: 0, ch: 0 });
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
