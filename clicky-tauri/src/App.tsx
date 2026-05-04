import { useState, useEffect } from "react";
import { getCurrentWindow } from '@tauri-apps/api/window';
import "./App.css";

function App() {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string, images?: string[]}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<"clicky" | "local" | "free">("clicky");
  const [localModel, setLocalModel] = useState("");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch available Ollama models
    fetch("http://localhost:11434/api/tags")
      .then(res => res.json())
      .then(data => {
        if (data.models && data.models.length > 0) {
          const names = data.models.map((m: any) => m.name);
          setOllamaModels(names);
          setLocalModel(names[0]);
        }
      })
      .catch(err => console.error("Could not fetch Ollama models:", err));
  }, []);

  // Close window when clicking outside, simulating the panel behavior
  useEffect(() => {
    const handleBlur = async () => {
      await getCurrentWindow().hide();
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const newMsg = input;
    setInput("");
    setIsLoading(true);

    let base64Image = "";
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      base64Image = await invoke("capture_screen");
    } catch (e) {
      console.error("Screenshot failed:", e);
      alert(`Screenshot failed: ${e}`);
    }

    const newMessageObj: any = { role: 'user', content: newMsg };
    if (base64Image) {
      newMessageObj.images = [base64Image]; // For Ollama
    }

    const newMessages = [...messages, newMessageObj];
    setMessages(newMessages as any);
    
    try {
      if (provider === "free") {
        // Completely offline mock for testing UI and Cursor
        setTimeout(() => {
          const x = Math.floor(window.screen.width / 2);
          const y = Math.floor(window.screen.height / 2);
          const mockContent = `I am the Free Mock AI! Let me show you the magic cursor by pointing to the center of your screen at [${x}, ${y}].`;
          
          setMessages(prev => [...prev, {role: 'assistant', content: mockContent}]);
          setIsLoading(false);
          
          // Trigger the cursor overlay!
          import('@tauri-apps/api/event').then(({ emit }) => {
            emit("point-element", { x, y });
          });
        }, 1500);
        return;
      }

      let endpoint = "";
      let body: any = {};
      
      if (provider === "clicky") {
        endpoint = "http://localhost:8787/chat";
        // Anthropic requires specific formatting for images
        const anthropicMessages = newMessages.map((m: any) => {
          if (m.role === 'user' && m.images) {
            return {
              role: 'user',
              content: [
                { type: "image", source: { type: "base64", media_type: "image/jpeg", data: m.images[0] } },
                { type: "text", text: m.content }
              ]
            };
          }
          return { role: m.role, content: m.content };
        });

        body = {
          messages: anthropicMessages,
          model: "claude-3-5-sonnet-20240620",
          stream: false
        };
      } else if (provider === "local") {
        endpoint = "http://localhost:11434/api/chat";
        body = {
          model: localModel,
          messages: newMessages,
          stream: false
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      let content = "No response.";
      
      if (provider === "local") {
        content = data.message?.content || "No response from Local AI.";
      } else {
        content = data.content ? data.content[0].text : "No response from Cloud.";
      }
      
      setMessages(prev => [...prev, {role: 'assistant', content}]);
    } catch(e) {
      console.error(e);
      setMessages(prev => [...prev, {role: 'assistant', content: `Error connecting to ${provider} proxy. Make sure it's running locally!`}]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="header" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <h1>Clicky</h1>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {provider === "local" && (
            <select 
              value={localModel} 
              onChange={e => setLocalModel(e.target.value)} 
              className="provider-select"
            >
              {ollamaModels.length === 0 && <option value="">No local models found</option>}
              {ollamaModels.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value as any)} 
            className="provider-select"
          >
            <option value="clicky">Cloud Proxy</option>
            <option value="local">Local AI (Ollama)</option>
            <option value="free">Free AI (Mock)</option>
          </select>
        </div>
      </div>
      
      <div className="chat-container">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            {m.images && m.images.length > 0 && <div style={{fontSize: '0.8em', color: 'green', marginBottom: '4px'}}>📸 [Screenshot Attached]</div>}
            {m.content}
          </div>
        ))}
        {isLoading && <div className="message assistant loading">...</div>}
      </div>

      <form className="input-form" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
        <input 
          autoFocus
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder={`Message via ${provider}...`} 
        />
        <button type="submit" disabled={isLoading || !input.trim()}>Send</button>
      </form>
    </main>
  );
}

export default App;
