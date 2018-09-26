import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver'
import Range from '@ckeditor/ckeditor5-engine/src/view/range'
import {isLinkElement, upcast, showUI} from './utils'

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview'

import linkIcon from '../theme/icons/link.svg'

const linkKeystroke = 'Ctrl+K'

export default class LinkUI extends Plugin {
  static get requires() {}

  init() {
    const editor = this.editor

    editor.editing.view.addObserver(ClickObserver)

    this._createToolbarLinkButton()
  }

  _createToolbarLinkButton() {
    const editor = this.editor
    const linkCommand = editor.commands.get('link')
    const t = editor.t

    // Handle the `Ctrl+K` keystroke and show the panel.
    editor.keystrokes.set(linkKeystroke, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF and opening new tab in Edge. #153, #154.
      cancel()

      if (linkCommand.isEnabled) {
        showUI(editor)
      }
    })

    editor.ui.componentFactory.add('link', locale => {
      const button = new ButtonView(locale)

      button.isEnabled = true
      button.label = t('Link')
      button.icon = linkIcon
      button.keystroke = linkKeystroke
      button.tooltip = true

      // Bind button to the command.
      button.bind('isEnabled').to(linkCommand, 'isEnabled')

      // Show the panel on button click.
      this.listenTo(button, 'execute', () => showUI(editor))

      return button
    })
  }
}
