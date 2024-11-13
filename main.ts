import { Editor, Plugin } from 'obsidian';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface InstantAboveDividerSettings {
}

const DEFAULT_SETTINGS: InstantAboveDividerSettings = {
}

export default class InstantAboveDividerPlugin extends Plugin {
	settings: InstantAboveDividerSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'add-section',
			name: 'Add Section',
			editorCallback: (editor: Editor) => {
				editor.setCursor(0, 0);
				const newContent = '\n\n---\n\n';
				editor.replaceRange(newContent, { line: 0, ch: 0 });
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
