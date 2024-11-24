'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { FileText } from 'lucide-react'
import { BIO_TEMPLATE } from '@/lib/constants/bioTemplate'

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
  const [isLoading, setIsLoading] = useState(false)

  const fillTemplate = () => {
    setBio(BIO_TEMPLATE)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMatches([])
    setSummary('')

    if (!bio.trim()) {
      setError('Please enter your bio')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: bio.trim(),
          matchingContext: matchingContext.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      setMatches(data.matches || [])
      setSummary(data.summary || '')
    } catch (error) {
      console.error('Submission Error:', error)
      setError('An error occurred while fetching matches. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // rendering
  return (
    <div className='container mx-auto p-4 max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle className='text-3xl'>SPC Member Matcher</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-xl font-semibold text-primary'>
                  Who are you?
                </h3>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={fillTemplate}
                  className='flex items-center gap-2 text-muted-foreground'
                >
                  <FileText className='h-4 w-4' />
                  Use Template
                </Button>
              </div>

              <Textarea
                placeholder='Enter your bio here...'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className='min-h-[400px]'
              />
            </div>

            <div className='space-y-4 mt-8'>
              <h3 className='text-xl font-semibold text-primary'>
                What are you looking for?
              </h3>
              <Textarea
                placeholder='types of connections, areas of advice, potential cofounders, etc.'
                value={matchingContext}
                onChange={(e) => setMatchingContext(e.target.value)}
                className='min-h-[100px]'
              />
              <Button type='submit' disabled={isLoading} className='w-full'>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Finding your matches...
                  </>
                ) : (
                  'Find Matches'
                )}
              </Button>
            </div>

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
      <span className='text-sm text-muted-foreground mt-4 block w-full text-center'>
        -1 to 0 ... together :)
      </span>
    </div>
  )
}
