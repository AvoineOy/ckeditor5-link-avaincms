import Command from '@ckeditor/ckeditor5-core/src/command'
import {showUI} from './utils'

export default class ClicklinkCommand extends Command {
  refresh() {
    this.isEnabled = this.editor.model.document.selection.hasAttribute('richLink')
  }

  execute() {
    const linkCommand = this.editor.commands.get('link')
    if (linkCommand.isEnabled) {
      showUI(this.editor)
    }
  }
}
