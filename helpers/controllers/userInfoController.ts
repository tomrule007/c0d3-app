import type { Star } from '.prisma/client'
import { UserInfoQueryVariables } from '../../graphql'
import { Context } from '../../@types/helpers'
import prisma from '../../prisma'
import { getUserInfoFromRefreshToken } from '../../helpers/discordAuth'

type StarMap = {
  [lessonId: number]: Star[]
}

export const userInfo = async (
  _parent: void,
  { username }: UserInfoQueryVariables,
  { req }: Context
) => {
  if (!username) {
    throw new Error('Invalid username')
  }
  const user = await prisma.user.findFirst({
    where: {
      username
    }
  })

  if (!user) {
    throw new Error('Invalid user object')
  }

  let discordUserId = '',
    discordUsername = '',
    discordAvatarUrl = ''
  if (user.discordRefreshToken) {
    try {
      const { userId, username, avatarUrl } = await getUserInfoFromRefreshToken(
        user.id,
        user.discordRefreshToken
      )
      discordUserId = userId
      discordUsername = username
      discordAvatarUrl = avatarUrl
    } catch (error) {
      req.error(error)
    }
  }

  const [userLessons, submissions, stars] = await prisma.$transaction([
    prisma.userLesson.findMany({
      where: {
        userId: user.id
      }
    }),
    prisma.submission.findMany({
      where: {
        userId: user.id
      },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true
          }
        },
        comments: {
          include: {
            author: true
          }
        },
        user: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    }),
    prisma.star.findMany({
      where: {
        mentorId: user.id
      },
      include: {
        student: {
          select: {
            username: true,
            name: true
          }
        },
        lesson: {
          select: {
            title: true,
            order: true
          }
        }
      }
    })
  ])

  const starMap = stars.reduce((map: StarMap, star) => {
    map[star.lessonId] = map[star.lessonId] || []
    map[star.lessonId].push(star)
    return map
  }, {})

  const lessonStatus = userLessons.map(userLesson => ({
    ...userLesson,
    starsReceived: starMap[userLesson.lessonId] || []
  }))

  return {
    user: { ...user, discordUserId, discordUsername, discordAvatarUrl },
    lessonStatus,
    submissions
  }
}
