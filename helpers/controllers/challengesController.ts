import { Context } from '../../@types/helpers'
import type {
  CreateChallengeMutationVariables,
  UpdateChallengeMutationVariables
} from '../../graphql'
import { lessons } from '../../graphql/queryResolvers/lessons'
import prisma from '../../prisma'
import { isAdminOrThrow } from '../isAdmin'
import { validateLessonId } from '../validation/validateLessonId'

export const createChallenge = async (
  _parent: void,
  arg: CreateChallengeMutationVariables,
  ctx: Context
) => {
  const { req } = ctx
  try {
    isAdminOrThrow(req)
    await validateLessonId(arg.lessonId)
    await prisma.challenge.create({ data: arg })
    // TODO: Remove extra database hit and just return the created challenge
    return lessons(null, {})
  } catch (err) {
    throw new Error(err)
  }
}

export const updateChallenge = async (
  _parent: void,
  arg: UpdateChallengeMutationVariables,
  ctx: Context
) => {
  const { req } = ctx
  try {
    isAdminOrThrow(req)
    const { id, lessonId, ...data } = arg
    await validateLessonId(lessonId)
    await prisma.challenge.update({
      where: { id },
      data
    })
    // TODO: Remove extra database hit and just return the updated challenge
    return lessons(null, {})
  } catch (err) {
    throw new Error(err)
  }
}
