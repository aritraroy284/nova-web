export default function PluginsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Plugins & Integrations</h1>
      <div className="p-6 rounded-2xl glass-panel border">
        <h3 className="font-bold">Gmail Assistant</h3>
        <p className="text-xs text-atelier-muted dark:text-nova-muted mt-1">Direct unread email synchronization via OAuth loopback on port 8080.</p>
        <div className="mt-4 inline-block px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">Active on Android Node</div>
      </div>
    </div>
  );
}
