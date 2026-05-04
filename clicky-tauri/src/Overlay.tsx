import { useEffect, useState } from "react";
import "./Overlay.css";

export default function Overlay() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let unlisten: any;
    async function setupListener() {
      const { listen } = await import('@tauri-apps/api/event');
      // Listen for the actual AI command to point at a specific coordinate
      unlisten = await listen<{x: number, y: number}>("point-element", (event) => {
        setIsVisible(true);
        setCursorPos({ x: event.payload.x, y: event.payload.y });
        
        // Hide it again after a few seconds, like the Mac version
        setTimeout(() => setIsVisible(false), 3000);
      });
    }
    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <div className="overlay-container">
      {isVisible && (
        <div 
          className="magic-cursor"
          style={{ 
            transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' 
          }}
        >
          {/* Simple Blue Cursor SVG resembling Clicky's Mac OS cursor */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4L11.5 28L15.5 17L27 13L4 4Z" fill="#007AFF" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <div className="cursor-label">Clicky is pointing here!</div>
        </div>
      )}
    </div>
  );
}
