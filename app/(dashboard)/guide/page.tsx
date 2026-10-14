export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nova Field Guide</h1>
      <div className="p-6 rounded-2xl glass-panel border space-y-3">
        <h3 className="font-bold">System Setup & Model Fallback</h3>
        <p className="text-sm text-atelier-muted dark:text-nova-muted">
          1. Enter your primary Gemini API Key.<br/>
          2. Nova core pipeline: 3.5 Flash-Lite &rarr; 3.1 Flash-Lite &rarr; 3.7 Flash &rarr; 3.5 Flash.<br/>
          3. Groq and OpenRouter keys act as automatic fallbacks.
        </p>
      </div>
    </div>
  );
}
