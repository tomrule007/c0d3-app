import React from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import Layout from '../../components/Layout'
import _ from 'lodash'
import { GetAppProps } from '../../graphql'
import Error, { StatusCode } from '../../components/Error'
import { useRouter } from 'next/router'
export const AdminLayout: React.FC<GetAppProps> = ({ data, children }) => {
  const router = useRouter()
  const { loading, error, session } = data

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <Error code={StatusCode.INTERNAL_SERVER_ERROR} />
  }

  if (!session) router.push('/login')

  const isAdmin = _.get(session, 'user.isAdmin', false)

  if (isAdmin !== 'true') {
    return (
      <Layout>
        <h1>You must be admin to access this page</h1>
      </Layout>
    )
  }

  return <Layout>{children}</Layout>
}
