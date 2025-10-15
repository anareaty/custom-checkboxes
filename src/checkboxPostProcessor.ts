import CustomCheckboxes from "src/main";

export const registerCheckboxPostProcessor = (plugin: CustomCheckboxes) => {
    plugin.registerMarkdownPostProcessor((el, ctx) => {
        let items = el.findAll(".task-list-item")
        for (let item of items) {
          plugin.updateCheckbox(item)
        }
    });
}



