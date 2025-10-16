import { SuggestModal, TFile, getIcon, getIconIds, SettingTab } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


export class SvgSuggestModal extends SuggestModal<string> {
    iconIds: string[]
    checkboxObj: any
    plugin: PrettyPropertiesPlugin
    settingTab: SettingTab

    constructor(plugin: PrettyPropertiesPlugin, checkboxObj: any, settingTab: SettingTab) {
        super(plugin.app)
        this.checkboxObj = checkboxObj
        this.iconIds = getIconIds();
        this.plugin = plugin
        this.settingTab = settingTab
    }

    getSuggestions(query: string): string[] {
        return this.iconIds.filter((val) => {
            return val.toLowerCase().includes(query.toLowerCase());
        });
    }
    async renderSuggestion(id: string, el: Element) {
        let svg = getIcon(id) || "";
        el.append(svg);
        el.classList.add("image-suggestion-item");
        el.classList.add("svg-icon");
    }
    onChooseSuggestion(id: string) {
        if (id) {
            let iconSvg = getIcon(id)
            if (iconSvg) {
                let encoded = encodeURIComponent(iconSvg.outerHTML)
                let uri = "data:image/svg+xml;charset=utf-8," + encoded
                console.log(uri)
                this.checkboxObj.url = uri
                this.plugin.saveSettings()
                this.settingTab.display()
                this.plugin.updateAllCheckboxes()

            }
        }
    }
}