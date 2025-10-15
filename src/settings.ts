import { App, Editor, MarkdownView, MarkdownRenderer, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import CustomCheckboxes from "./main";


export interface CustomCheckboxesSettings {
    checkboxes: any[]
    editorMenu: boolean
}

export const CC_DEFAULT_SETTINGS: CustomCheckboxesSettings = {
	checkboxes: [],
    editorMenu: true
}


export class CustomCheckboxesSettingTab extends PluginSettingTab {
	plugin: CustomCheckboxes;

	constructor(app: App, plugin: CustomCheckboxes) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

        let hint = containerEl.createEl("p", {text: "Set checkbox symbol and icon data url. Use icon library sites such as "})
        let hintLink = hint.createEl("a", {text: "Lucide"})
        hintLink.href = "https://lucide.dev"
        hint.append(" to find icons.")

        for (let checkboxObj of this.plugin.settings.checkboxes) {

            let checkboxSetting = new Setting(containerEl)
                .addText(text => {
                    text.setPlaceholder("Symbol")
                    .setValue(checkboxObj.symbol)
                    .onChange((value) => {
                        let sameObj = this.plugin.settings.checkboxes.find(c => c.symbol == value)
                        if (sameObj) {} else {
                            if (value.length > 1) value = value[0]
                            checkboxObj.symbol = value
                            this.plugin.saveSettings()
                            
                            this.plugin.updateAllCheckboxes()
                        }
                    })  
                    
                    text.inputEl.onblur = () => {
                        this.display()
                    }
                })
                .addTextArea(text => text
                    .setPlaceholder("data:image/svg...")
                    .setValue(checkboxObj.url)
                    .onChange((value) => {
                        checkboxObj.url = value
                        this.plugin.saveSettings()
                        this.plugin.updateAllCheckboxes()
                    })
                )
                .addColorPicker(color => color
                    .setValue(checkboxObj.color)
					.onChange(async (value) => {
						checkboxObj.color = value
                        this.plugin.saveSettings()
                        this.plugin.updateAllCheckboxes()
					})
                )

                checkboxSetting.settingEl.classList.add("checkbox-setting")
                let checkboxIcon = checkboxSetting.infoEl.createEl("span")
                let symbol = checkboxObj.symbol
                if (!symbol) symbol = "x"
                
                MarkdownRenderer.render(this.plugin.app, "- [" + symbol + "] ", checkboxIcon, "", this.plugin)
                
                checkboxSetting.addButton(btn => btn
                    .setIcon("settings")
                    .onClick(() => {
                        new CheckboxSettingsModal(this.plugin.app, this.plugin, checkboxObj).open()
                    })
                )
                .addButton(btn => btn
                    .setIcon("x")
                    .onClick(() => {
                        this.plugin.settings.checkboxes = this.plugin.settings.checkboxes.filter(c => c.symbol != checkboxObj.symbol)
                        this.plugin.saveSettings()
                        this.display()
                        this.plugin.updateAllCheckboxes()
                    })
                )

            
        }

		new Setting(containerEl)
			.setName('Add checkbox settings')
            .addButton(btn => btn
                .setIcon("plus")
                .onClick(() => {
                    let emptyObj = this.plugin.settings.checkboxes.find(c => c.symbol == "")
                    if (!emptyObj) {
                        let checkboxObj = {
                            symbol: "",
                            url: "",
                            color: "",
                            click: "default",
                            nextSymbol: " ",
                            description: "",
                            menu: true,
                            command: false,
                            editorCommand: false
                        }
                        this.plugin.settings.checkboxes.push(checkboxObj)
                        this.plugin.saveSettings()
                        this.display()
                    }
                    
                })
            )

        new Setting(containerEl)
            .setName("Show select checkbox command in editor menu")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.editorMenu)
                .onChange((value) => {
                    this.plugin.settings.editorMenu = value
                    this.plugin.saveSettings()
                })
            )

        
			
	}
}


class CheckboxSettingsModal extends Modal {
    checkboxObj: any  
    plugin: CustomCheckboxes

	constructor(app: App, plugin: CustomCheckboxes, checkboxObj: any) {
		super(app);
        this.checkboxObj = checkboxObj
        this.plugin = plugin
	}

	onOpen() {
		const {contentEl} = this;

        contentEl.empty()

        new Setting(contentEl)
            .setName("Add to select menu")
            .addToggle(toggle => toggle
                .setValue(this.checkboxObj.menu)
                .onChange((value) => {
                    this.checkboxObj.menu = value
                    this.plugin.saveSettings()
                })
            )

        if (this.checkboxObj.menu) {
            new Setting(contentEl)
                .setName("Checkbox description")
                .setDesc("Description will be shown in select menu")
                .addText(text => text
                    .setValue(this.checkboxObj.description)
                    .onChange((value) => {
                        this.checkboxObj.description = value
                        this.plugin.saveSettings()
                    })
                )
        }

        new Setting(contentEl)
            .setName("Add command to create checkbox to command pallete")
            .setDesc("Need to reload")
            .addToggle(toggle => toggle
                .setValue(this.checkboxObj.command)
                .onChange((value) => {
                    this.checkboxObj.command = value
                    this.plugin.saveSettings()
                    this.onOpen()
                })
            )

        
        new Setting(contentEl)
            .setName("Show command to create checkbox in editor menu")
            .addToggle(toggle => toggle
                .setValue(this.checkboxObj.editorCommand)
                .onChange((value) => {
                    this.checkboxObj.editorCommand = value
                    this.plugin.saveSettings()
                    this.onOpen()
                })
            )
        

        

        new Setting(contentEl)
            .setName("Checkbox click behavior")
            .addDropdown(drop => drop
                .addOptions({"default": "default", "change to symbol": "change to symbol", "search": "search", "none": "none"})
                .setValue(this.checkboxObj.click)
                .onChange((value) => {
                    this.checkboxObj.click = value
                    this.plugin.saveSettings()
                    this.onOpen()
                })
            )

        if (this.checkboxObj.click == "change to symbol") {
            new Setting(contentEl)
                .setName("Next symbol")
                .addText(text => {text
                    .setValue(this.checkboxObj.nextSymbol)
                    .onChange((value) => {
                        if (value.length > 1) value = value[0]
                        this.checkboxObj.nextSymbol = value
                        this.plugin.saveSettings()
                    })

                    text.inputEl.onblur = () => {
                        this.onOpen()
                    }
                })
        }

        
        

        
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}