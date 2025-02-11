import '../../../../__mocks__/useBreakpoint.mock'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SubLessonPage, {
  getStaticPaths,
  getStaticProps
} from '../../../../pages/curriculum/[lessonSlug]/[subLessonSlug]'
import {
  dummyParsedSubLessonMdx,
  dummySubLessonFileContent
} from '../../../../__dummy__/mdx'
import { useRouter } from 'next/router' // Auto mocked
import { getLayout } from '../../../../components/LessonLayout'
import { initializeApollo } from '../../../../helpers/apolloClient'
jest.mock('../../../../helpers/apolloClient')
import Title from '../../../../components/Title'
jest.mock('../../../../components/Title', () => {
  return jest.fn(() => null)
})
import {
  getSubLessonSlugs,
  getSubLessonContent,
  getSubLessonGithubFilePath
} from '../../../../helpers/static/lessons'
import { parseMDX } from '../../../../helpers/static/parseMDX'
jest.mock('../../../../helpers/static/parseMDX')
import dummyLessonsData from '../../../../__dummy__/lessonData'
jest.mock('../../../../helpers/static/lessons')

describe('[subLessonSlug]', () => {
  const mockSlugs = [
    { lessonSlug: 'js0', subLessonSlug: 'first_sub_lesson' },
    { lessonSlug: 'js0', subLessonSlug: 'second_sub_lesson' },
    { lessonSlug: 'js0', subLessonSlug: 'third_sub_lesson' }
  ]
  const fakeGithubPath = 'some/fake/path'

  const dummyOneFrontMatterOnly = {
    frontMatter: dummyParsedSubLessonMdx[1].frontMatter
  }
  const dummyTwoFrontMatterOnly = {
    frontMatter: dummyParsedSubLessonMdx[2].frontMatter
  }
  const { challenges, ...dummyLessonNoChallenges } = dummyLessonsData[0] // Lesson with slug 'js0'
  const props = {
    lesson: dummyLessonNoChallenges,
    lessonSlug: mockSlugs[0].lessonSlug,

    selectedSubLessonIndex: 0,
    subLessonSlug: mockSlugs[0].subLessonSlug,
    subLessons: [
      {
        ...dummyParsedSubLessonMdx[0],
        subLessonSlug: mockSlugs[0].subLessonSlug
      },
      {
        ...dummyOneFrontMatterOnly,
        subLessonSlug: mockSlugs[1].subLessonSlug
      },
      {
        ...dummyTwoFrontMatterOnly,
        subLessonSlug: mockSlugs[2].subLessonSlug
      }
    ],

    githubFilePath: fakeGithubPath
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getStaticPaths', () => {
    test('should return paths w/ fallback false', () => {
      getSubLessonSlugs.mockResolvedValue(mockSlugs)

      expect(getStaticPaths()).resolves.toEqual({
        paths: [
          { params: mockSlugs[0] },
          { params: mockSlugs[1] },
          { params: mockSlugs[2] }
        ],
        fallback: false
      })
    })

    test('should throw if invalid slug names are retrieved', () => {
      getSubLessonSlugs.mockResolvedValue([
        { old_slug_name: 'js0', another_bad_name: 'first_sub_lesson' }
      ])
      expect(getStaticPaths()).rejects.toThrowError()
    })
  })

  describe('getStaticProps', () => {
    test('should throw when called with no slug', () => {
      expect(getStaticProps({ params: {} })).rejects.toThrowError(
        /Missing Slug/
      )
    })

    test('should throw if it can not find matching lesson', () => {
      const mockQuery = jest.fn().mockResolvedValue({ data: { lessons: [] } })
      initializeApollo.mockReturnValue({ query: mockQuery })
      expect(
        getStaticProps({
          params: { lessonSlug: 'js100', subLessonSlug: 'no_way' }
        })
      ).rejects.toThrowError(/Could not find lesson/)
    })

    test('should return correct props', () => {
      const mockQuery = jest
        .fn()
        .mockResolvedValue({ data: { lessons: dummyLessonsData } })
      initializeApollo.mockReturnValue({ query: mockQuery })
      getSubLessonGithubFilePath.mockReturnValue(fakeGithubPath)
      getSubLessonSlugs.mockResolvedValueOnce(mockSlugs)
      getSubLessonContent
        .mockResolvedValueOnce(dummySubLessonFileContent[0])
        .mockResolvedValueOnce(dummySubLessonFileContent[1])
        .mockResolvedValueOnce(dummySubLessonFileContent[2])

      parseMDX
        .mockResolvedValueOnce(dummyParsedSubLessonMdx[0])
        .mockResolvedValueOnce(dummyOneFrontMatterOnly)
        .mockResolvedValueOnce(dummyTwoFrontMatterOnly)

      expect(getStaticProps({ params: mockSlugs[0] })).resolves.toEqual({
        props,
        revalidate: 300 // Five Minutes
      })
    })
  })

  describe('Page', () => {
    test('Should have static method getLayout from LessonLayout component', async () => {
      expect(SubLessonPage.getLayout).toBe(getLayout)
    })

    test('should have correct title', () => {
      render(<SubLessonPage {...props} />)

      expect(Title).toHaveBeenCalledWith(
        {
          title: expect.stringContaining('first sub lesson')
        },
        {}
      )
    })

    test('should render SubLessonLinks component with correct subLesson titles', () => {
      render(<SubLessonPage {...props} />)

      expect(
        screen.getByRole('link', { name: 'Part 1: first sub lesson' })
      ).toBeVisible()
      expect(
        screen.getByRole('link', { name: 'Part 2: second sub lesson' })
      ).toBeVisible()
      expect(
        screen.getByRole('link', { name: 'Part 3: third sub lesson' })
      ).toBeVisible()
    })
    test('should render next lesson link', () => {
      render(<SubLessonPage {...props} />)

      expect(
        screen.getByRole('link', { name: 'Next part: second sub lesson' })
      ).toBeVisible()
    })

    test('should render EditPage component with link to docFilePath', () => {
      render(<SubLessonPage {...props} />)
      expect(
        screen.getByRole('link', { name: /edit this page/i })
      ).toHaveAttribute('href', expect.stringContaining(fakeGithubPath))
    })

    test('should match screenshot', async () => {
      const { container } = render(<SubLessonPage {...props} />)

      expect(container).toMatchSnapshot()
    })
  })
})
