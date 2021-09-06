import { Context } from '../../@types/helpers'
import type {
  CreateLessonMutation,
  CreateLessonMutationVariables,
  UpdateLessonMutation,
  UpdateLessonMutationVariables
} from '../../graphql'
import { lessons } from '../../graphql/queryResolvers/lessons'
import prisma from '../../prisma'
import { isAdminOrThrow } from '../isAdmin'
import { validateLessonId } from '../validation/validateLessonId'

export const createLesson = async (
  _parent: void,
  arg: CreateLessonMutationVariables,
  { req }: Context
): Promise<CreateLessonMutation['createLesson']> => {
  isAdminOrThrow(req)
  await prisma.lesson.create({ data: arg })
  // TODO: remove extra database hit and return just the created lesson
  return lessons(null, {})
}

export const updateLesson = async (
  _parent: void,
  arg: UpdateLessonMutationVariables,
  { req }: Context
): Promise<UpdateLessonMutation['updateLesson']> => {
  isAdminOrThrow(req)
  const { id, ...data } = arg
  await validateLessonId(id)
  await prisma.lesson.update({ where: { id }, data })
  // TODO: remove extra database hit and return just the updated lesson
  return lessons(null, {})
}
