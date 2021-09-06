import { withSentry } from '@sentry/nextjs'
import { lessons } from '../../graphql/queryResolvers/lessons'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    const allLessons = await lessons(null, {})
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json(allLessons)
  } catch (err) {
    res.status(500).json('Error occured 😮')
  }
}

export default withSentry(handler)
