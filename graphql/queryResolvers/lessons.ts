import {
  getSubLessonContent,
  getSubLessonGithubFilePath,
  getSubLessonSlugs
} from '../../helpers/static/lessons'
import { parseMDX } from '../../helpers/static/parseMDX'
import prisma from '../../prisma'

type Filter = {
  filterSlug?: string
  subLessonSource?: string
}

const getSubLessonResolver =
  (lessonSlug: string, subLessonSource?: string) => async () => {
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
