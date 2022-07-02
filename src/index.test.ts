/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: ISC
 */

import { Optional } from '@mrdrogdrog/optional'
import MarkdownIt from 'markdown-it/lib'
import taskLists from '../src'
import { JSDOM } from 'jsdom'
import { Fixtures, loadFixtures } from './test-utils/fixtures/load-fixtures'

const DOMParser = new JSDOM().window.DOMParser

describe('markdown-it-task-lists', () => {
  const taskListMarkdownParser = new MarkdownIt().use(taskLists)
  const defaultMarkdownParser = new MarkdownIt()
  const fixtures: Fixtures = loadFixtures()
  const caseNames = Array.from(Object.entries(fixtures))
  const domParser = new DOMParser()

  describe('compared to default markdown-it', () => {
    it.each(caseNames)('%s: renders tab-indented code differently than default markdown-it', (name, fixture) => {
      expect(defaultMarkdownParser.render(fixture.markdown)).not.toBe(taskListMarkdownParser.render(fixture.markdown))
    })
  })

  it('adds input.task-list-item-checkbox in items', () => {
    expect(fixtures.bullet.parsedDocument.querySelectorAll('input.task-list-item-checkbox')).not.toHaveLength(0)
  })

  it('renders [ ] as unchecked and [x] as unchecked inputs', () => {
    expect(
      Array.from(fixtures.ordered.parsedDocument.querySelectorAll('input[type=checkbox]')).map(
        (element) => (element as HTMLInputElement).checked
      )
    ).toEqual([true, false, true, false])
  })

  it('renders items marked up as [ ] as unchecked', () => {
    const shouldBeUnchecked = (fixtures.ordered.markdown.match(/[.*+-]\s+\[ ]/g) || []).length
    const actuallyUnchecked = fixtures.ordered.parsedDocument.querySelectorAll(
      'input[type=checkbox].task-list-item-checkbox:not(:checked)'
    ).length
    expect(actuallyUnchecked).toBe(shouldBeUnchecked)
  })

  it('renders items marked up as [x] as checked', () => {
    const shouldBeChecked = (fixtures.ordered.markdown.match(/[.*+-]\s+\[[Xx]]/g) || []).length
    const actuallyChecked = fixtures.ordered.parsedDocument.querySelectorAll(
      'input[type=checkbox].task-list-item-checkbox:checked'
    ).length
    expect(actuallyChecked).toBe(shouldBeChecked)
  })

  it('input renders correctly', () => {
    const strs = fixtures.bullet.html.match(/<input\s([\w-]+="[\w\s-]*"\s)*\/>/gm)
    expect(strs?.length).toBe(4)
  })

  describe('when option enabled is unset', () => {
    const dom = fixtures.bullet.parsedDocument
    it('number of not disabled inputs is 0', () => {
      expect(dom.querySelectorAll('input:not([disabled])')).toHaveLength(0)
    })
    it('number of disabled inputs > 0', () => {
      expect(dom.querySelectorAll('input:disabled').length).toBeGreaterThan(0)
    })
  })

  describe('when options.enabled is true', () => {
    const enabledParser = new MarkdownIt().use(taskLists, { enabled: true })
    const dom = domParser.parseFromString(enabledParser.render(fixtures.ordered.markdown), 'text/html')
    it('number of disabled inputs is 0', () => {
      expect(dom.querySelectorAll('input:disabled')).toHaveLength(0)
    })
    it('number os enabled inputs > 0', () => {
      expect(dom.querySelectorAll('input:not([disabled])').length).toBeGreaterThan(0)
    })
    it('adds class `enabled` to <li> elements', () => {
      expect(dom.querySelectorAll('.task-list-item:not(.enabled)')).toHaveLength(0)
    })
  })

  describe('when options.label unset', () => {
    it.each(caseNames)('%s: skips rendering wrapping <label> elements', (name, fixture) => {
      expect(fixture.parsedDocument.querySelectorAll('label')).toHaveLength(0)
    })
  })

  describe('when options.label is false', () => {
    const unlabeledParser = new MarkdownIt().use(taskLists, {})
    it.each(caseNames)('%s: does not render wrapping <label> elements', (name, fixture) => {
      const dom = domParser.parseFromString(unlabeledParser.render(fixture.markdown), 'text/html')
      expect(dom.querySelectorAll('label')).toHaveLength(0)
    })
  })

  describe('when options.label is true', () => {
    const labeledParser = new MarkdownIt().use(taskLists, { label: true })
    it.each(caseNames)("%s: wraps the rendered list items' contents in a <label>", (name, fixture) => {
      const dom = domParser.parseFromString(labeledParser.render(fixture.markdown), 'text/html')
      expect(dom.querySelectorAll('label').length).toBeGreaterThan(0)
      expect(dom.querySelectorAll('label')).toHaveLength(dom.querySelectorAll('input').length)
    })
  })

  describe('when options.enabledDOMParser and options.label are true', () => {
    const enabledLabeledParser = new MarkdownIt().use(taskLists, { enabled: true, label: true })
    it.each(caseNames)('%s: wraps and enables items', (name, fixture) => {
      const dom = domParser.parseFromString(enabledLabeledParser.render(fixture.markdown), 'text/html')
      expect(
        dom.querySelectorAll('.task-list-item > input[type=checkbox].task-list-item-checkbox:not([disabled]) + label')
          .length
      ).toBeGreaterThan(0)
    })
  })

  it('does NOT render [  ] as checkboxes', () => {
    expect(fixtures.dirty.html.indexOf('<li>[  ]')).not.toBe(-1)
  })

  it('does NOT render "[ ]" (no space after closing bracket) as checkboxes', () => {
    expect(fixtures.dirty.html.indexOf('<li>[ ]</li>')).not.toBe(-1)
  })

  it('does NOT render [ x] as checkboxes', () => {
    expect(fixtures.dirty.html.indexOf('<li>[x ]')).not.toBe(-1)
  })

  it('does NOT render[x ] as checkboxes', () => {
    expect(fixtures.dirty.html.indexOf('<li>[ x]')).not.toBe(-1)
  })

  it('does NOT render [ x ] as checkboxes', () => {
    expect(fixtures.dirty.html.indexOf('<li>[ x ]')).not.toBe(-1)
  })

  it('adds class .task-list-item to parent <li>', () => {
    expect(fixtures.bullet.parsedDocument.querySelectorAll('li.task-list-item').length).toBeGreaterThan(0)
  })

  it('adds class .contains-task-list to lists', () => {
    expect(
      fixtures.bullet.parsedDocument.querySelectorAll('ol.contains-task-list, ul.contains-task-list').length
    ).toBeGreaterThan(0)
  })

  it('only adds .contains-task-list to most immediate parent list', () => {
    expect(
      fixtures.mixedNested.parsedDocument.querySelectorAll('ol:not(.contains-task-list) ul.contains-task-list').length
    ).toBeGreaterThan(0)
  })

  describe('when options.lineNumber is unset', () => {
    it.each(caseNames)("%s: doesn't generate data-line attributes", (name, fixture) => {
      expect(fixture.parsedDocument.querySelectorAll('input.task-list-item-checkbox[data-line]')).toHaveLength(0)
    })
  })

  describe('when options.lineNumber is false', () => {
    const noLineNumberParser = new MarkdownIt().use(taskLists, { lineNumber: false })
    it.each(caseNames)("%s: doesn't generate data-line attributes", (name, fixture) => {
      const dom = domParser.parseFromString(noLineNumberParser.render(fixture.markdown), 'text/html')
      expect(dom.querySelectorAll('input.task-list-item-checkbox[data-line]')).toHaveLength(0)
    })
  })

  describe('when options.lineNumber is true', () => {
    const lineNumberParser = new MarkdownIt().use(taskLists, { lineNumber: true })

    it.each(caseNames)('%s: does generate data-line attributes', (name, fixture) => {
      const dom = domParser.parseFromString(lineNumberParser.render(fixture.markdown), 'text/html')
      expect(dom.querySelectorAll('input.task-list-item-checkbox[data-line]').length).toBeGreaterThan(0)
    })

    it.each(caseNames)("%s: doesn't generate checkboxes without data-line attributes", (name, fixture) => {
      const dom = domParser.parseFromString(lineNumberParser.render(fixture.markdown), 'text/html')
      expect(dom.querySelectorAll('input.task-list-item-checkbox:not([data-line])')).toHaveLength(0)
    })

    describe.each(caseNames)('%s the number in the data-line attribute', (name, fixture) => {
      const dom = domParser.parseFromString(lineNumberParser.render(fixture.markdown), 'text/html')
      const extracted: Array<[number, string]> = Array.from(dom.querySelectorAll('input.task-list-item-checkbox')).map(
        (element) => {
          const lineNumber = Optional.ofNullable((element as HTMLElement).dataset.line)
            .map((line) => Number.parseInt(line))
            .orElseThrow(() => new Error('No line in dataset found'))
          const textAfter = Optional.ofNullable((element as HTMLElement).nextSibling?.textContent?.trim()).orElseThrow(
            () => new Error('No text after found')
          )
          return [lineNumber, textAfter]
        }
      )
      const documentLines = fixture.markdown.split('\n')

      it.each(extracted)(
        `${name}.md:%d: references the correct line in the markdown document`,
        (lineNumber: number, textAfter: string | undefined) => {
          const line = documentLines[lineNumber].split(']')[1].trim()
          expect(textAfter).toEqual(line)
        }
      )
    })
  })
})
