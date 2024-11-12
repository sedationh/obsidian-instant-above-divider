import { Editor, Plugin } from 'obsidian';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MyPluginSettings {
}

const DEFAULT_SETTINGS: MyPluginSettings = {
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'add-section',
			name: 'Add Section',
			editorCallback: (editor: Editor) => {
				// 将光标移到文件开头
				editor.setCursor(0, 0);
				// 在开头插入分隔线
				const newContent = '\n\n---\n\n';
				editor.replaceRange(newContent, { line: 0, ch: 0 });
			},
			hotkeys: [
				{
					modifiers: ["Alt", "Shift"],
					key: "n",
				},
			],
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
