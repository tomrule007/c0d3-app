import { getSubLessonSlugs } from '../../helpers/static/lessons'
import prisma from '../../prisma'

type Filter = {
  filterSlug?: string
}

export const lessons = async (_: void, args: Filter) => {
  const { filterSlug } = args

  if (filterSlug) {
    const databaseLesson = await prisma.lesson.findUnique({
      where: { slug: filterSlug },
      include: { challenges: { orderBy: { order: 'asc' } } }
    })

    if (!databaseLesson) return []

    return [
      {
        ...databaseLesson,
        subLessons: async () => getSubLessonSlugs(databaseLesson.slug)
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
    subLessons: async () => getSubLessonSlugs(lesson.slug)
  }))
}
