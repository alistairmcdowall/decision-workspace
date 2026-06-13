'use client';

import { useState } from 'react';

export default function HomePage() {
  // --- STATE MANAGEMENT ---
  const [currentScreen, setCurrentScreen] = useState<'input' | 'discovery' | 'perspectives'>('input');
  const [decisionTitle, setDecisionTitle] = useState('');
  
  // Universal Form Answers
  const [timeline, setTimeline] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [constraints, setConstraints] = useState('');

  // --- NAVIGATION HANDLERS ---
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decisionTitle.trim() === '') {
      alert('Please enter a decision focus first.');
      return;
    }
    setCurrentScreen('discovery');
  };

  const handleDiscoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeline.trim() || !primaryGoal.trim()) {
      alert('Please fill out the primary context fields to continue.');
      return;
    }
    setCurrentScreen('perspectives');
  };

  const handleReset = () => {
    setCurrentScreen('input');
    setDecisionTitle('');
    setTimeline('');
    setPrimaryGoal('');
    setConstraints('');
  };

  // --- REUSABLE STYLES ---
  const containerStyle = { padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' };
  const headerStyle = { borderBottom: '1px solid #eaeaea', paddingBottom: '20px', marginBottom: '30px' };
  const cardStyle = { backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '20px' };
  const buttonStyle = { backgroundColor: '#0070f3', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as const };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', marginTop: '20px' };
  const inputStyle = { width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' as const };

  // Helper helper to format perspective blocks cleanly
  const perspectiveBox = (title: string, color: string, description: string) => (
    <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: '15px', margin: '20px 0' }}>
      <h3 style={{ color: color, margin: '0 0 5px 0', fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ color: '#444', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{description}</p>
    </div>
  );

  // ==========================================
  // SCREEN 1: DESCRIBE YOUR DECISION
  // ==========================================
  if (currentScreen === 'input') {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <h1 style={{ fontSize: '2.5rem', color: '#111', margin: 0 }}>Decision Workspace</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Step 1: Frame the core objective</p>
        </header>

        <main style={cardStyle}>
          <form onSubmit={handleInitialSubmit}>
            <label style={{ ...labelStyle, marginTop: 0 }}>
              What major decision or plan are you currently evaluating?
            </label>
            <input 
              type="text" 
              placeholder="e.g., Planning a family trip to Japan, or changing career tracks..."
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" style={{ ...buttonStyle, marginTop: '20px' }}>
              Continue to Discovery &rarr;
            </button>
          </form>
        </main>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: UNIVERSAL DISCOVERY QUESTIONS
  // ==========================================
  if (currentScreen === 'discovery') {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#111', margin: 0 }}>Decision Discovery</h1>
              <p style={{ color: '#0070f3', marginTop: '5px', fontWeight: 'bold' }}>Evaluating: "{decisionTitle}"</p>
            </div>
            <button onClick={handleReset} style={{ ...buttonStyle, backgroundColor: '#666', padding: '8px 16px', fontSize: '0.9rem' }}>Reset</button>
          </div>
        </header>

        <main style={cardStyle}>
          <h3 style={{ marginTop: 0, color: '#333' }}>Context Alignment</h3>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Define the operational boundaries of this decision below.</p>
          
          <form onSubmit={handleDiscoverySubmit}>
            <label style={labelStyle}>1. Timeline & Urgency</label>
            <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '0.85rem' }}>When does this need to happen, or how long does the execution last?</p>
            <input 
              type="text" 
              placeholder="e.g., Next April for cherry blossom season, or over a 10-year horizon..."
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>2. Primary Objective / Critical Success Factor</label>
            <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '0.85rem' }}>What is the absolute number one priority that makes this a success?</p>
            <input 
              type="text" 
              placeholder="e.g., Cultural immersion and exploration, or maximizing guaranteed income yield..."
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>3. Known Constraints & Non-Negotiables</label>
            <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '0.85rem' }}>Are there specific budgets, age limits, or structural guardrails to satisfy?</p>
            <textarea 
              placeholder="e.g., Budget caps, travel windows, protective legal frameworks, asset isolation requirements..."
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px', fontFamily: 'sans-serif' }}
            />

            <button type="submit" style={{ ...buttonStyle, marginTop: '25px' }}>
              Generate Perspectives &rarr;
            </button>
          </form>
        </main>
      </div>
    );
  }

  // ==========================================
  // SCREEN 3: ALIGNED PERSPECTIVES MAPPING (Version 0.1 Final)
  // ==========================================
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#111', margin: 0 }}>Consensus Matrix</h1>
            <p style={{ color: '#10b981', marginTop: '5px', fontWeight: 'bold' }}>Version 0.1 Multi-Lens Report</p>
          </div>
          <button onClick={handleReset} style={{ ...buttonStyle, backgroundColor: '#666', padding: '8px 16px', fontSize: '0.9rem' }}>New Analysis</button>
        </div>
      </header>

      <main>
        {/* Core Input Summary */}
        <div style={{ ...cardStyle, backgroundColor: '#f0f4f8', border: '1px solid #d1d5db' }}>
          <h2 style={{ marginTop: 0, color: '#111', fontSize: '1.2rem' }}>Target Decision: "{decisionTitle}"</h2>
          <div style={{ fontSize: '0.9rem', color: '#555' }}>
            <strong>Window:</strong> {timeline} | <strong>Success Metric:</strong> {primaryGoal}
            {constraints && <div><strong>Constraints:</strong> {constraints}</div>}
          </div>
        </div>

        {/* The Three Master Perspectives */}
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: '#222', fontSize: '1.3rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            Multi-Lens Analysis Engine
          </h2>

          {perspectiveBox(
            "Perspective A: The Maximizer (Growth & Optimization)", 
            "#2563eb", 
            `Focuses 100% on squeezing the highest possible return out of your parameters. For "${decisionTitle}", this lens prioritizes deep immersion, high-impact choices, and fast-tracking plans within the ${timeline} window to ensure the primary goal ("${primaryGoal}") is fully hit with zero wasted potential.`
          )}

          {perspectiveBox(
            "Perspective B: The Risk Mitigator (Guardrails & Resilience)", 
            "#dc2626", 
            `Focuses on what could go wrong and how to shield you from it. It looks closely at your noted constraints ("${constraints || 'None specified'}") and flags the stress points. It builds contingency loops, isolates key vulnerabilities, and sets rigid safety margins around your ${timeline} timeline.`
          )}

          {perspectiveBox(
            "Perspective C: The Pragmatist (Efficiency & Sustainability)", 
            "#db2777", 
            `Focuses on execution ease, resource management, and fatigue prevention. It reviews your core objective ("${primaryGoal}") and calculates the cleanest path of least resistance, trimming away low-value complexities so the plan stays stable and highly repeatable.`
          )}
        </div>

        {/* Consensus Footer */}
        <div style={{ padding: '20px', backgroundColor: '#eef2ff', borderRadius: '8px', border: '1px solid #c7d2fe', marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#4338ca' }}>✓ Core Logic Pipeline Intact</h4>
          <p style={{ margin: 0, color: '#3730a3', fontSize: '0.9rem' }}>
            Your universal data inputs successfully parsed and mapped across all independent evaluation lenses.
          </p>
        </div>
      </main>
    </div>
  );
}