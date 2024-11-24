'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { FileText } from 'lucide-react'
import { BIO_TEMPLATE } from '@/lib/constants/bioTemplate'
import { cn } from '@/lib/utils'
import { AvatarCircle } from '@/components/ui/avatar-circle'

interface Match {
  name: string
  reason: string
}

// New interface for structured bio sections
interface BioSection {
  question: string
  answer: string
  placeholder: string
}

export default function Home() {
  const [bio, setBio] = useState('')
  const [matchingContext, setMatchingContext] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [bioSections, setBioSections] = useState<BioSection[]>([])
  const [isTemplateMode, setIsTemplateMode] = useState(false)

  // Transform template sections into structured format
  const fillTemplate = () => {
    setIsTemplateMode(true)
    setBioSections([
      {
        question: "What's your background?",
        answer: '',
        placeholder:
          'E.g., Education, past work experience, key achievements...',
      },
      {
        question: 'What are you working on now?',
        answer: '',
        placeholder: 'Current projects, business ideas, or areas of focus...',
      },
      {
        question: 'What are your goals?',
        answer: '',
        placeholder:
          'Short-term and long-term aspirations, what you want to achieve...',
      },
      {
        question: 'What are your interests?',
        answer: '',
        placeholder:
          "Professional interests, hobbies, areas you're passionate about...",
      },
      {
        question: 'What skills can you offer?',
        answer: '',
        placeholder:
          'Technical skills, soft skills, expertise you can share...',
      },
    ])
  }

  // Combine all sections into one bio for submission
  const compileBio = () => {
    return bioSections
      .map((section) => `${section.question}\n${section.answer}\n`)
      .join('\n')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMatches([])
    setSummary('')

    // Use either the structured sections or the single bio
    const bioText = isTemplateMode ? compileBio() : bio

    if (!bioText.trim()) {
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
          bio: bioText.trim(),
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
    <div className='min-h-screen bg-[#121212] text-white'>
      <div className='container mx-auto p-4 max-w-3xl'>
        <Card className='bg-[#1A1A1A] border-[#2A2A2A] shadow-xl'>
          <CardHeader className='border-b border-[#2A2A2A]'>
            <CardTitle className='text-2xl font-medium bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
              SPC Member Matcher
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-lg font-medium text-white/90'>
                    Who are you?
                  </h3>
                  {!isTemplateMode && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={fillTemplate}
                      className='bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#303030] text-white/80 hover:text-white transition-colors'
                    >
                      <FileText className='h-4 w-4 mr-2' />
                      Use Template
                    </Button>
                  )}
                </div>

                {isTemplateMode ? (
                  <div className='space-y-6'>
                    {bioSections.map((section, index) => (
                      <div key={index} className='space-y-2'>
                        <label className='text-sm font-medium text-white/80'>
                          {section.question}
                        </label>
                        <Textarea
                          placeholder={section.placeholder}
                          value={section.answer}
                          onChange={(e) => {
                            const newSections = [...bioSections]
                            newSections[index].answer = e.target.value
                            setBioSections(newSections)
                          }}
                          className={cn(
                            'min-h-[100px] bg-[#232323] border-[#2A2A2A]',
                            'focus:border-[#3A3A3A] focus:ring-1 focus:ring-[#3A3A3A]',
                            'placeholder:text-white/20 text-white/90'
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setIsTemplateMode(false)
                        setBioSections([])
                      }}
                      className='text-white/50 hover:text-white hover:bg-white/5'
                    >
                      Switch to free-form mode
                    </Button>
                  </div>
                ) : (
                  <Textarea
                    placeholder='Enter your bio here...'
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className={cn(
                      'min-h-[400px] bg-[#232323] border-[#2A2A2A]',
                      'focus:border-[#3A3A3A] focus:ring-1 focus:ring-[#3A3A3A]',
                      'placeholder:text-white/20 text-white/90'
                    )}
                  />
                )}
              </div>

              <div className='space-y-4 pt-4 border-t border-[#2A2A2A]'>
                <h3 className='text-lg font-medium text-white/90'>
                  What are you looking for?
                </h3>
                <Textarea
                  placeholder='types of connections, areas of advice, potential cofounders, etc.'
                  value={matchingContext}
                  onChange={(e) => setMatchingContext(e.target.value)}
                  className={cn(
                    'min-h-[100px] bg-[#232323] border-[#2A2A2A]',
                    'focus:border-[#3A3A3A] focus:ring-1 focus:ring-[#3A3A3A]',
                    'placeholder:text-white/20 text-white/90'
                  )}
                />
                <Button
                  type='submit'
                  disabled={isLoading}
                  className={cn(
                    'w-full bg-white/10 hover:bg-white/15',
                    'text-white border border-white/10',
                    'transition-colors duration-200'
                  )}
                >
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

              {error && (
                <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-center p-3 rounded'>
                  <h4 className='font-medium'>Oops! Something went wrong.</h4>
                  <p className='text-sm opacity-90'>{error}</p>
                </div>
              )}

              {matches.length > 0 && (
                <div className='space-y-4 mt-6'>
                  <h3 className='text-xl pt-4 font-medium text-white/90'>
                    Your Matches
                  </h3>
                  {matches.map((match, index) => (
                    <Card key={index} className='bg-[#232323] border-[#2A2A2A]'>
                      <CardContent className='px-6 py-6 pt-4'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-4 pb-2'>
                            <AvatarCircle name={match.name} size={40} />
                            <h4 className='font-medium text-white/90'>
                              {match.name}
                            </h4>
                          </div>
                          <p className='text-sm text-white/60'>
                            {match.reason}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {summary && (
                    <div className='mt-6 p-4 rounded-lg'>
                      <h3 className='text-lg font-medium text-white/90 mb-2'>
                        Matching Summary
                      </h3>
                      <p className='text-sm text-white/60'>{summary}</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        <span className='text-sm text-white/40 mt-6 mb-6 block w-full text-center'>
          -1 to 0 ... together :)
        </span>
      </div>
    </div>
  )
}
