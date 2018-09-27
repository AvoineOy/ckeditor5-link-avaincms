/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/utils
 */

import Range from '@ckeditor/ckeditor5-engine/src/view/range'
const linkElementSymbol = Symbol('linkElement')

const ATTRIBUTE_WHITESPACES = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g // eslint-disable-line no-control-regex
const SAFE_URL = /^(?:(?:https?|ftps?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i

/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isLinkElement(node) {
  return node.is('attributeElement') && !!node.getCustomProperty(linkElementSymbol)
}

export function upcast(viewElement) {
  return {
    href: viewElement.getAttribute('href'),
    openInNewWindow: !!viewElement.hasAttribute('target'),
  }
}

/**
 * Creates link {@link module:engine/view/attributeelement~AttributeElement} with provided `href` attribute.
 *
 * @param {String} href
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createLinkElement(richLink, writer) {
  // Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.

  const attrs = {}
  if (richLink && richLink.href) {
    attrs.href = richLink.href
    attrs.rel = 'noopener'
    if (richLink.openInNewWindow) {
      attrs.target = '_blank'
    }
  }
  const linkElement = writer.createAttributeElement('a', attrs, {priority: 5})
  writer.setCustomProperty(linkElementSymbol, true, linkElement)

  return linkElement
}

/**
 * Returns a safe URL based on a given value.
 *
 * An URL is considered safe if it is safe for the user (does not contain any malicious code).
 *
 * If URL is considered unsafe, a simple `"#"` is returned.
 *
 * @protected
 * @param {*} url
 * @returns {String} Safe URL.
 */
export function ensureSafeUrl(url) {
  url = String(url)

  return isSafeUrl(url) ? url : '#'
}

// Checks whether the given URL is safe for the user (does not contain any malicious code).
//
// @param {String} url URL to check.
function isSafeUrl(url) {
  const normalizedUrl = url.replace(ATTRIBUTE_WHITESPACES, '')

  return normalizedUrl.match(SAFE_URL)
}

export function showUI(editor) {
  if (!editor.commands.get('link')) {
    return
  }

  let currValue = {href: ''}
  const selected = getSelectedLinkElement(editor)
  if (selected) {
    currValue = upcast(selected)
  }

  const updateCallback = newValue => {
    if (newValue.href) {
      editor.execute('link', newValue)
    } else {
      editor.execute('unlink')
    }
  }
  editor.openLinkModal(currValue, updateCallback)
}

export function getSelectedLinkElement(editor) {
  function findLinkElementAncestor(position) {
    return position.getAncestors().find(ancestor => isLinkElement(ancestor))
  }

  const selection = editor.editing.view.document.selection

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
