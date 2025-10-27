
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { ConversationEntry, ConversationRole, FunctionCallLog, Status } from './types';
import { createBlob, decode, decodeAudioData } from './utils/audio';
import { SYSTEM_INSTRUCTION, TOOL_DECLARATIONS } from './services/geminiService';
import StatusIndicator from './components/StatusIndicator';

const App: React.FC = () => {
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [transcript, setTranscript] = useState<ConversationEntry[]>([]);
  const [functionCalls, setFunctionCalls] = useState<FunctionCallLog[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const sessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopConversation = useCallback(async () => {
    setIsRecording(false);
    setStatus(Status.IDLE);

    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      await inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      await outputAudioContextRef.current.close();
    }
    
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();

    // Finalize any partial transcriptions
    if (currentInputTranscriptionRef.current || currentOutputTranscriptionRef.current) {
        setTranscript(prev => {
            const newEntries: ConversationEntry[] = [];
            if(currentInputTranscriptionRef.current.trim()) {
                newEntries.push({ role: ConversationRole.USER, text: currentInputTranscriptionRef.current.trim() });
            }
            if(currentOutputTranscriptionRef.current.trim()) {
                newEntries.push({ role: ConversationRole.MODEL, text: currentOutputTranscriptionRef.current.trim() });
            }
            return [...prev, ...newEntries];
        });
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';
    }

  }, []);


  const startConversation = useCallback(async () => {
    if (isRecording) {
        await stopConversation();
        return;
    }

    try {
      setIsRecording(true);
      setStatus(Status.LISTENING);
      setTranscript([]);
      setFunctionCalls([]);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      // Fix: Cast window to `any` to support `webkitAudioContext` for Safari compatibility.
      inputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      nextStartTimeRef.current = 0;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             if (message.serverContent) {
                if (message.serverContent.inputTranscription) {
                    currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                }
                if (message.serverContent.outputTranscription) {
                    currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                    setStatus(Status.SPEAKING);
                }

                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                if (base64Audio) {
                    const outputCtx = outputAudioContextRef.current!;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                    const source = outputCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputCtx.destination);
                    source.addEventListener('ended', () => {
                        audioSourcesRef.current.delete(source);
                        if (audioSourcesRef.current.size === 0) {
                            setStatus(Status.LISTENING);
                        }
                    });
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    audioSourcesRef.current.add(source);
                }

                if (message.serverContent.turnComplete) {
                     setTranscript(prev => [
                        ...prev,
                        { role: ConversationRole.USER, text: currentInputTranscriptionRef.current.trim() },
                        { role: ConversationRole.MODEL, text: currentOutputTranscriptionRef.current.trim() },
                     ]);
                     currentInputTranscriptionRef.current = '';
                     currentOutputTranscriptionRef.current = '';
                }
             }

             if (message.toolCall) {
                setStatus(Status.THINKING);
                for (const fc of message.toolCall.functionCalls) {
                  const newLog: FunctionCallLog = { id: fc.id, name: fc.name, args: fc.args, result: "OK (Simulated)" };
                  setFunctionCalls(prev => [...prev, newLog]);
                  
                  sessionPromise.then(session => {
                      session.sendToolResponse({
                          functionResponses: {
                              id: fc.id,
                              name: fc.name,
                              response: { result: newLog.result as string },
                          },
                      });
                  });
                }
             }
          },
          onerror: (e: ErrorEvent) => {
            console.error('API Error:', e);
            setStatus(Status.ERROR);
            stopConversation();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed');
            stopConversation();
          },
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error("Failed to start conversation:", error);
      setStatus(Status.ERROR);
      setIsRecording(false);
    }
  }, [isRecording, stopConversation]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-cyan-400">ClaimRoute 360 AI Assistant</h1>
        <p className="text-center text-gray-400 text-sm mt-1">Powered by Gemini 2.5 Native Audio</p>
      </header>
      
      <main className="flex-grow p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 rounded-lg shadow-xl flex flex-col h-[calc(100vh-200px)]">
            <h2 className="text-lg font-semibold p-4 border-b border-gray-700 text-cyan-300">Conversation Transcript</h2>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {transcript.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Press "Start Conversation" to begin.</p>
                    </div>
                )}
                {transcript.map((entry, index) => entry.text && (
                    <div key={index} className={`flex ${entry.role === ConversationRole.USER ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg ${entry.role === ConversationRole.USER ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                           <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg shadow-xl flex flex-col h-[calc(100vh-200px)]">
            <h2 className="text-lg font-semibold p-4 border-b border-gray-700 text-cyan-300">Tool Calls</h2>
            <div className="flex-grow p-4 overflow-y-auto space-y-3">
                 {functionCalls.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No tool calls yet.</p>
                    </div>
                )}
                {functionCalls.map((call) => (
                    <div key={call.id} className="bg-gray-700 p-3 rounded-md text-xs">
                        <p className="font-bold text-yellow-400">{call.name}</p>
                        <pre className="mt-1 bg-gray-900 p-2 rounded overflow-x-auto text-gray-300 text-[11px]">{JSON.stringify(call.args, null, 2)}</pre>
                        <p className="mt-2 text-green-400"><strong>Result:</strong> {call.result}</p>
                    </div>
                ))}
            </div>
        </div>
      </main>

      <footer className="bg-gray-800 p-4 shadow-inner sticky bottom-0 z-10 flex items-center justify-center space-x-6">
        <button
          onClick={startConversation}
          className={`px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 ease-in-out flex items-center space-x-3 shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-800
            ${isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
        >
          {isRecording ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 4.5a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v6a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5V6.83l-1.22 1.22a.5.5 0 01-.707 0L8.5 6.828V11a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-6z" /></svg>
          )}
          <span>{isRecording ? 'Stop Conversation' : 'Start Conversation'}</span>
        </button>
        <StatusIndicator status={status} />
      </footer>
    </div>
  );
};

export default App;
