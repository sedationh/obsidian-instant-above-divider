# Instant Above Divider

A simple Obsidian plugin that adds a command to instantly insert a divider line (---) at the beginning of the current note.




https://github.com/user-attachments/assets/40e62de3-9893-4807-9f46-359726d2a319



## Features

-   Adds a command to insert a divider at the beginning of the note
-   Automatically moves cursor to the beginning after insertion
-   Option to respect headings when inserting dividers
-   Smart handling of frontmatter - dividers are inserted after frontmatter if present
-   Document outline view that shows headings and dividers
-   Click on outline items to navigate to specific sections
-   Automatic extraction of first N characters after dividers for outline display (configurable, default: 10)

## Installation

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Instant Above Divider"
4. Install and enable the plugin

## Usage

1. Open Obsidian Settings > Hotkeys
2. Search for "Instant Above Divider: Add Section"
3. Set your preferred hotkey (recommended: `Option/Alt + Shift + N`)
4. Use your configured hotkey to insert a divider at the beginning of the current note

### Outline Feature

The plugin now includes a document outline feature that shows the structure of your note:

1. Open Obsidian Settings > Hotkeys
2. Search for "Instant Above Divider: Show Outline"
3. Set your preferred hotkey (recommended: `Option/Alt + Shift + O`)
4. Use your configured hotkey to open the outline view
5. Click on any outline item to navigate to that section

The outline displays:
- All headings (# ## ### etc.) with proper hierarchy
- Dividers (---) with the first N characters of the following content (configurable)
- Click navigation to jump to any section

### Settings

#### Respect Headings

When enabled, the plugin will consider the location of headings when inserting dividers:

-   If the cursor is directly after a heading, the divider will be inserted after that heading
-   Otherwise, the divider will be inserted at the current cursor position

When disabled, dividers will always be inserted at the beginning of the note content (after frontmatter if present).

Note: The plugin will always respect frontmatter (YAML metadata at the beginning of the note) regardless of this setting. If your note has frontmatter, the divider will be inserted after it rather than at the very beginning of the file.

#### Max Content Length

This setting controls how many characters are extracted from the content following a divider for display in the outline:

- Default value: 10 characters
- Range: Any positive integer
- When the content is shorter than the configured length, the entire content is displayed
- When the content is longer, only the first N characters are shown

This setting affects all existing and future outline views immediately when changed.

## License

MIT
