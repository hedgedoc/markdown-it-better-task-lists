/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: ISC
 */

import { readFileSync } from 'fs'
import { JSDOM } from 'jsdom'
import MarkdownIt from 'markdown-it/lib'
import taskLists from '../../index'

enum FixtureFiles {
  bullet = 'bullet.md',
  ordered = 'ordered.md',
  mixedNested = 'mixed-nested.md',
  dirty = 'dirty.md'
}

export interface Fixture {
  markdown: string
  html: string
  parsedDocument: Document
}

export type Fixtures = Record<keyof typeof FixtureFiles, Fixture>
const DOMParser = new JSDOM().window.DOMParser

/**
 * Loads all fixtures
 *
 * @return All fixture files
 */
export function loadFixtures(): Fixtures {
  return {
    bullet: loadFixture(FixtureFiles.bullet),
    ordered: loadFixture(FixtureFiles.ordered),
    mixedNested: loadFixture(FixtureFiles.mixedNested),
    dirty: loadFixture(FixtureFiles.dirty)
  }
}

/**
 * Loads a fixture file
 *
 * @param fileName The name of the fixture file
 * @return the loaded fixture
 */
export function loadFixture(fileName: FixtureFiles): Fixture {
  const mdParser = new MarkdownIt().use(taskLists)
  const domParser = new DOMParser()
  const path = __dirname + '/' + fileName
  const file = readFileSync(path)
  const mdText = file.toString()
  const renderedHtml = mdParser.render(mdText)

  return {
    markdown: mdText,
    html: renderedHtml,
    parsedDocument: domParser.parseFromString(renderedHtml, 'text/html')
  }
}
