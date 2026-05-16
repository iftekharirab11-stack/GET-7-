import { useState, useRef } from "react";
import { Button } from "../ui/Button";

export function AudioRecorder({ onAudioReady }: { onAudioReady: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    mediaRecorderRef.current.onstop = () => { const blob = new Blob(chunksRef.current, { type: "audio/webm" }); onAudioReady(blob); };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };
  const stop = () => { mediaRecorderRef.current?.stop(); mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()); setIsRecording(false); };
  return (<div className="flex flex-col items-center"><Button variant={isRecording ? "danger" : "primary"} onClick={isRecording ? stop : start} className="w-20 h-20 rounded-full flex items-center justify-center text-2xl">{isRecording ? "⏹️" : "🎙️"}</Button><p className="text-muted text-sm font-mono uppercase mt-4">{isRecording ? "RECORDING..." : "CLICK TO START"}</p></div>);
}