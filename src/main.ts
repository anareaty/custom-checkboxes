import { App, Editor, MarkdownView, MarkdownRenderer, Modal, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, TFile } from 'obsidian';
import { CustomCheckboxesSettingTab, CustomCheckboxesSettings, CC_DEFAULT_SETTINGS } from './settings';
import { registerCheckboxExtension } from './checkboxExtension';
import { registerCheckboxPostProcessor } from './checkboxPostProcessor';

// Remember to rename these classes and interfaces!





export default class CustomCheckboxes extends Plugin {
	settings: CustomCheckboxesSettings

	async onload() {
		await this.loadSettings();

		registerCheckboxExtension(this)
		registerCheckboxPostProcessor(this)


		this.addCommand({
			id: 'select-custom-checkbox',
			name: 'Выбрать чекбокс',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new SelectCheckboxModal(this.app, this, editor).open()
			}
		});


		let commandCheckboxes = this.settings.checkboxes.filter(c => c.command && c.symbol)

		for (let checkbox of commandCheckboxes) {
			let symbol = checkbox.symbol
			let description = checkbox.description
			if (!description) description = 'Установить чекбокс ' + symbol
			this.addCommand({
				id: 'set-custom-checkbox' + symbol,
				name: description,
				editorCallback: (editor: Editor, view: MarkdownView) => {
					this.setCheckbox(checkbox, editor)
				}
			});
		}

		
		

		
		this.addSettingTab(new CustomCheckboxesSettingTab(this.app, this));

		
		

		this.registerEvent(
		this.app.workspace.on("editor-menu", (menu, editor, view) => {

			if (this.settings.editorMenu) {
				menu.addItem((item) => {
					item
					.setTitle('Выбрать чекбокс')
					.setSection("custom-checkboxes")
					.setIcon('image')
					.onClick(async () => {
						new SelectCheckboxModal(this.app, this, editor).open()
					});
				});
			}
			
			let editorCommandCheckboxes = this.settings.checkboxes.filter(c => c.symbol && c.editorCommand)

			for (let checkbox of editorCommandCheckboxes) {
				let symbol = checkbox.symbol
				let description = checkbox.description
				if (!description) description = 'Установить чекбокс ' + symbol

				menu.addItem((item) => item
					.setTitle(description)
					.setSection("custom-checkboxes")
					.setIcon('image')
					.onClick(async () => {
						this.setCheckbox(checkbox, editor)
					})
				);
			}
		}))





		this.registerDomEvent(document, 'click', (e: MouseEvent) => {
			let target = e.target
			if (target instanceof HTMLElement && target.closest(".task-list-item-checkbox")) {
				let symbol = target.getAttribute("data-task")

				if (!symbol) {
					let li = target.closest("[data-task]")
					symbol = li?.getAttribute("data-task") || null
				}

				

				if (symbol) {
					let checkbox = this.settings.checkboxes.find(c => c.symbol == symbol)
					if (checkbox) {
						if (checkbox.click != "default") {
							

							e.stopPropagation()
							e.preventDefault()
							if (checkbox.click == "search") {
								//@ts-ignore
								this.app.internalPlugins.plugins["global-search"].instance.openGlobalSearch('"- [' + symbol + ']"')
							} else if (checkbox.click == "change to symbol") {
								let editor = this.app.workspace.activeEditor?.editor!
								let leaf = this.app.workspace.getLeaf()
								let viewState = leaf.getViewState()
								let mode = viewState.state?.mode
								let newCheckbox = {symbol: checkbox.nextSymbol}
								
								if (mode == "source") {
									let line: number | undefined = undefined
									//@ts-ignore
									let position = editor.posAtCoords(e.clientX, e.clientY)
									
									if (position) {
										line = position.line
									}
									this.setCheckbox(newCheckbox, editor, line)
								} else if (mode == "preview") {
									let view = target.closest(".markdown-preview-view")
									let viewCheckboxes = view?.querySelectorAll('li[data-task="' + checkbox.symbol + '"') || []
									let targetLi = target.closest("li")
									let index: number | undefined = undefined

									viewCheckboxes.forEach((viewCheckbox, i) => {
										if (viewCheckbox == targetLi) {
											index = i
										} 
									})

									let file = this.app.workspace.getActiveFile()
									if (file instanceof TFile && typeof index == "number") {
										let cache = this.app.metadataCache.getFileCache(file)
										let listItems = cache?.listItems
										if (listItems) {
											let item = listItems.filter(l => l.task == checkbox.symbol)[index]
											let line = item.position.start.line

											this.app.vault.process(file, content => {
												let lines = content.split("\n")
												let linestring = lines[line]

												let newLineString = linestring.replace("- [" + checkbox.symbol + "] ", "- [" + checkbox.nextSymbol + "] ")
												lines[line] = newLineString
												content = lines.join("\n")
												return content
											})
										}
									}

								}
								
							}
						} 
					}
				}
			}
		}, true);

		this.updateAllCheckboxes()



		


		















	
    





    


    

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, CC_DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async updateCheckbox(item: HTMLElement) {
		let symbol = item.getAttribute("data-task")

		if (symbol) {
			let setting = this.settings.checkboxes.find(s => s.symbol == symbol)
			if (setting && setting.url) {
				item.classList.add("custom-checkbox")
				item.setCssProps({
					"--custom-checkbox-url": `url("${setting.url}")`,
					"--custom-checkbox-color": setting.color
				})
			}
		}
	}
	
	
	async updateAllCheckboxes() {
		let items = document.querySelectorAll(".task-list-item")
		for (let item of items) {
			if (item instanceof HTMLElement) {
				this.updateCheckbox(item)
			}
		}

		this.app.workspace.iterateAllLeaves((leaf) => {
			let view = leaf.view
			if (view instanceof MarkdownView) {	
				let state = view.getState()
				if (state.mode == "source") {
					// @ts-expect-error, not typed
					const editorView = view.editor.cm as EditorView;
					editorView.dispatch({
						userEvent: "updateCustomCheckboxes"
					})
				}
			}
		})
	}





	setCheckbox(checkbox: any, editor: Editor, line?: number | undefined) {
		
		if (!line) {
			line = editor.getCursor().line
		}

		
		
		let lineText = editor.getLine(line)

		


		let newLineText = lineText
		let lineTextTrimmed = lineText.trimStart()
		let lineTextIndent = lineText.substring(0, lineText.lastIndexOf(lineTextTrimmed))

		let checkboxString = ""
		if (checkbox.symbol == "list") {
			checkboxString = "- "
		} else if (checkbox.symbol != "CLEAR") {
			checkboxString = "- [" + checkbox.symbol + "] "
		}

		
		
		if (!lineTextTrimmed.startsWith("- ")) {
			newLineText = lineTextIndent + checkboxString + lineTextTrimmed

		} else {

			let checkboxMatch = lineTextTrimmed.match(/(- \[[^\[\]]\] )(.*)/)

			let oldSymbol = "- "

			if (checkboxMatch) {
				oldSymbol = checkboxMatch[1]
			}

			newLineText = lineTextIndent + lineTextTrimmed.replace(oldSymbol, checkboxString)

		}

		
		

		editor.setLine(line, newLineText)
		editor.setSelection({line: line, ch: newLineText.length})
	}
}



class SelectCheckboxModal extends SuggestModal<string> {
	plugin: CustomCheckboxes
	editor: Editor

	constructor(app: App, plugin: CustomCheckboxes, editor: Editor) {
	  super(app);
	  this.plugin = plugin;
	  this.editor = editor
	}

  getSuggestions(query: string): string[] {
	let checkboxes = [...this.plugin.settings.checkboxes]

	let clearElement = {
		menu: true,
		symbol: "CLEAR", 
		description: "ОЧИСТИТЬ"
	}

	let listElement = {
		menu: true,
		symbol: "list", 
		description: "Список"
	}

	checkboxes.unshift(listElement)
	checkboxes.unshift(clearElement)


    let menuCheckboxes = checkboxes.filter((checkbox) =>
      checkbox.menu && checkbox.description.toLowerCase().includes(query.toLowerCase())
    );

	return menuCheckboxes
  }


  async renderSuggestion(checkbox: any, el: HTMLElement) {
	let text = ""
	if (checkbox.symbol == "CLEAR") {
		text = "ОЧИСТИТЬ"
	} else if (checkbox.symbol == "list") {
		text = "- Список"
	} else {
		text = "- [" + checkbox.symbol + "] " + checkbox.description
	} 
	await MarkdownRenderer.render(this.plugin.app, text, el, "", this.plugin)
	el.classList.add("select-checkbox-item")
  }

  onChooseSuggestion(checkbox: any, evt: MouseEvent | KeyboardEvent) {
    this.plugin.setCheckbox(checkbox, this.editor)
  }
}
