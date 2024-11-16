import { Editor, Plugin } from 'obsidian';


export default class InstantAboveDividerPlugin extends Plugin {
	async onload() {
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
}
