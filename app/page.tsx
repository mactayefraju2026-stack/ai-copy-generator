"use client";

import { useState } from "react";

export default function Home() {
  const [businessName, setBusinessName] = useState("");
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState("");

  const generateCopy = () => {
    const text = `Business Name: ${businessName}

Service: ${service}

Location: ${location}

Homepage Headline:
Welcome to ${businessName}, your trusted ${service} in ${location}.

About:
At ${businessName}, we proudly provide high-quality ${service} services in ${location}. Our mission is to deliver reliable service, honest pricing, and results people can trust.

Call to Action:
Contact ${businessName} today to get professional ${service} in ${location}.`;
    setResult(text);
  };

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">AI Website Copy Generator</h1>
        <p className="text-gray-600 mb-6">
          Generate simple homepage copy for local businesses.
        </p>

        <div className="space-y-4">
          <input
            className="w-full border rounded p-3"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <input
            className="w-full border rounded p-3"
            placeholder="Service"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
          <input
            className="w-full border rounded p-3"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button
            onClick={generateCopy}
            className="bg-black text-white px-6 py-3 rounded"
          >
            Generate Copy
          </button>
        </div>

        {result && (
          <div className="mt-8 p-4 border rounded bg-gray-50 whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
