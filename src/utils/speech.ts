/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Check if browser Speech Synthesis (TTS) is supported
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Check if browser Speech Recognition (STT) is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Speak given text aloud using the browser's SpeechSynthesis API
 */
export function speakText(
  text: string,
  options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): { stop: () => void } {
  if (!isSpeechSynthesisSupported()) {
    options?.onError?.(new Error('Speech synthesis not supported in this environment'));
    return { stop: () => {} };
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text.trim()) {
    options?.onEnd?.();
    return { stop: () => {} };
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options?.lang || 'en-US';
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;

  // Attempt to select a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)) && !v.name.includes('Bad'));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    // If canceled manually, ignore error
    if (e.error === 'canceled' || e.error === 'interrupted') {
      options?.onEnd?.();
      return;
    }
    options?.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      window.speechSynthesis.cancel();
      options?.onEnd?.();
    },
  };
}

/**
 * React hook for text-to-speech with speaking state
 */
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeControlRef = useRef<{ stop: () => void } | null>(null);

  const stop = useCallback(() => {
    if (activeControlRef.current) {
      activeControlRef.current.stop();
      activeControlRef.current = null;
    }
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, lang = 'en-US') => {
      stop();
      if (!text.trim()) return;

      setIsSpeaking(true);
      activeControlRef.current = speakText(text, {
        lang,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          activeControlRef.current = null;
        },
        onError: () => {
          setIsSpeaking(false);
          activeControlRef.current = null;
        },
      });
    },
    [stop]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported: isSpeechSynthesisSupported(),
  };
}
