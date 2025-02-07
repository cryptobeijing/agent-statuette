'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatResponse } from '@/lib/chatbot';
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const autonomousInterval = useRef<NodeJS.Timeout | null>(null);

  // Cleanup autonomous mode on unmount
  useEffect(() => {
    return () => {
      if (autonomousInterval.current) {
        clearInterval(autonomousInterval.current);
      }
    };
  }, []);

  // Handle autonomous mode
  useEffect(() => {
    if (isAutonomous) {
      setMode('auto');
      const runAutonomous = async () => {
        try {
          // Add autonomous message if starting fresh
          if (!messages.some(m => m.content.includes('autonomous mode'))) {
            setMessages(prev => [...prev, {
              content: 'Starting autonomous mode. The agent will perform actions automatically every 30 seconds.',
              type: 'tools'
            }]);
          }

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'autonomous' }),
          });

          if (!response.ok) {
            throw new Error('Failed to send message');
          }

          const data = await response.json();
          setMessages(prev => [...prev, ...data.responses]);
        } catch (error) {
          console.error('Error:', error);
          setMessages(prev => [...prev, {
            content: 'Error in autonomous mode. Will retry in 30 seconds...',
            type: 'tools'
          }]);
        }
      };

      // Run immediately and then every 30 seconds
      runAutonomous();
      autonomousInterval.current = setInterval(runAutonomous, 30000);

      // Cleanup function
      return () => {
        if (autonomousInterval.current) {
          clearInterval(autonomousInterval.current);
          autonomousInterval.current = null;
        }
      };
    } else {
      // Clear interval when exiting autonomous mode
      if (autonomousInterval.current) {
        clearInterval(autonomousInterval.current);
        autonomousInterval.current = null;
      }
      setMode('manual');
    }
  }, [isAutonomous, messages]); // Add messages to dependencies

  const handleSubmit = async (e: React.FormEvent | Event) => {
    e.preventDefault();
    const currentInput = input.trim().toLowerCase();
    if (!currentInput) return;

    setInput('');

    // Add user message to the chat
    setMessages(prev => [...prev, {
      content: currentInput,
      type: 'user'
    }]);

    // Check if entering autonomous mode
    if (currentInput.includes('auto') || currentInput.includes('autonomous')) {
      setIsAutonomous(true);
      setMessages(prev => [...prev, {
        content: 'Entering autonomous mode. The agent will perform actions automatically every 30 seconds.',
        type: 'tools'
      }]);
      return;
    }

    // Check if stopping autonomous mode
    if (currentInput === 'stop' && isAutonomous) {
      setIsAutonomous(false);
      setMessages(prev => [...prev, {
        content: 'Autonomous mode stopped.',
        type: 'tools'
      }]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, ...data.responses]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        content: 'Sorry, there was an error processing your message. Please try again.',
        type: 'tools'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-4xl flex flex-col items-center p-4 sm:p-8 gap-12">
        {/* Header */}
        <div className="flex justify-between items-center w-full pt-6">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 transform hover:scale-105 transition-transform">
              <Image
                src="/AgentStatuette.jpg"
                alt="AgentStatuette Logo"
                width={96}
                height={96}
                className="rounded-full shadow-lg border-4 border-blue-300 object-contain bg-white hover:border-blue-400 transition-colors"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-4xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 hover:opacity-90 transition-opacity">
                AgentStatuette
              </h1>
              <p className="text-sm sm:text-base font-medium bg-gradient-to-r from-blue-400/80 via-blue-500/80 to-blue-600/80 bg-clip-text text-transparent mt-2 tracking-wide hover:opacity-90 transition-opacity">
                Onchain life easier with AgentKit
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold shadow-md transition-all duration-300 ${
            mode === 'auto' 
              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500 hover:bg-yellow-200'
              : 'bg-blue-100 text-blue-800 border-2 border-blue-500 hover:bg-blue-200'
          }`}>
            {mode === 'auto' ? '🤖 Autonomous Mode' : '👤 Manual Mode'}
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
            <button
              onClick={() => {
                setInput("my wallet address");
                handleSubmit(new Event('submit') as any);
              }}
              className="p-6 rounded-xl border-2 border-blue-200 hover:border-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-blue-800">🏦 My wallet address is</h3>
              <p className="text-sm text-gray-600">Check your wallet address</p>
            </button>
            <button
              onClick={() => {
                setInput("get some faucet");
                handleSubmit(new Event('submit') as any);
              }}
              className="p-6 rounded-xl border-2 border-blue-200 hover:border-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-blue-800">💧 Get some faucet</h3>
              <p className="text-sm text-gray-600">Request test tokens for your wallet</p>
            </button>
            <button
              onClick={() => {
                setInput("my wallet balance");
                handleSubmit(new Event('submit') as any);
              }}
              className="p-6 rounded-xl border-2 border-blue-200 hover:border-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-blue-800">💰 My wallet balance is</h3>
              <p className="text-sm text-gray-600">Check your current token balance</p>
            </button>
            <button
              onClick={() => {
                setInput("send token");
                handleSubmit(new Event('submit') as any);
              }}
              className="p-6 rounded-xl border-2 border-blue-200 hover:border-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-blue-800">💸 Send Token to</h3>
              <p className="text-sm text-gray-600">Send tokens to another address</p>
            </button>
          </div>
        )}
        
        {/* Chat Container */}
        <div className="w-full bg-white rounded-xl shadow-xl p-6 flex flex-col max-h-[600px] border border-gray-100">
          {isAutonomous && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
              <h3 className="font-bold text-yellow-800">🤖 Running in Autonomous Mode</h3>
              <p className="text-yellow-700 mt-1">The agent is performing actions automatically. Type "stop" to exit.</p>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-xl min-h-[300px] border border-gray-100">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-4 rounded-xl shadow-md transition-shadow hover:shadow-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-100 max-w-[50%] ml-auto'
                      : 'bg-white max-w-[80%]'
                  }`}
                >
                  {message.type === 'user' ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6">
                          <Image
                            src="/AgentStatuette.jpg"
                            alt="AgentStatuette"
                            width={24}
                            height={24}
                            className="rounded-full border border-blue-200 object-contain bg-white"
                            unoptimized
                          />
                        </div>
                        <p className="text-sm font-semibold text-blue-600">AgentStatuette</p>
                      </div>
                      <p className="mt-1 text-gray-800 whitespace-pre-wrap">{message.content}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3 mt-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAutonomous ? 'Type "stop" to exit autonomous mode...' : 'Type your message...'}
              className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm hover:shadow transition-shadow"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
