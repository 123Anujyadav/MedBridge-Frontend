import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, waitFor, cleanup } from "@testing-library/react";
import { VoiceModal } from "@/components/patient/ai-assistant/voice/VoiceModal";

/**
 * The voice panel used to emit a hardcoded sentence regardless of what the
 * patient said, which put unspoken symptoms into a clinical conversation.
 * These tests hold the line: nothing reaches the chat input unless the speech
 * engine actually produced it.
 */

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  continuous = false;
  interimResults = false;
  lang = "";
  onstart: (() => void) | null = null;
  onresult: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;
  stopped = false;

  constructor() {
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started = true;
    this.onstart?.();
  }

  stop() {
    this.stopped = true;
    this.onend?.();
  }

  /** Simulate the engine returning a finalised phrase. */
  say(transcript: string) {
    this.onresult?.({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript }], { isFinal: true, length: 1 }),
      ],
    });
  }

  fail(error: string) {
    this.onerror?.({ error });
  }
}

const installSpeechRecognition = () => {
  FakeRecognition.instances = [];
  (window as any).SpeechRecognition = FakeRecognition;
};

describe("VoiceModal", () => {
  beforeEach(() => {
    installSpeechRecognition();
  });

  afterEach(() => {
    cleanup();
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    vi.useRealTimers();
  });

  it("hands back exactly what the patient said", async () => {
    const onTranscriptCaptured = vi.fn();
    render(
      <VoiceModal
        isOpen
        onClose={vi.fn()}
        onTranscriptCaptured={onTranscriptCaptured}
      />
    );

    const recognition = FakeRecognition.instances[0];
    expect(recognition.started).toBe(true);

    await act(async () => {
      recognition.say("my left knee has been swollen for two weeks");
    });

    await act(async () => {
      screen.getByText("Stop Recording").click();
    });

    await waitFor(() =>
      expect(onTranscriptCaptured).toHaveBeenCalledWith(
        "my left knee has been swollen for two weeks"
      )
    );
    // The retired placeholder must never appear again.
    expect(onTranscriptCaptured).not.toHaveBeenCalledWith(
      "I have a fever and headache since yesterday."
    );
  });

  it("emits nothing when no speech was captured", async () => {
    const onTranscriptCaptured = vi.fn();
    render(
      <VoiceModal
        isOpen
        onClose={vi.fn()}
        onTranscriptCaptured={onTranscriptCaptured}
      />
    );

    await act(async () => {
      screen.getByText("Stop Recording").click();
    });

    await waitFor(() =>
      expect(screen.getByText(/no speech was detected/i)).toBeTruthy()
    );
    expect(onTranscriptCaptured).not.toHaveBeenCalled();
  });

  it("reports a denied microphone instead of inventing a transcript", async () => {
    const onTranscriptCaptured = vi.fn();
    render(
      <VoiceModal
        isOpen
        onClose={vi.fn()}
        onTranscriptCaptured={onTranscriptCaptured}
      />
    );

    await act(async () => {
      FakeRecognition.instances[0].fail("not-allowed");
    });

    await waitFor(() =>
      expect(screen.getByText(/microphone access was denied/i)).toBeTruthy()
    );
    expect(onTranscriptCaptured).not.toHaveBeenCalled();
  });

  it("states plainly when the browser has no speech support", async () => {
    delete (window as any).SpeechRecognition;
    const onTranscriptCaptured = vi.fn();

    render(
      <VoiceModal
        isOpen
        onClose={vi.fn()}
        onTranscriptCaptured={onTranscriptCaptured}
      />
    );

    await waitFor(() =>
      expect(screen.getByText(/not supported in this browser/i)).toBeTruthy()
    );
    expect(onTranscriptCaptured).not.toHaveBeenCalled();
  });
});
