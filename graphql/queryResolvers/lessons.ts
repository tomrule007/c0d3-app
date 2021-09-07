import {
  getSubLessonContent,
  getSubLessonGithubFilePath,
  getSubLessonSlugs
} from '../../helpers/static/lessons'
import { parseMDX } from '../../helpers/static/parseMDX'
import prisma from '../../prisma'
import path from 'path'
import fs from 'fs'
type Filter = {
  filterSlug?: string
  subLessonSource?: string
}

// TESTING WHAT FILES ARE INCLUDED IN SERVERLESS FUNCTIONS
async function* walk(dir: string): any {
  for await (const d of await fs.promises.opendir(dir)) {
    if (d.name === 'node_modules' || d.name === '.git' || d.name === '.next')
      continue
    const entry = path.join(dir, d.name)
    if (d.isDirectory()) yield* walk(entry)
    else if (d.isFile()) yield entry
  }
}

const getSubLessonResolver =
  (lessonSlug: string, subLessonSource?: string) => async () => {
    for await (const p of walk(process.cwd())) console.warn(p)

    const subLessonSlugs = await getSubLessonSlugs(lessonSlug)

    return (
      await Promise.all(
        subLessonSlugs.map(async ({ subLessonSlug }) => {
          const subLessonContent = await getSubLessonContent({
            lessonSlug,
            subLessonSlug
          })
          const { source, frontMatter } = await parseMDX(
            subLessonContent,
            subLessonSource !== subLessonSlug
          )
          return {
            subLessonSlug,
            title: frontMatter.title,
            order: frontMatter.order,
            compiledSource: source && source.compiledSource,
            contentURL: getSubLessonGithubFilePath({
              lessonSlug,
              subLessonSlug
            })
          }
        })
      )
    ).sort((a, b) => a.order - b.order)
  }

export const lessons = async (_parent: any, args: Filter) => {
  const { filterSlug, subLessonSource } = args

  if (filterSlug) {
    const databaseLesson = await prisma.lesson.findUnique({
      where: { slug: filterSlug },
      include: { challenges: { orderBy: { order: 'asc' } } }
    })

    if (!databaseLesson) return []

    return [
      {
        ...databaseLesson,
        subLessons: getSubLessonResolver(databaseLesson.slug, subLessonSource)
      }
    ]
  }

  const databaseLessons = await prisma.lesson.findMany({
    include: { challenges: { orderBy: { order: 'asc' } } },
    orderBy: {
      order: 'asc'
    }
  })

  return databaseLessons.map(lesson => ({
    ...lesson,
    subLessons: getSubLessonResolver(lesson.slug, subLessonSource)
  }))
}
