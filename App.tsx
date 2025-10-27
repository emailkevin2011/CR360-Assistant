import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { ConversationEntry, ConversationRole, FunctionCallLog, Status } from './types';
import { createBlob, decode, decodeAudioData } from './utils/audio';
import { SYSTEM_INSTRUCTION, TOOL_DECLARATIONS } from './services/geminiService';
import { handleToolCall } from './services/mockApiService';
import StatusIndicator from './components/StatusIndicator';

const App: React.FC = () => {
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [transcript, setTranscript] = useState<ConversationEntry[]>([]);
  const [functionCalls, setFunctionCalls] = useState<FunctionCallLog[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasSelectedApiKey, setHasSelectedApiKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasSelectedApiKey(hasKey);
        } catch (e) {
          console.error("Error checking API key:", e);
          setHasSelectedApiKey(false);
        }
      } else {
        console.warn('window.aistudio not found. Assuming API key is set via environment.');
        setHasSelectedApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasSelectedApiKey(true);
        setErrorMessage(null);
      } catch (e) {
        console.error("Could not open select key dialog:", e);
        setErrorMessage("Failed to open the API Key selection. Please try again.");
      }
    }
  };

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

    if (currentInputTranscriptionRef.current || currentOutputTranscriptionRef.current) {
      setTranscript(prev => {
        const newEntries: ConversationEntry[] = [];
        if (currentInputTranscriptionRef.current.trim()) {
          newEntries.push({ role: ConversationRole.USER, text: currentInputTranscriptionRef.current.trim() });
        }
        if (currentOutputTranscriptionRef.current.trim()) {
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
    
    if (!hasSelectedApiKey) {
      await handleSelectApiKey();
      return;
    }

    setErrorMessage(null);

    try {
      setIsRecording(true);
      setStatus(Status.LISTENING);
      setTranscript([]);
      setFunctionCalls([]);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
                const result = await handleToolCall(fc.name, fc.args);
                const newLog: FunctionCallLog = { id: fc.id, name: fc.name, args: fc.args, result: JSON.stringify(result, null, 2) };
                
                setFunctionCalls(prev => [...prev, newLog]);
                
                sessionPromise.then((session) => {
                  session.sendToolResponse({
                    functionResponses: {
                      id : fc.id,
                      name: fc.name,
                      response: { result: result },
                    }
                  });
                });
              }
            }
          },
          onerror: (e: Error) => {
            console.error('API Error:', e);
            // FIX: The `onerror` callback receives an `Error` object, not an `ErrorEvent`. Access `e.message` directly.
            setErrorMessage(`API Error: ${e.message}. The API key might be invalid. Please select a valid key.`);
            setStatus(Status.ERROR);
            setHasSelectedApiKey(false);
            stopConversation();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed', e);
            // 1000 is a normal, graceful closure. Any other code might indicate a problem.
            if (e.code !== 1000) { 
              setErrorMessage('The connection was closed unexpectedly. This can be due to a network issue or an invalid API key.');
              // Reset API key state to prompt the user to re-select, as this is a common cause of unexpected closures.
              setHasSelectedApiKey(false);
            }
            stopConversation();
          },
        },
      });

      sessionPromise.then(session => {
        sessionRef.current = session;
      }).catch(err => {
        console.error("Failed to connect:", err);
        setErrorMessage(`Failed to connect to the Gemini API: ${err.message}. Please check your API key and network connection.`);
        setStatus(Status.ERROR);
        setIsRecording(false);
        setHasSelectedApiKey(false);
      });

    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setErrorMessage(`Error: ${error.message}`);
      setStatus(Status.ERROR);
      setIsRecording(false);
    }
  }, [isRecording, hasSelectedApiKey, stopConversation]);

  const renderConversation = () => (
    <div className="space-y-4">
      {transcript.map((entry, index) => (
        <div key={index} className={`flex ${entry.role === ConversationRole.USER ? 'justify-end' : 'justify-start'}`}>
          <div className={`rounded-lg px-4 py-2 max-w-lg ${entry.role === ConversationRole.USER ? 'bg-blue-600' : 'bg-gray-700'}`}>
            <p className="text-sm font-semibold mb-1 capitalize">{entry.role}</p>
            <p>{entry.text}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFunctionCalls = () => (
    <div className="space-y-4">
      {functionCalls.map((call) => (
        <div key={call.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-sm font-mono text-yellow-400">
            <span className="font-bold">Function Call:</span> {call.name}
          </p>
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-400">Arguments:</p>
            <pre className="text-xs bg-gray-900 p-2 rounded-md overflow-x-auto">
              {JSON.stringify(call.args, null, 2)}
            </pre>
          </div>
          {call.result && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-400">Result:</p>
              <pre className="text-xs bg-gray-900 p-2 rounded-md overflow-x-auto text-green-400">
                {call.result}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
  
  const renderApiKeyScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className="text-3xl font-bold mb-4">ClaimRoute 360 AI Assistant</h1>
      <p className="text-gray-400 mb-8">Please select your API key to begin.</p>
      <button
        onClick={handleSelectApiKey}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Select API Key
      </button>
      <p className="text-xs text-gray-500 mt-4">
        For information on billing, please visit{' '}
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">
          ai.google.dev/gemini-api/docs/billing
        </a>.
      </p>
      {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
    </div>
  );

  const renderMainApp = () => (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ClaimRoute 360 AI Assistant</h1>
        <StatusIndicator status={status} />
      </header>

      <div className="mb-6">
        <button
          onClick={startConversation}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all text-lg
            ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            ${!hasSelectedApiKey && !isRecording ? 'bg-gray-500 cursor-not-allowed' : ''}`}
          disabled={!hasSelectedApiKey && !isRecording}
        >
          {isRecording ? 'Stop Conversation' : 'Start Conversation'}
        </button>
        {!hasSelectedApiKey && (
          <p className="text-center text-yellow-500 text-sm mt-2">
            Please{' '}
            <button onClick={handleSelectApiKey} className="underline hover:text-yellow-400">
              select your API key
            </button>
            {' '}to start.
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Conversation</h2>
          <div className="h-96 overflow-y-auto pr-2">
            {transcript.length > 0 ? renderConversation() : <p className="text-gray-400">Conversation will appear here...</p>}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Function Calls</h2>
          <div className="h-96 overflow-y-auto pr-2">
            {functionCalls.length > 0 ? renderFunctionCalls() : <p className="text-gray-400">Tool activity will be logged here...</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      {!hasSelectedApiKey ? renderApiKeyScreen() : renderMainApp()}
    </main>
  );
};

export default App;
