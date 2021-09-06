import { gql } from '@apollo/client'

const GET_SUB_LESSONS = gql`
  query getSubLessons($filterSlug: String, $subLessonSource: String) {
    lessons(filterSlug: $filterSlug, subLessonSource: $subLessonSource) {
      id
      title
      slug
      description
      docUrl
      githubUrl
      videoUrl
      order
      subLessons {
        subLessonSlug
        title
        order
        contentURL
        compiledSource
      }
      challenges {
        id
        description
        title
        order
      }
      chatUrl
    }
  }
`

export default GET_SUB_LESSONS
