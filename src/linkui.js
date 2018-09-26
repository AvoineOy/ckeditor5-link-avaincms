import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver'
import Range from '@ckeditor/ckeditor5-engine/src/view/range'
import {isLinkElement} from './utils'

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
        this._showUI()
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
      this.listenTo(button, 'execute', () => this._showUI())

      return button
    })
  }

  _showUI() {
    const editor = this.editor

    if (!editor.commands.get('link')) {
      return
    }

    const currValue = {href: ''}
    const selected = this._getSelectedLinkElement()
    if (selected) {
      currValue.href = selected.getAttribute('href')
    }

    const update = newValue => {
      if (currValue.href) {
        editor.execute('unlink')
      } else {
        editor.execute('link', newValue)
      }
    }
    window.openLinkModal(currValue, update)
  }

  /**
   * Returns the link {@link module:engine/view/attributeelement~AttributeElement} under
   * the {@link module:engine/view/document~Document editing view's} selection or `null`
   * if there is none.
   *
   * **Note**: For a non–collapsed selection the link element is only returned when **fully**
   * selected and the **only** element within the selection boundaries.
   *
   * @private
   * @returns {module:engine/view/attributeelement~AttributeElement|null}
   */
  _getSelectedLinkElement() {
    const selection = this.editor.editing.view.document.selection

    if (selection.isCollapsed) {
      return findLinkElementAncestor(selection.getFirstPosition())
    } else {
      // The range for fully selected link is usually anchored in adjacent text nodes.
      // Trim it to get closer to the actual link element.
      const range = selection.getFirstRange().getTrimmed()
      const startLink = findLinkElementAncestor(range.start)
      const endLink = findLinkElementAncestor(range.end)

      if (!startLink || startLink != endLink) {
        return null
      }

      // Check if the link element is fully selected.
      if (
        Range.createIn(startLink)
          .getTrimmed()
          .isEqual(range)
      ) {
        return startLink
      } else {
        return null
      }
    }
  }
}

// Returns a link element if there's one among the ancestors of the provided `Position`.
//
// @private
// @param {module:engine/view/position~Position} View position to analyze.
// @returns {module:engine/view/attributeelement~AttributeElement|null} Link element at the position or null.
function findLinkElementAncestor(position) {
  return position.getAncestors().find(ancestor => isLinkElement(ancestor))
}
