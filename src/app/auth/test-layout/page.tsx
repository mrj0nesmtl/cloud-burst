import React from 'react'

export default function TestLayout() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Layout Test Page</h1>
      
      <div className="border border-blue-500 p-4 mb-6">
        <h2 className="font-semibold mb-2">Regular Two Column Grid</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-100 p-4 rounded">Column 1</div>
          <div className="bg-green-100 p-4 rounded">Column 2</div>
        </div>
      </div>
      
      <div className="border border-red-500 p-4 mb-6">
        <h2 className="font-semibold mb-2">Responsive Grid with lg: Breakpoint</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-red-100 p-4 rounded">Column 1 (shows always)</div>
          <div className="hidden lg:block bg-purple-100 p-4 rounded">Column 2 (shows only on lg screens)</div>
        </div>
      </div>
      
      <div className="border border-yellow-500 p-4">
        <h2 className="font-semibold mb-2">Flex with lg: Breakpoint (Like Auth Layout)</h2>
        <div className="relative min-h-[300px] grid lg:grid-cols-2">
          <div className="hidden lg:flex bg-yellow-100 p-4 rounded">
            Left Side (only on lg screens)
          </div>
          <div className="bg-green-100 p-4 rounded">
            Right Side (always visible)
          </div>
        </div>
      </div>
    </div>
  )
} 