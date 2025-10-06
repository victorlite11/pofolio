import { useState, useEffect, useRef } from 'react';

interface TypewriterEffectProps {
  lines: Array<{
    lineNumber: number;
    content: string;
    delay?: number;
  }>;
  speed?: number;
  className?: string;
  onLineComplete?: (lineNumber: number) => void;
}

export function TypewriterEffect({ lines = [], speed = 50, className = "", onLineComplete }: TypewriterEffectProps) {
  const [displayedLines, setDisplayedLines] = useState<Array<{ lineNumber: number; content: string; isComplete: boolean }>>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const completedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    const timer = setTimeout(() => {
      if (currentCharIndex < currentLine.content.length) {
        // Update current line with more characters
        setDisplayedLines(prev => {
          const newLines = [...prev];
          const existingLineIndex = newLines.findIndex(line => line.lineNumber === currentLine.lineNumber);
          
          if (existingLineIndex >= 0) {
            newLines[existingLineIndex] = {
              ...newLines[existingLineIndex],
              content: currentLine.content.substring(0, currentCharIndex + 1),
              isComplete: false
            };
          } else {
            newLines.push({
              lineNumber: currentLine.lineNumber,
              content: currentLine.content.substring(0, currentCharIndex + 1),
              isComplete: false
            });
          }
          
          return newLines;
        });
        
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // Line complete, mark as complete and move to next
        setDisplayedLines(prev => {
          const newLines = [...prev];
          const existingLineIndex = newLines.findIndex(line => line.lineNumber === currentLine.lineNumber);
          
          if (existingLineIndex >= 0) {
            newLines[existingLineIndex].isComplete = true;
          }

          // Call onLineComplete once per line when it finishes
          if (onLineComplete && !completedRef.current.has(currentLine.lineNumber)) {
            completedRef.current.add(currentLine.lineNumber);
            try { onLineComplete(currentLine.lineNumber); } catch (e) { /* swallow errors from callback */ }
          }
          
          return newLines;
        });
        
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, currentLine.delay || speed);

    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex, lines, speed]);

  return (
    <div className={className}>
      {displayedLines.map((line, index) => (
        <div key={`${line.lineNumber}-${index}`} className="font-code text-sm">
          <span dangerouslySetInnerHTML={{ __html: line.content }} />
          {!line.isComplete && (
            <span className="animate-pulse text-vscode-accent">|</span>
          )}
        </div>
      ))}
    </div>
  );
}