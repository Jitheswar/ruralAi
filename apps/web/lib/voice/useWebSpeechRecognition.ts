'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export type SpeechStatus = 'idle' | 'listening' | 'error';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  onTranscript?: (text: string) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  status: SpeechStatus;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone permission denied. Please allow microphone access.',
  'no-speech': 'No speech detected. Please try again.',
  'network': 'Network error. Please check your connection.',
  'audio-capture': 'No microphone found. Please connect a microphone.',
  'aborted': 'Speech recognition was stopped.',
};

export function useWebSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const { lang = 'en-IN', onTranscript } = options;

  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    // Stop any existing session
    recognitionRef.current?.abort();

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[event.resultIndex][0].transcript;
      setTranscript(text);
      setStatus('idle');
      onTranscript?.(text);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg = ERROR_MESSAGES[event.error] || `Speech error: ${event.error}`;
      setError(msg);
      setStatus('error');
    };

    recognition.onend = () => {
      setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recognitionRef.current = recognition;
    setError(null);
    setTranscript('');
    setStatus('listening');
    recognition.start();
  }, [isSupported, lang, onTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { isSupported, status, transcript, error, start, stop };
}
