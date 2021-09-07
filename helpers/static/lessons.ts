import { promises as fs } from 'fs'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import path from 'path'

const LESSONS_GITHUB_PATH = 'content/lessons'
const LESSONS_PATH = path.join(process.cwd(), LESSONS_GITHUB_PATH)

export type SubLesson = {
  frontMatter: {
    title: string
    order: number
  }
  source?: MDXRemoteSerializeResult
  subLessonSlug: string
}

const isURIEncodedOrThrow = (errorPrefix: string, slug: string) => {
  if (slug !== encodeURI(slug))
    throw Error(`${errorPrefix}: "${slug}", must be URI encoded: `)
  return true
}

export const getSubLessonSlugs = async (lessonSlug: string) => {
  isURIEncodedOrThrow('Invalid lessonSlug', lessonSlug)

  const subLessonPath = path.join(LESSONS_PATH, lessonSlug, 'sublesson')
  console.log('subLessonPath', subLessonPath)

  // Some lessons dont have subLessons so we just return an empty array in the error case
  const fileNames = await fs.readdir(subLessonPath).catch(() => [])
  console.log('fileNames', fileNames)
  return fileNames.map(file => {
    const subLessonSlug = file.replace(/\.mdx$/, '')
    isURIEncodedOrThrow('Invalid subLesson filename', subLessonSlug)

    return {
      subLessonSlug
    }
  })
}

type Slugs = {
  lessonSlug: string
  subLessonSlug: string
}

export const getSubLessonGithubFilePath = ({
  lessonSlug,
  subLessonSlug
}: Slugs) =>
  `${LESSONS_GITHUB_PATH}/${lessonSlug}/sublesson/${subLessonSlug}.mdx`

export const getSubLessonContent = ({ lessonSlug, subLessonSlug }: Slugs) =>
  fs.readFile(
    path.join(LESSONS_PATH, lessonSlug, 'sublesson', `${subLessonSlug}.mdx`)
  )
