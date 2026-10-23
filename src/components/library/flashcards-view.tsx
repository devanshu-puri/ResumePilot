"use client";

import React, { useState, useEffect } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Play,
  HelpCircle,
  BookOpen,
} from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  topicSlug: string;
  subtopic: string;
  relatedQuizId?: string;
}

interface FlashcardDeck {
  id: string;
  title: string;
  category: string;
  topicSlug: string;
  relatedSkillOrProject: string;
  cardsCount: number;
  cards: Flashcard[];
  relatedQuizId: string;
}

interface FlashcardsViewProps {
  initialDeckId?: string | null;
  onLaunchQuiz?: (quizId: string) => void;
}

export function FlashcardsView({ initialDeckId, onLaunchQuiz }: FlashcardsViewProps) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/flashcards")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.decks) {
          setDecks(data.decks);
          if (initialDeckId) {
            const found = data.decks.find((d: FlashcardDeck) => d.id === initialDeckId);
            if (found) {
              setActiveDeck(found);
              setCardIndex(0);
              setIsFlipped(false);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialDeckId]);

  const handleOpenDeck = (deck: FlashcardDeck) => {
    setActiveDeck(deck);
    setCardIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-6">
      {/* Active Deck Study Mode */}
      {activeDeck ? (
        <div className="p-6 border border-library/40 rounded bg-paper shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="library">{activeDeck.category}</Badge>
                <span className="text-xs font-mono text-ink-2">
                  {activeDeck.relatedSkillOrProject}
                </span>
              </div>
              <h2 className="text-xl font-display font-medium text-ink mt-2">
                {activeDeck.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {onLaunchQuiz && activeDeck.relatedQuizId && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onLaunchQuiz(activeDeck.relatedQuizId)}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  <span>Test Your Knowledge</span>
                </Button>
              )}

              <button
                onClick={() => setActiveDeck(null)}
                className="text-xs font-mono text-ink-4 hover:text-ink ml-2"
              >
                Close Deck
              </button>
            </div>
          </div>

          {/* Flashcard Counter */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-ink font-medium">
              Card {cardIndex + 1} of {activeDeck.cards.length}
            </span>
            <span className="text-ink-4">
              Subtopic: {activeDeck.cards[cardIndex]?.subtopic}
            </span>
          </div>

          {/* Flip Flashcard Canvas */}
          {activeDeck.cards[cardIndex] && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[220px] p-8 border-2 border-dashed border-line hover:border-library rounded-lg bg-card flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none space-y-4"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-4">
                {isFlipped ? "Answer / Explanation (Click to flip back)" : "Prompt / Question (Click to reveal explanation)"}
              </span>

              <p className="font-book text-lg sm:text-xl text-ink leading-relaxed max-w-xl">
                {isFlipped
                  ? activeDeck.cards[cardIndex].back
                  : activeDeck.cards[cardIndex].front}
              </p>

              <span className="text-xs font-mono text-library flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFlipped ? "View Prompt" : "Reveal Explanation"}</span>
              </span>
            </div>
          )}

          {/* Card Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-line">
            <Button
              variant="secondary"
              size="sm"
              disabled={cardIndex === 0}
              onClick={() => {
                setCardIndex((prev) => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Previous Card</span>
            </Button>

            <span className="text-xs font-mono text-ink-4">
              {cardIndex + 1} / {activeDeck.cards.length}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={cardIndex === activeDeck.cards.length - 1}
              onClick={() => {
                setCardIndex((prev) => Math.min(activeDeck.cards.length - 1, prev + 1));
                setIsFlipped(false);
              }}
            >
              <span>Next Card</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Decks List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="p-5 rounded border border-line bg-card flex flex-col justify-between space-y-4 hover:border-ink-2 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="library">{deck.category}</Badge>
                  <span className="text-[11px] font-mono text-ink-4">
                    {deck.cardsCount} flashcards
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-medium text-lg text-ink">
                    {deck.title}
                  </h3>
                  <span className="text-xs font-sans text-ink-2 mt-0.5 block">
                    {deck.relatedSkillOrProject}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-between">
                {onLaunchQuiz && deck.relatedQuizId && (
                  <button
                    onClick={() => onLaunchQuiz(deck.relatedQuizId)}
                    className="text-xs font-mono text-library hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Test Your Knowledge</span>
                  </button>
                )}

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenDeck(deck)}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  <span>Review Flashcards</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
