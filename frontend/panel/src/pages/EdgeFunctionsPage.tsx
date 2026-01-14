import React from 'react'
import { Info } from 'lucide-react'

const templates = [
  { name: 'Simple Hello World', desc: 'Basic function that returns a JSON response' },
  { name: 'Supabase Database Access', desc: 'Example using Supabase client to query your database' },
  { name: 'Supabase Storage Upload', desc: 'Upload files to Supabase Storage' },
  { name: 'Node Built-in API Example', desc: 'Example using Node.js built-in crypto and http modules' },
  { name: 'Express Server', desc: 'Example using Express.js for routing' },
  { name: 'OpenAI Text Completion', desc: 'Example using OpenAI API for text completion' },
]

const EdgeFunctionsPage = () => {
  return (
    <div className="h-full flex flex-col bg-[#f8fafb]">
      <div className="border-b bg-white px-4 py-4 border-[var(--sb-border)]">
        <h1 className="font-semibold text-xl mb-2">Edge Functions</h1>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-[var(--sb-muted)] border rounded-lg p-4 flex flex-col items-start">
            <span className="font-medium mb-1">Via Editor</span>
            <span className="text-gray-600 text-sm mb-2">Create and edit functions directly in the browser. Download to local at any time.</span>
            <button className="btn-sb-outline text-sm">Open Editor</button>
          </div>
          <div className="flex-1 bg-[var(--sb-muted)] border rounded-lg p-4 flex flex-col items-start">
            <span className="font-medium mb-1">AI Assistant</span>
            <span className="text-gray-600 text-sm mb-2">Let our AI assistant help you create functions. Perfect for kickstarting a function.</span>
            <button className="btn-sb-outline text-sm">Open Assistant</button>
          </div>
          <div className="flex-1 bg-[var(--sb-muted)] border rounded-lg p-4 flex flex-col items-start">
            <span className="font-medium mb-1">Via CLI</span>
            <span className="text-gray-600 text-sm mb-2">Create and deploy functions using the Supabase CLI. Ideal for local development and version control.</span>
            <button className="btn-sb-outline text-sm">View CLI Instructions</button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white p-6">
        <h2 className="font-semibold text-lg mb-4">Start with a template</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl, i) => (
            <div key={i} className="border rounded-lg p-4 bg-[var(--sb-muted)] flex flex-col">
              <span className="font-medium mb-1">{tpl.name}</span>
              <span className="text-gray-600 text-sm mb-2">{tpl.desc}</span>
              <button className="mt-auto btn-sb-outline text-sm">Select</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EdgeFunctionsPage 