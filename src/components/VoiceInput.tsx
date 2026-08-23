"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  locale?: "en" | "hi";
}

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionType;

export function VoiceInput({ onTranscript, locale = "en" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const transcriptHandlerRef = useRef(onTranscript);

  const windowWithSpeech = typeof window !== "undefined"
    ? (window as unknown as {
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
        SpeechRecognition?: SpeechRecognitionConstructor;
      })
    : null;
  const SpeechRecognitionClass = windowWithSpeech?.SpeechRecognition || windowWithSpeech?.webkitSpeechRecognition;
  const isSupported = Boolean(SpeechRecognitionClass);

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (!SpeechRecognitionClass) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = locale === "hi" ? "hi-IN" : "en-IN";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) transcriptHandlerRef.current(transcript);
      setErrorMessage("");
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      const messages: Record<string, string> = {
        "not-allowed": "Microphone permission was denied. Allow microphone access and try again.",
        "audio-capture": "No microphone was found. Check your device microphone.",
        network: "Voice recognition needs a browser speech service. Check your connection.",
        "no-speech": "No speech was detected. Try speaking clearly after the button turns on.",
      };
      setErrorMessage(messages[event.error] || "Voice input could not start. Try typing the error instead.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [locale, SpeechRecognitionClass]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMessage("Voice input is not supported in this browser. Try Chrome or Edge, or type the error instead.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    try {
      setErrorMessage("");
      recognitionRef.current.lang = locale === "hi" ? "hi-IN" : "en-IN";
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.warn("Could not start voice recognition:", error);
      setErrorMessage("Voice input could not start. Check microphone permission and try again.");
      setIsListening(false);
    }
  };

  return (
    <div className="flex max-w-full flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggleListening}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-xs ${
          isListening
            ? "animate-pulse border-rose-500/40 bg-rose-500/20 text-rose-300"
            : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
        }`}
        title={isListening ? "Listening... Click to stop" : "Speak error or grievance in Hindi/English"}
      >
        {isListening ? <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-400" /> : isSupported ? <Mic className="h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="h-3.5 w-3.5 text-amber-300" />}
        <span>{isListening ? "Listening..." : "Voice Input"}</span>
      </button>
      {!isSupported && <span className="max-w-[260px] text-right text-[11px] text-amber-200">Voice unavailable here; type the error instead.</span>}
      {errorMessage && <span role="alert" className="max-w-[280px] text-right text-[11px] text-rose-200">{errorMessage}</span>}
    </div>
  );
}
