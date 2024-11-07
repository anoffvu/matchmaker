'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCompletion } from 'ai/react'

interface Match {
  name: string
  reason: string
}

export default function Home() {
  const [bio, setBio] = useState('')
  const [matchingContext, setMatchingContext] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [summary, setSummary] = useState('')

  const { completion, isLoading, complete } = useCompletion({
    api: '/api/matches',
    onFinish: (completion) => {
      try {
        console.log('Raw completion:', completion)

        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(completion, 'text/xml')

        const matchesData = Array.from({ length: 3 }, (_, i) => {
          const matchNum = i + 1
          const matchElement = xmlDoc.querySelector(`match${matchNum}`)
          const name = matchElement?.querySelector('name')?.textContent || ''
          const reason =
            matchElement?.querySelector('reason')?.textContent || ''

          console.log(`Match ${matchNum}:`, { name, reason })

          return { name, reason }
        }).filter((match) => match.name !== '')

        setMatches(matchesData)

        const summaryText =
          xmlDoc.querySelector('summary')?.textContent?.trim() || ''
        setSummary(summaryText)
      } catch (error) {
        console.error('Error parsing XML:', error)
        setError('Error parsing the response. Please try again.')
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMatches([])
    setSummary('')

    try {
      await complete(JSON.stringify({ bio, matchingContext }))
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while fetching matches. Please try again.')
    }
  }

  return (
    <div className='container mx-auto p-4 max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle>SPC Member Matcher</CardTitle>
          <CardDescription>
            Enter your bio to find matching community members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Textarea
              placeholder='Enter bio here...'
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className='min-h-[200px]'
            />
            <Textarea
              placeholder='Enter specific matching criteria (optional)...'
              value={matchingContext}
              onChange={(e) => setMatchingContext(e.target.value)}
              className='min-h-[100px]'
            />
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Generating matches...' : 'Find Matches'}
            </Button>

            {error && <div className='text-red-500'>{error}</div>}

            {matches.length > 0 && (
              <div className='space-y-4 mt-6'>
                <h3 className='text-lg font-semibold'>Your Matches</h3>
                {matches.map((match, index) => (
                  <Card key={index}>
                    <CardContent className='pt-4'>
                      <h4 className='font-semibold text-primary'>
                        {match.name}
                      </h4>
                      <p className='text-sm text-muted-foreground mt-2'>
                        {match.reason}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {summary && (
                  <div className='mt-4'>
                    <h3 className='text-lg font-semibold mb-2'>Summary</h3>
                    <p className='text-sm text-muted-foreground'>{summary}</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
