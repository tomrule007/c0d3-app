import React, { useState } from 'react'
import { AdminLessonInfo } from '../../components/admin/lessons/AdminLessonInfo'
import { AdminLessonsSideBar } from '../../components/admin/lessons/AdminLessonsSideBar'
import { withGetApp, GetAppProps } from '../../graphql'
import { Lesson } from '../../graphql/index'
import { AdminLayout } from '../../components/admin/AdminLayout'

type LessonWithoutSubLesson = Omit<Lesson, 'subLessons'>

const Lessons: React.FC<GetAppProps> = ({ data }) => {
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [lessonsList, setLessons] = useState<null | LessonWithoutSubLesson[]>(
    null
  )
  const { lessons } = data
  return (
    <AdminLayout data={data} title="Admin lessons">
      <div className="row mt-4">
        <AdminLessonsSideBar
          setLessons={setLessons}
          selectedLesson={selectedLesson}
          lessons={lessonsList! || lessons}
          setSelectedLesson={setSelectedLesson}
        />
        <AdminLessonInfo
          setLessons={setLessons}
          lessons={lessonsList! || lessons}
          selectedLesson={selectedLesson}
        />
      </div>
    </AdminLayout>
  )
}

export default withGetApp()(Lessons)
