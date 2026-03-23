"use client";

import { useState } from "react";
import {
  ARTIST_KO_MAP,
  VOCALOID_KO_MAP,
  STATIC_QUICK_QUESTIONS,
} from "@/constants/chat";

interface QuickQuestionsProps {
  onSelect: (question: string) => void;
}

const getRandomArtistQuestion = () => {
  const artists = Object.values(ARTIST_KO_MAP);
  const random = artists[Math.floor(Math.random() * artists.length)];
  return `${random}의 최신곡 찾아줘`;
};

const getRandomVocaloidQuestion = () => {
  const vocaloids = Object.values(VOCALOID_KO_MAP);
  const random = vocaloids[Math.floor(Math.random() * vocaloids.length)];
  return `보컬로이드 ${random}의 노래 찾아줘`;
};

export default function QuickQuestions({ onSelect }: QuickQuestionsProps) {
  const [artistQuestion] = useState(() => getRandomArtistQuestion());
  const [vocaloidQuestion] = useState(() => getRandomVocaloidQuestion());

  const questions = [
    ...STATIC_QUICK_QUESTIONS,
    artistQuestion,
    vocaloidQuestion,
  ];

  return (
    <div className="flex flex-col gap-2 items-end">
      {questions.map((question) => (
        <button
          type="button"
          key={question}
          onClick={() => onSelect(question)}
          className="typo-caption text-gray-white px-3 py-2 rounded-full border gradient-border-transparent hover:bg-gray-30 active:bg-gray-20 transition-colors duration-150"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
