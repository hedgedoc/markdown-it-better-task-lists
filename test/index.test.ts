import fs from 'fs'
import jest from 'jest'
import MarkdownIt from 'markdown-it/lib'
import taskLists from '../index'

const files = new Map<string, string>(Object.entries({
  bullet: 'bullet.md',
  ordered: 'ordered.md',
  mixedNested: 'mixed-nested.md',
  dirty: 'dirty.md'
}))

describe('markdown-it-task-lists', () => {
  const fixtures = new Map<string, string>()
  const rendered = new Map<string, string>()
  const parsed = new Map<string, HTMLDocument>()
  const mdParser = new MarkdownIt().use(taskLists)
  const parserDefault = new MarkdownIt()
  const domParser = new DOMParser()

  const setup = () => {
    files.forEach((fileName: string, key: string) => {
      const path = __dirname + '/fixtures/' + fileName
      const file = fs.readFileSync(path)
      const mdText = file.toString()
      fixtures.set(key, mdText)
      rendered.set(key, mdParser.render(mdText))
      parsed.set(key, domParser.parseFromString(rendered.get(key)!!, 'text/html'))
    })
  }
  setup()
  beforeEach(setup)

  describe('compared to default markdown-it', () => {
    it.each(Array.from(fixtures))('%s: renders tab-indented code differently than default markdown-it', (name, mdDoc) => {
      expect(parserDefault.render(mdDoc)).not.toBe(mdParser.render(mdDoc))
    })
  })

  it('adds input.task-list-item-checkbox in items', () => {
    expect(parsed.get('bullet')!!.querySelectorAll('input.task-list-item-checkbox').length).not.toBe(0)
  })

  it('renders [ ] as unchecked and [x] as unchecked inputs', () => {
    expect(Array.from(parsed.get('ordered')!!.querySelectorAll('input[type=checkbox]')).map(
      (element) => (element as HTMLInputElement).checked)
    ).toEqual([true, false, true, false])
  })

  it('renders items marked up as [ ] as unchecked', () => {
    const shouldBeUnchecked = (fixtures.get('ordered')!!.match(/[\.\*\+-]\s+\[ \]/g) || []).length
    const actuallyUnchecked = parsed.get('ordered')!!.querySelectorAll('input[type=checkbox].task-list-item-checkbox:not(:checked)').length
    expect(actuallyUnchecked).toBe(shouldBeUnchecked)
  })

  it('renders items marked up as [x] as checked', () => {
    const shouldBeChecked = (fixtures.get('ordered')!!.match(/[\.\*\+-]\s+\[[Xx]\]/g) || []).length
    const actuallyChecked = parsed.get('ordered')!!.querySelectorAll('input[type=checkbox].task-list-item-checkbox:checked').length
    expect(actuallyChecked).toBe(shouldBeChecked)
  })

  describe('when option enabled is unset', () => {
    const dom = parsed.get('bullet')!!
    it('number of not disabled inputs is 0', () => {
      expect(dom.querySelectorAll('input:not([disabled])').length).toBe(0)
    })
    it('number of disabled inputs > 0', () => {
      expect(dom.querySelectorAll('input:disabled').length).toBeGreaterThan(0)
    })
  })

  describe('when options.enabled is true', () => {
    const enabledParser = new MarkdownIt().use(taskLists, { enabled: true })
    const dom = domParser.parseFromString(enabledParser.render(fixtures.get('ordered')!!), 'text/html')
    it('number of disabled inputs is 0', () => {
      expect(dom.querySelectorAll('input:disabled').length).toBe(0)
    })
    it('number os enabled inputs > 0', () => {
      expect(dom.querySelectorAll('input:not([disabled])').length).toBeGreaterThan(0)
    })
    it('adds class `enabled` to <li> elements', () => {
      expect(dom.querySelectorAll('.task-list-item:not(.enabled)').length).toBe(0)
    })
  })

  describe('when options.label unset', () => {
    it.each(Array.from(parsed))('%s: skips rendering wrapping <label> elements', (name, dom) => {
      expect(dom.querySelectorAll('label').length).toBe(0)
    })
  })

  describe('when options.label is false', () => {
    const unlabeledParser = new MarkdownIt().use(taskLists, {  })
    it.each(Array.from(fixtures))('%s: does not render wrapping <label> elements', (name, mdDoc) => {
      //console.log(unlabeledParser.render(mdDoc))
      const dom = domParser.parseFromString(unlabeledParser.render(mdDoc), 'text/html')
      expect(dom.querySelectorAll('label').length).toBe(0)
    })
  })

  describe('when options.label is true', () => {
    const labeledParser = new MarkdownIt().use(taskLists, { label: true })
    it.each(Array.from(fixtures))('%s: wraps the rendered list items\' contents in a <label>', (name, mdDoc) => {
      const dom = domParser.parseFromString(labeledParser.render(mdDoc), 'text/html')
      expect(dom.querySelectorAll('label').length).toBeGreaterThan(0)
      expect(dom.querySelectorAll('label').length).toBe(dom.querySelectorAll('input').length)
    })
  })

  describe('when options.enabled and options.label are true', () => {
    const enabledLabeledParser = new MarkdownIt().use(taskLists, {enabled: true, label: true})
    it.each(Array.from(fixtures))('%s: wraps and enables items', (name, mdDoc) => {
      const dom = domParser.parseFromString(enabledLabeledParser.render(mdDoc), 'text/html')
      expect(dom.querySelectorAll(
        '.task-list-item > label > input[type=checkbox].task-list-item-checkbox:not([disabled])'
      ).length).toBeGreaterThan(0)
    })
  })

  it('does NOT render [  ] as checkboxes', () => {
    expect(rendered.get('dirty')!!.indexOf('<li>[  ]')).not.toBe(-1)
  })

  it('does NOT render "[ ]" (no space after closing bracket) as checkboxes', () => {
    expect(rendered.get('dirty')!!.indexOf('<li>[ ]</li>')).not.toBe(-1)
  })

  it('does NOT render [ x] as checkboxes', () => {
    expect(rendered.get('dirty')!!.indexOf('<li>[x ]')).not.toBe(-1)
  })

  it('does NOT render[x ] as checkboxes', () => {
    expect(rendered.get('dirty')!!.indexOf('<li>[ x]')).not.toBe(-1)
  })

  it('does NOT render [ x ] as checkboxes', () => {
    expect(rendered.get('dirty')!!.indexOf('<li>[ x ]')).not.toBe(-1)
  })

  it('adds class .task-list-item to parent <li>', () => {
    expect(parsed.get('bullet')!!.querySelectorAll('li.task-list-item').length).toBeGreaterThan(0)
  })

  it('adds class .contains-task-list to lists', () => {
    expect(parsed.get('bullet')!!.querySelectorAll('ol.contains-task-list, ul.contains-task-list').length).toBeGreaterThan(0)
  })

  it('only adds .contains-task-list to most immediate parent list', () => {
    expect(parsed.get('mixedNested')!!.querySelectorAll('ol:not(.contains-task-list) ul.contains-task-list').length).toBeGreaterThan(0)
  })
})
