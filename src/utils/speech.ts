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

export interface VoiceRecognitionOptions {
  lang?: string;
  onResult?: (text: string, isInterim: boolean) => void;
  onError?: (errorMessage: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * React hook for speech recognition (Voice Typing / Dictation)
 */
export function useVoiceRecognition(defaultOptions?: VoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const optionsRef = useRef(defaultOptions);
  optionsRef.current = defaultOptions;

  const isSupported = isSpeechRecognitionSupported();

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(
    async (runtimeOptions?: VoiceRecognitionOptions) => {
      const opts = { ...optionsRef.current, ...runtimeOptions };
      setError(null);
      setInterimTranscript('');

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        const msg = 'Speech recognition is not supported in this browser. Please use Google Chrome, Safari, or Microsoft Edge.';
        setError(msg);
        opts.onError?.(msg);
        return;
      }

      // Explicitly request microphone stream to ensure browser permissions are primed
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop audio tracks after obtaining permission
          stream.getTracks().forEach(track => track.stop());
        } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            const msg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
            setError(msg);
            opts.onError?.(msg);
            return;
          }
        }
      }

      // Stop any existing instance
      stopListening();

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = opts.lang || 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          isListeningRef.current = true;
          setIsListening(true);
          opts.onStart?.();
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentFinal += transcript;
            } else {
              currentInterim += transcript;
            }
          }

          if (currentFinal) {
            opts.onResult?.(currentFinal, false);
            setInterimTranscript('');
          } else if (currentInterim) {
            setInterimTranscript(currentInterim);
            opts.onResult?.(currentInterim, true);
          }
        };

        recognition.onerror = (event: any) => {
          // Ignored errors
          if (event.error === 'aborted') {
            return;
          }

          let userMsg = 'Speech recognition error.';
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            userMsg = 'Microphone access denied. Please click the lock or camera/microphone icon in your browser address bar to allow microphone access.';
          } else if (event.error === 'no-speech') {
            userMsg = 'No speech detected. Please speak closer to your microphone.';
          } else if (event.error === 'network') {
            userMsg = 'Speech network error. Please verify your internet connection.';
          } else if (event.error === 'audio-capture') {
            userMsg = 'No microphone device found on your computer or phone.';
          }

          setError(userMsg);
          opts.onError?.(userMsg);
          setIsListening(false);
          isListeningRef.current = false;
        };

        recognition.onend = () => {
          setIsListening(false);
          isListeningRef.current = false;
          setInterimTranscript('');
          opts.onEnd?.();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        const msg = err?.message || 'Failed to initialize voice recognition.';
        setError(msg);
        opts.onError?.(msg);
        setIsListening(false);
        isListeningRef.current = false;
      }
    },
    [stopListening]
  );

  const toggleListening = useCallback(
    (runtimeOptions?: VoiceRecognitionOptions) => {
      if (isListeningRef.current || isListening) {
        stopListening();
      } else {
        startListening(runtimeOptions);
      }
    },
    [isListening, startListening, stopListening]
  );

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
