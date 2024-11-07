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

// Mock function to simulate API call
const mockApiCall = async (bio: string) => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock response
  return `
<matches>
<match1>
<name>Kat Tan</name>
<reason>NYC-based, shares interest in mental health and community building. Background in Instagram and focus on mental health tech aligns with interests in personal productivity and ADHD management.</reason>
</match1>
<match2>
<name>Eddie Jiao</name>
<reason>Strong alignment in interests around novel interfaces and human-computer interaction. Focus on AI interfaces for cognition augmentation complements work on personal productivity tools.</reason>
</match2>
<match3>
<name>Jon Chan</name>
<reason>NYC-based with experience in AI and community building through Stack Overflow. Shares interest in culture and community aspects of technology.</reason>
</match3>
</matches>
<summary>
These matches combine technical expertise in AI/ML with a shared focus on human-centered technology and community building. All three recommended matches are either based in NYC or have strong connections there, facilitating in-person collaboration.
</summary>`
}

// Function to parse XML string
const parseXml = (xmlString: string) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  return xmlDoc
}

export default function PeopleMatcher() {
  const [bio, setBio] = useState('')
  const [matches, setMatches] = useState<{ name: string; reason: string }[]>([])
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const response = await mockApiCall(bio)
      const xmlDoc = parseXml(response)

      const matchesData = Array.from(
        xmlDoc.getElementsByTagName('match1'),
        (match, index) => ({
          name:
            xmlDoc
              .getElementsByTagName(`match${index + 1}`)[0]
              .getElementsByTagName('name')[0].textContent || '',
          reason:
            xmlDoc
              .getElementsByTagName(`match${index + 1}`)[0]
              .getElementsByTagName('reason')[0].textContent || '',
        })
      )
      setMatches(matchesData)

      const summaryText =
        xmlDoc.getElementsByTagName('summary')[0].textContent || ''
      setSummary(summaryText)
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while fetching matches. Please try again.')
      setMatches([])
      setSummary('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container mx-auto p-4 max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle>People Matcher</CardTitle>
          <CardDescription>
            Enter your bio to find matching community members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder='Enter your bio here...'
              className='w-full h-32'
            />
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Matching...' : 'Find Matches'}
            </Button>
          </form>

          {error && (
            <div className='mt-4 p-4 bg-red-100 text-red-700 rounded-md'>
              {error}
            </div>
          )}

          {matches.length > 0 && (
            <div className='mt-8'>
              <h2 className='text-xl font-semibold mb-4'>Matches</h2>
              {matches.map((match, index) => (
                <Card key={index} className='mb-4'>
                  <CardHeader>
                    <CardTitle>{match.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{match.reason}</p>
                  </CardContent>
                </Card>
              ))}
              {summary && (
                <Card className='mt-6'>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{summary}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
