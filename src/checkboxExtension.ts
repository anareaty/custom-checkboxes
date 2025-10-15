//@ts-ignore
import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import {
Decoration,
DecorationSet,
EditorView,
PluginSpec,
PluginValue,
ViewPlugin,
ViewUpdate
} from '@codemirror/view';

import CustomCheckboxes from 'src/main';


export const registerCheckboxExtension = (plugin: CustomCheckboxes) => {

    class CheckboxPlugin implements PluginValue {
        decorations: DecorationSet;
        view: EditorView

        constructor(view: EditorView) {
            this.view = view
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {

            //@ts-ignore
            if (update.docChanged || update.viewportChanged || update.transactions?.[0]?.annotations?.[0]?.value) {
                this.decorations = this.buildDecorations(update.view);
            }
        }

        destroy() {}

        buildDecorations(view: EditorView): DecorationSet {
            const builder = new RangeSetBuilder<Decoration>();
            for (let { from, to } of view.visibleRanges) {
                syntaxTree(view.state).iterate({
                    from,
                    to,
                    enter(node: any) {
                
                        if (node.type.name.includes("formatting_formatting-task_property")) {
                            let text = view.state.doc.sliceString(node.from, node.to);
                            let symbol = text.replace(/(^\[)(.)(\]$)/, "$2")
                            let setting = plugin.settings.checkboxes.find(s => s.symbol == symbol)
        
                            if (setting && setting.url) {
                                let deco = Decoration.mark({
                                    attributes: {
                                        style: `
    --custom-checkbox-url: url("${setting.url}");
    --custom-checkbox-color: ${setting.color};
                                        `
                                    },
                                    class: "custom-checkbox"
                                });
                                builder.add(node.from - 2, node.to + 1, deco);
                            }
                        }
                    },
                });
            }
            
            return builder.finish();
        }
    }

    const pluginSpec: PluginSpec<CheckboxPlugin> = {
        decorations: (value: CheckboxPlugin) => value.decorations,
    };

    const checkboxPlugin = ViewPlugin.fromClass(
        CheckboxPlugin,
        pluginSpec
    )

    plugin.registerEditorExtension(checkboxPlugin)
}


