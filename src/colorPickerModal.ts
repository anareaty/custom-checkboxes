import { Modal, Setting } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


export class ColorPickerModal extends Modal {
    plugin: PrettyPropertiesPlugin
    checkboxObj: any

    constructor(plugin: PrettyPropertiesPlugin, checkboxObj: any) {
        super(plugin.app);
        this.plugin = plugin
        this.checkboxObj = checkboxObj
    }
    
    onOpen() {
        this.modalEl.classList.add("color-picker-modal")
        const {contentEl} = this

        new Setting(contentEl)
        .addColorPicker(color => {
            if (this.checkboxObj.color && this.checkboxObj.color.startsWith("#")) {
                color.setValue(this.checkboxObj.color)
            }
            
            color.onChange((value) => {
                let checkboxColor = color.getValue()
                this.checkboxObj.color = checkboxColor
                this.plugin.saveSettings()
                this.plugin.updateAllCheckboxes()
            })
        })
    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
    } 
}