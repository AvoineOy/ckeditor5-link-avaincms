import Command from '@ckeditor/ckeditor5-core/src/command'
import {showUI} from './utils'

export default class UnlinkCommand extends Command {
  refresh() {
    this.isEnabled = this.editor.model.document.selection.hasAttribute('richLink')
  }

  execute() {
    const linkCommand = editor.commands.get('link')
    if (linkCommand.isEnabled) {
      showUI(editor)
    }
  }
}
