import fs from 'fs'
import jest from 'jest'
import MarkdownIt from 'markdown-it'
import md from 'markdown-it'
import markdownItTaskLists from '..'

const files = new Map<string, string>(Object.entries({
  bullet: 'bullet.md',
  ordered: 'ordered.md',
  mixedNested: 'mixed-nested.md',
  dirty: 'dirty.md'
}))

describe('markdown-it-task lists', () => {
  let fixtures: Map<string, string>
  let rendered: Map<string, string>
  let parsed: Map<string, HTMLDocument>
  let mdParser: MarkdownIt
  let domParser: DOMParser

  beforeEach(() => {
    fixtures = new Map<string, string>()
    rendered = new Map<string, string>()
    parsed = new Map<string, HTMLDocument>()
    mdParser = md().use(markdownItTaskLists)
    domParser = new DOMParser()

    Object.keys(files).forEach(key => {
      const path = __dirname + '/fixtures/' + files.get(key)
      const file = fs.readFileSync(path)
      const mdText = file.toString()
      fixtures.set(key, mdText)
      rendered.set(key, mdParser.render(mdText))
      parsed.set(key, domParser.parseFromString(rendered.get(key)!!, 'text/html'))
    })
  })
})
