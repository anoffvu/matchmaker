"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlignLeft, AlertCircle } from "lucide-react";
import { AvatarCircle } from "@/components/ui/avatar-circle";
import { cn } from "@/lib/utils";

interface Match {
  name: string;
  matchreason: string;
}

// New interface for structured bio sections
interface BioSection {
  question: string;
  answer: string;
  placeholder: string;
}

// Update the validation function to use character count
const MIN_BIO_LENGTH = 200; // About 3-4 sentences worth

const validateBioLength = (text: string): boolean => {
  return text.trim().length >= MIN_BIO_LENGTH;
};

// Add this new component for the skeleton card
const SkeletonMatchCard = ({ delay = 0 }: { delay?: number }) => (
  <div
    className={cn(
      "animate-in fade-in-0 slide-in-from-bottom-4 duration-2000",
      "bg-[#232323] border border-[#2A2A2A] rounded-xl p-6"
    )}
    style={{
      opacity: 0,
      animation: `slideIn 2000ms ${delay}ms forwards`,
    }}
  >
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
        <div className="h-3 bg-white/5 rounded w-[90%] animate-pulse" />
        <div className="h-3 bg-white/5 rounded w-[75%] animate-pulse" />
      </div>
    </div>
  </div>
);

// Add this array at the top of your component
const loadingMessages = [
  "Finding your matches...",
  "Analyzing your goals...",
  "Finding common interests...",
  "Identifying potential collaborators...",
  "Matching expertise areas...",
  "Looking for complementary skills...",
  "Discovering shared passions...",
  "Finding ideal connections...",
];

// Add this function near your other validation functions
const isTemplateValid = (sections: BioSection[]): boolean => {
  // Check if at least the first section has content
  return sections[0]?.answer.trim().length > 0;
};

export default function Home() {
  const [bio, setBio] = useState("");
  const [userName, setUserName] = useState("");
  const [matchingContext, setMatchingContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bioSections, setBioSections] = useState<BioSection[]>([]);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [bioProgress, setBioProgress] = useState(0);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [currentView, setCurrentView] = useState<"questionnaire" | "matches">(
    "questionnaire"
  );

  // Add useEffect to cycle through messages more slowly
  useEffect(() => {
    if (!showSkeletons) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((current) =>
        current === loadingMessages.length - 1 ? 0 : current + 1
      );
    }, 6000); // Changed from 3000 to 6000 - now 6 seconds per message

    return () => clearInterval(interval);
  }, [showSkeletons]);

  // Add this function to calculate progress
  const calculateProgress = (text: string): number => {
    const length = text.trim().length;
    return Math.min((length / MIN_BIO_LENGTH) * 100, 100);
  };

  // Transform template sections into structured format
  const fillTemplate = () => {
    setIsTemplateMode(true);
    setBioSections([
      {
        question: "What's your background?",
        answer: "",
        placeholder:
          "E.g., Education, past work experience, key achievements...",
      },
      {
        question: "What are you working on now?",
        answer: "",
        placeholder: "Current projects, business ideas, or areas of focus...",
      },
      {
        question: "What are your goals?",
        answer: "",
        placeholder:
          "Short-term and long-term aspirations, what you want to achieve...",
      },
      {
        question: "What threads are you pulling on right now?",
        answer: "",
        placeholder: `Current curiosities, topics you're diving deep into, questions that keep you up at night...`,
      },
      {
        question: "What skills can you offer?",
        answer: "",
        placeholder:
          "Technical skills, soft skills, expertise you can share...",
      },
    ]);
  };

  // Combine all sections into one bio for submission
  const compileBio = () => {
    return bioSections
      .map((section) => `${section.question}\n${section.answer}\n`)
      .join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBioError(null);
    setMatches([]);
    setSummary("");
    setShowSkeletons(true);
    setCurrentView("matches");
    setUserName("");

    const bioText = isTemplateMode ? compileBio() : bio;

    setIsLoading(true);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          bio: bioText.trim(),
          matchingContext: matchingContext.trim(),
        }),
      });

      const data = await response.json();
      console.log("API Response:", data); // Add this for debugging

      setShowSkeletons(false);
      setIsLoading(false);

      // Enhanced error detection
      if (
        data.error ||
        (!data.matches?.length && !data.summary) ||
        (typeof data === "string" &&
          (data.toLowerCase().includes("apologize") ||
            data.toLowerCase().includes("could you provide")))
      ) {
        const errorMessage =
          data.error ||
          (typeof data === "string"
            ? data
            : "Please provide more specific details about your background and interests.");

        setError(errorMessage);
        return;
      }

      setMatches(data.matches || []);
      setSummary(data.summary || "");
    } catch (error) {
      console.error("Submission Error:", error);
      setError("Failed to find matches. Please try again.");
    } finally {
      setIsLoading(false);
      setShowSkeletons(false);
    }
  };

  // rendering
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto p-4 max-w-3xl pt-8">
        {currentView === "questionnaire" ? (
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-xl">
            <CardHeader className="border-b border-[#2A2A2A]">
              <CardTitle className="text-2xl font-medium bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                SPC Member Matcher
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white/90">
                      Who are you?
                    </h3>
                    {isTemplateMode ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsTemplateMode(false);
                          setBioSections([]);
                        }}
                        className="bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#303030] text-white/80 hover:text-white transition-colors"
                      >
                        <AlignLeft className="h-4 w-4 mr-2" />
                        Switch to Free-form
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fillTemplate}
                        className="bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#303030] text-white/80 hover:text-white transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      What is your name?
                    </label>
                    <Textarea
                      required
                      placeholder="John Smith"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                      }}
                      className={cn(
                        "min-h-[24px] bg-[#232323] border-[#2A2A2A]",
                        "focus:border-[#3A3A3A] focus:ring-1 focus:ring-[#3A3A3A]",
                        "placeholder:text-white/20 text-white/90"
                      )}
                    />
                  </div>

                  {isTemplateMode ? (
                    <div className="space-y-6">
                      {bioSections.map((section, index) => (
                        <div key={index} className="space-y-2">
                          <label className="text-sm font-medium text-white/80">
                            {section.question}
                          </label>
                          <Textarea
                            placeholder={section.placeholder}
                            value={section.answer}
                            onChange={(e) => {
                              const newSections = [...bioSections];
                              newSections[index].answer = e.target.value;
                              setBioSections(newSections);
                            }}
                            className={cn(
                              "min-h-[100px] bg-[#232323] border-[#2A2A2A]",
                              "focus:border-[#3A3A3A] focus:ring-1 focus:ring-[#3A3A3A]",
                              "placeholder:text-white/20 text-white/90"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        Tell us more about yourself
                      </label>
                      <Textarea
                        placeholder="Paste or type your bio here, or use the template mode above. Please write at least 200 characters about yourself (about 3-4 sentences)."
                        value={bio}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setBio(newText);
                          setBioProgress(calculateProgress(newText));
                          if (bioError) setBioError(null);
                        }}
                        className={cn(
                          "min-h-[400px] bg-[#232323] border-[#2A2A2A]",
                          "focus:border-[#3A3A3A] focus:ring-1 focus:ring-[#3A3A3A]",
                          "placeholder:text-white/20 text-white/90",
                          bioError ? "border-red-500/50" : ""
                        )}
                      />

                      {/* Progress indicator */}
                      <div
                        className={cn(
                          "transition-all duration-300",
                          bioProgress >= 100
                            ? "opacity-0 h-0"
                            : "opacity-100 h-auto"
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-300 rounded-full",
                                bioProgress < 50
                                  ? "bg-red-400/50"
                                  : bioProgress < 100
                                  ? "bg-yellow-400/50"
                                  : "bg-green-400/50"
                              )}
                              style={{ width: `${bioProgress}%` }}
                            />
                          </div>
                          <span className="min-w-[4rem] text-right">
                            {bio.trim().length}/{MIN_BIO_LENGTH} chars
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          {bioProgress < 100
                            ? "Please write a bit more about yourself..."
                            : "Perfect length! Ready to find matches."}
                        </p>
                      </div>

                      {bioError && (
                        <div className="text-red-400 text-sm">{bioError}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
                  <h3 className="text-lg font-medium text-white/90">
                    What are you looking for?
                  </h3>
                  <Textarea
                    placeholder="types of connections, areas of advice, potential cofounders, etc."
                    value={matchingContext}
                    onChange={(e) => setMatchingContext(e.target.value)}
                    className={cn(
                      "min-h-[100px] bg-[#232323] border-[#2A2A2A]",
                      "focus:border-[#3A3A3A] focus:ring-1 focus:ring-[#3A3A3A]",
                      "placeholder:text-white/20 text-white/90"
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !userName ||
                      (!isTemplateMode && !validateBioLength(bio)) ||
                      (isTemplateMode && !isTemplateValid(bioSections))
                    }
                    className={cn(
                      "w-full transition-all duration-300 relative group",
                      (!isTemplateMode && !validateBioLength(bio)) ||
                        (isTemplateMode && !isTemplateValid(bioSections))
                        ? "bg-white/5 cursor-not-allowed opacity-50"
                        : "bg-white/10 hover:bg-white/15 opacity-100",
                      "text-white border border-white/10"
                    )}
                  >
                    {isLoading ? "Finding matches..." : "Find Matches"}

                    {/* Updated Tooltip */}
                    {isTemplateMode && !isTemplateValid(bioSections) && (
                      <div
                        className="absolute -top-14 left-1/2 transform -translate-x-1/2 
                                  hidden group-hover:block w-64 p-3 
                                  bg-black text-white text-sm rounded-lg shadow-xl
                                  border border-white/10 z-50
                                  animate-in fade-in-0 duration-200"
                      >
                        <div
                          className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 
                                      w-3 h-3 rotate-45 bg-black border-r border-b border-white/10"
                        ></div>
                        Please answer the first question to continue
                      </div>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-center p-3 rounded">
                    <h4 className="font-medium">Oops! Something went wrong.</h4>
                    <p className="text-sm opacity-90">{error}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-in fade-in-0 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-8 gap-4">
              <h2 className="text-2xl font-medium bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Your Matches
              </h2>
              <Button
                onClick={() => setCurrentView("questionnaire")}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#303030] text-white/80 hover:text-white transition-colors"
              >
                ← Back to Questionnaire
              </Button>
            </div>

            {showSkeletons ? (
              <div className="space-y-4 p-6">
                <h3
                  className="text-xl pt-4 font-medium text-white/90"
                  style={{
                    opacity: 0,
                    animation: "fadeInOut 6000ms infinite",
                  }}
                >
                  {loadingMessages[loadingMessageIndex]}
                </h3>
                {[...Array(3)].map((_, index) => (
                  <SkeletonMatchCard key={index} delay={index * 4000} />
                ))}
              </div>
            ) : error ? (
              <Card className="bg-[#232323] border-[#2A2A2A] m-6">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-red-500/10 rounded-full">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-white/90">
                        Unable to Find Matches
                      </h3>
                      <p className="text-sm text-white/60 max-w-md">{error}</p>
                    </div>
                    <Button
                      onClick={() => setCurrentView("questionnaire")}
                      variant="outline"
                      className="mt-4 bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#303030] text-white/80 hover:text-white transition-colors"
                    >
                      ← Back to Bio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 p-6">
                {matches.map((match, index) => (
                  <Card
                    key={index}
                    className="bg-[#232323] border-[#2A2A2A]"
                    style={{
                      opacity: 0,
                      animation: `slideIn 1200ms ${
                        index * 800
                      }ms forwards ease-out`,
                    }}
                  >
                    <CardContent className="px-6 py-6 pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 pb-2">
                          <AvatarCircle name={match.name} size={40} />
                          <h4 className="font-medium text-white/90">
                            {match.name}
                          </h4>
                        </div>
                        <p className="text-sm text-white/60">{match.matchreason}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Matching Summary Card */}
                {summary && (
                  <Card
                    className="bg-[#232323] border-[#2A2A2A] mt-8"
                    style={{
                      opacity: 0,
                      animation: `slideIn 1200ms ${
                        matches.length * 800
                      }ms forwards ease-out`,
                    }}
                  >
                    <CardContent className="px-6 py-6">
                      <h3 className="text-lg font-medium text-white/90 mb-3">
                        Matching Summary
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {summary}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Updated footer with link */}
      <footer className="text-center pb-8 text-white/40 text-sm">
        -1 to 0... with friends :)
        <br />
        Made by{" "}
        <a
          href="https://an.vu"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/60 transition-colors underline"
        >
          An
        </a>
      </footer>
    </div>
  );
}
