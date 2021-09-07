import React from 'react'
import { MDXRemote } from 'next-mdx-remote'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { getLayout } from '../../../components/LessonLayout'
import { WithLayout } from '../../../@types/page'
import {
  GetSubLessonsDocument,
  GetSubLessonsQuery,
  SubLesson
} from '../../../graphql'

import { initializeApollo } from '../../../helpers/apolloClient'

import NextPreviousLessons from '../../../components/NextPreviousLessons'
import SubLessonLinks from '../../../components/SubLessonLinks'
import EditPage from '../../../components/EditPage'
import MDXcomponents from '../../../helpers/mdxComponents'

import styles from '../../../scss/mdx.module.scss'
import ScrollTopArrow from '../../../components/ScrollTopArrow'
import Title from '../../../components/Title'

interface Props {
  selectedSubLessonIndex: number
  lessonSlug: string
  subLessonSlug: string
  lesson: Omit<GetSubLessonsQuery['lessons'], 'challenges' | 'subLessons'>
  subLessons: SubLesson[]
  githubFilePath: string
}
const SubLessonPage: React.FC<Props> & WithLayout = ({
  lessonSlug,
  subLessonSlug,
  selectedSubLessonIndex,
  subLessons,
  githubFilePath
}) => {
  const selectedSubLesson = subLessons[selectedSubLessonIndex]

  const hasMultipleSubLessons = subLessons.length > 1
  return (
    <div
      className={`${styles['lesson-wrapper']} card shadow-sm mt-3 d-block border-0 p-3 p-md-4 bg-white`}
    >
      <Title title={`${selectedSubLesson.title} | ${subLessonSlug} | C0D3`} />
      <ScrollTopArrow />
      {hasMultipleSubLessons && (
        <SubLessonLinks
          subLessons={subLessons}
          lessonSlug={lessonSlug}
          subLessonSlug={subLessonSlug}
        />
      )}

      <MDXRemote
        compiledSource={selectedSubLesson.compiledSource!}
        components={MDXcomponents}
      />

      {hasMultipleSubLessons && (
        <NextPreviousLessons
          subLessons={subLessons}
          subLessonSlug={subLessonSlug}
          lessonSlug={lessonSlug}
        />
      )}

      <EditPage filePath={githubFilePath} />
    </div>
  )
}

SubLessonPage.getLayout = getLayout
export default SubLessonPage

interface Slugs extends ParsedUrlQuery {
  lessonSlug: string
  subLessonSlug: string
}

export const getStaticPaths: GetStaticPaths = async () => {
  const apolloClient = initializeApollo()
  const query = await apolloClient.query<GetSubLessonsQuery>({
    query: GetSubLessonsDocument
  })

  // Maybe just throw graphQL error at this point, assuming no data means error is present?
  if (!query.data)
    throw Error(
      '[subLessonSlug] page getStaticPaths failed to return graphQL data'
    )

  const { lessons } = query.data

  const paths = lessons.flatMap(({ slug, subLessons }) => {
    return subLessons.map(({ subLessonSlug }) => {
      return {
        params: {
          lessonSlug: slug,
          subLessonSlug
        }
      }
    })
  })

  return {
    paths,
    fallback: false
  }
}

const FIVE_MINUTES = 5 * 60

export const getStaticProps: GetStaticProps<any, Slugs> = async context => {
  const { lessonSlug, subLessonSlug } = context.params!
  if (!lessonSlug || !subLessonSlug)
    throw new Error(
      `Missing Slug: "lessonSlug: ${lessonSlug}" "subLessonSlug: ${subLessonSlug}"`
    )

  const apolloClient = initializeApollo()
  const query = await apolloClient.query<GetSubLessonsQuery>({
    query: GetSubLessonsDocument,
    variables: { filterSlug: lessonSlug, subLessonSource: subLessonSlug }
  })

  // Maybe just throw graphQL error at this point, assuming no data means error is present?
  if (!query.data)
    throw Error(
      '[subLessonSlug] page getStaticProps failed to return graphQL data'
    )

  console.log('errors123', JSON.stringify(query.error || null))
  // TODO: Make type without challenge material, challenge page refetches it and is currently unused data
  const [lesson] = query.data.lessons
  if (!lesson)
    throw new Error(`Could not find lesson with lessonSlug ${lessonSlug}`)
  const { challenges, subLessons, ...justLessonMeta } = lesson

  const selectedSubLessonIndex = subLessons.findIndex(
    subLesson => subLesson.subLessonSlug === subLessonSlug
  )
  console.log(
    'noerrors123',
    lessonSlug,
    subLessonSlug,
    selectedSubLessonIndex,
    subLessons[selectedSubLessonIndex].title
  )
  return {
    props: {
      lessonSlug,
      subLessonSlug,
      selectedSubLessonIndex,
      lesson: justLessonMeta, // Consumed by LessonLayout
      subLessons
    },
    revalidate: FIVE_MINUTES
  }
}
