import React, { useState } from 'react';
import { SchemaField, PromptState } from './types';
import { generateId } from './utils/schemaUtils';
import { PromptArchitect } from './components/PromptArchitect';
import { Home } from './components/Home';
import { Landing } from './components/Landing';

// Default Initial State
const INITIAL_SCHEMA: SchemaField[] = [
  {
    id: generateId(),
    key: 'metadata',
    type: 'object',
    description: 'Article citation and metadata',
    children: [
      { id: generateId(), key: 'title', type: 'string', description: 'Full title of the paper' },
      { id: generateId(), key: 'publication_date', type: 'string', description: 'ISO Date or Year' },
      {
        id: generateId(),
        key: 'authors',
        type: 'array',
        description: 'List of contributing authors',
        children: [
           { id: generateId(), key: 'author_profile', type: 'object', description: 'Author details', children: [
             { id: generateId(), key: 'name', type: 'string', description: 'Full name' },
             { id: generateId(), key: 'affiliation', type: 'string', description: 'University or Institute' }
           ]}
        ]
      }
    ]
  },
  {
    id: generateId(),
    key: 'results',
    type: 'object',
    description: 'Experimental findings extracted from text',
    children: [
      { id: generateId(), key: 'sample_size', type: 'number', description: 'Total participants/samples' },
      {
        id: generateId(),
        key: 'quantitative_data',
        type: 'array',
        description: 'Key metrics reported',
        children: [
          { 
            id: generateId(), 
            key: 'metric', 
            type: 'object',
            description: 'Single data point',
            children: [
               { id: generateId(), key: 'measure_name', type: 'string', description: 'e.g. Accuracy, AUC' },
               { id: generateId(), key: 'value', type: 'number', description: 'Reported value' },
               { id: generateId(), key: 'confidence_interval', type: 'string', description: '95% CI if available' }
            ] 
          }
        ]
      }
    ]
  },
  {
    id: generateId(),
    key: 'analysis',
    type: 'object',
    description: 'Interpretation of findings',
    children: [
       { id: generateId(), key: 'primary_conclusion', type: 'string', description: 'Main takeaway' },
       { 
         id: generateId(), 
         key: 'limitations', 
         type: 'array', 
         description: 'Study limitations',
         children: [
           { id: generateId(), key: 'limitation_desc', type: 'string', description: 'Description of limitation' }
         ]
       }
    ]
  }
];

const INITIAL_TEMPLATE = `Your goal is to extract specific data from the provided research articles regarding {{researchTopic}}.

Carefully read the text and extract information to populate the JSON schema defined below.
Ensure all extracted data is explicitly stated in the article.`;

type View = 'landing' | 'home' | 'architect';

function App() {
  const [view, setView] = useState<View>('landing');
  
  const [state, setState] = useState<PromptState>({
    expertise: 'Scientific Research Analysis',
    template: INITIAL_TEMPLATE,
    schema: INITIAL_SCHEMA
  });

  return (
    <div className="h-full w-full relative">
      {/* Landing View */}
      <div className={`h-full w-full absolute inset-0 overflow-y-auto bg-slate-50 ${view === 'landing' ? 'z-30 block' : 'z-0 hidden'}`}>
        <Landing onGetStarted={() => setView('home')} />
      </div>

      {/* Home View */}
      {/* We use visibility hidden/block instead of conditional rendering to preserve state */}
      <div className={`h-full w-full absolute inset-0 ${view === 'home' ? 'z-10 block' : 'z-0 hidden'}`}>
        <Home 
          promptState={state} 
          onEditPrompt={() => setView('architect')} 
        />
      </div>
      
      {/* Architect View */}
      <div className={`h-full w-full absolute inset-0 ${view === 'architect' ? 'z-20 block' : 'z-0 hidden'}`}>
        <PromptArchitect 
          state={state} 
          setState={setState} 
          onBack={() => setView('home')} 
        />
      </div>
    </div>
  );
}

export default App;