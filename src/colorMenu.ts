import { Menu, MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { ColorPickerModal } from "./colorPickerModal";


export const createCheckboxColorMenu = (plugin: PrettyPropertiesPlugin, e: MouseEvent, checkboxObj: any) => {
    let colors = [
        "default marker",
        "default checkbox",
        "red",
        "orange",
        "yellow",
        "green",
        "cyan",
        "blue",
        "purple",
        "pink"
    ];

    let menu = new Menu();

    for (let color of colors) {
        menu.addItem((item: MenuItem) => {
            item.setIcon("square");
            let checkboxColor = "var(--checkbox-color)"

            if (color == "default checkbox") {
                checkboxColor = "var(--checkbox-color)"
            } else if (color == "default marker") {
                checkboxColor = "var(--checkbox-marker-color)"
            } else {
                checkboxColor = "rgb(var(--color-" + color + "-rgb))"
            }

            //@ts-ignore
            item.iconEl.style =
                "color: transparent; background-color: " + checkboxColor + ";";
            item.setTitle(color)
            .onClick((e) => {
                checkboxObj.color = checkboxColor
                plugin.saveSettings()
                plugin.updateAllCheckboxes()
            })

            item.setChecked(checkboxObj.color == checkboxColor)
            if (color == "default marker") {
                item.setChecked(checkboxObj.color == checkboxColor || !checkboxObj.color)
            }
        });
    }

    menu.addItem((item: MenuItem) => {
        item.setTitle("custom")
        item.setIcon("square");
        //@ts-ignore
        item.iconEl.classList.add("menu-item-custom-color")
        item.onClick(() => {
            new ColorPickerModal(plugin, checkboxObj).open()
        })
        //@ts-ignore
            item.setChecked(checkboxObj.color.startsWith("#"))
    })
    
    menu.showAtMouseEvent(e)
}
