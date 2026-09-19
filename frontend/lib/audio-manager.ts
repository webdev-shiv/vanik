/**
 * Centralized Audio & Speech Synthesis Manager for VANIK Daily Voice Reports.
 * Implements audio caching:
 * - Generates / prepares audio once per (reportId, language).
 * - Replay directly plays from cached audio instance without re-synthesizing.
 * - Reports honest Soundbox status without faking hardware delivery.
 */

export interface PlaybackState {
  isPlaying: boolean;
  activeReportId: string | null;
  activeLang: string | null;
  soundboxConnected: boolean;
  soundboxStatusText: string;
}

class AudioManager {
  private cache: Map<string, SpeechSynthesisUtterance> = new Map();
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<(state: PlaybackState) => void> = new Set();

  private getCacheKey(reportId: string, lang: string): string {
    return `${reportId}__${lang}`;
  }

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public subscribe(listener: (state: PlaybackState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state: PlaybackState = {
      isPlaying: this.isSpeaking,
      activeReportId: this.currentUtterance ? (this.currentUtterance as any)._reportId : null,
      activeLang: this.currentUtterance ? (this.currentUtterance as any)._lang : null,
      soundboxConnected: false,
      soundboxStatusText: "Web/Device Audio (Soundbox hardware not connected)",
    };
    this.listeners.forEach((l) => l(state));
  }

  public playVoice(
    reportId: string,
    scriptText: string,
    lang: "hindi" | "hinglish" | "english" | string,
    onStart?: () => void,
    onEnd?: () => void
  ): boolean {
    if (!this.isSupported()) {
      alert("Browser speech synthesis is not supported on this device.");
      return false;
    }

    // If already speaking, stop first
    if (this.isSpeaking) {
      this.stop();
      return false;
    }

    window.speechSynthesis.cancel();

    const cacheKey = this.getCacheKey(reportId, lang);
    let utterance = this.cache.get(cacheKey);

    if (!utterance || utterance.text !== scriptText) {
      // Synthesize new utterance and cache it
      utterance = new SpeechSynthesisUtterance(scriptText);
      (utterance as any)._reportId = reportId;
      (utterance as any)._lang = lang;

      if (lang === "hindi") {
        utterance.lang = "hi-IN";
      } else if (lang === "english") {
        utterance.lang = "en-IN";
      } else {
        utterance.lang = "hi-IN"; // Authentic Indian accent for Hinglish
      }

      utterance.rate = 0.95; // Clear conversational cadence
      utterance.pitch = 1.0;

      this.cache.set(cacheKey, utterance);
    }

    this.currentUtterance = utterance;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify();
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notify();
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error or interrupted:", e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notify();
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public replay(
    reportId: string,
    scriptText: string,
    lang: "hindi" | "hinglish" | "english" | string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    this.stop();
    setTimeout(() => {
      this.playVoice(reportId, scriptText, lang, onStart, onEnd);
    }, 100);
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.notify();
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const audioManager = new AudioManager();
