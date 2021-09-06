import styles from '../scss/SubLessonLinks.module.scss'
import React from 'react'
import Link from 'next/link'
import { SubLesson } from '../graphql'

type Slugs = {
  lessonSlug: string
  subLessonSlug: string
}
type Props = {
  subLessons: SubLesson[]
} & Slugs
const SubLessonLinks: React.FC<Props> = ({
  subLessons,
  lessonSlug,
  subLessonSlug
}) => (
  <nav aria-label="Sub-lesson Links">
    {subLessons.map(subLesson => {
      const isSelected = subLesson.subLessonSlug === subLessonSlug
      return (
        <Link
          key={subLesson.subLessonSlug}
          href={`/curriculum/${lessonSlug}/${subLesson.subLessonSlug}`}
        >
          <a
            className={`${styles['subtitle']} ${
              isSelected ? `text-dark dark` : 'text-muted'
            } d-block`}
            aria-current={isSelected ? 'page' : undefined}
          >
            {`Part ${subLesson.order}: ${subLesson.title}`}
          </a>
        </Link>
      )
    })}
  </nav>
)

export default SubLessonLinks
