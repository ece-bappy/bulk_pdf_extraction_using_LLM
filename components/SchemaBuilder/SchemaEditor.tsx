import React from 'react';
import { SchemaField } from '../../types';
import { SchemaItem } from './SchemaItem';
import { generateId } from '../../utils/schemaUtils';
import { Button } from '../ui/Button';

interface SchemaEditorProps {
  schema: SchemaField[];
  onChange: (newSchema: SchemaField[]) => void;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({ schema, onChange }) => {
  // Helper to traverse and update the tree
  const updateNode = (id: string, updates: Partial<SchemaField>) => {
    const updateRecursive = (nodes: SchemaField[]): SchemaField[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, ...updates };
        }
        if (node.children) {
          return { ...node, children: updateRecursive(node.children) };
        }
        return node;
      });
    };
    onChange(updateRecursive(schema));
  };

  // Helper to delete a node
  const deleteNode = (id: string) => {
    const deleteRecursive = (nodes: SchemaField[]): SchemaField[] => {
      return nodes
        .filter(node => node.id !== id)
        .map(node => {
          if (node.children) {
            return { ...node, children: deleteRecursive(node.children) };
          }
          return node;
        });
    };
    onChange(deleteRecursive(schema));
  };

  // Helper to add a child to a specific node
  const addChildToNode = (parentId: string, newNode: SchemaField) => {
    const addRecursive = (nodes: SchemaField[]): SchemaField[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
          return { ...node, children: addRecursive(node.children) };
        }
        return node;
      });
    };
    onChange(addRecursive(schema));
  };

  // Add a top-level root item
  const addRootItem = () => {
    const newItem: SchemaField = {
      id: generateId(),
      key: 'new_property',
      type: 'string',
      description: 'Description'
    };
    onChange([...schema, newItem]);
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          Response Schema Structure
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addRootItem}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
        >
          Add Root Key
        </Button>
      </div>
      
      <div className="p-0 min-h-[200px] bg-white overflow-x-auto">
        {schema.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
            <p>No fields defined yet.</p>
            <p>Add a root property to start building your JSON schema.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {schema.map(field => (
              <SchemaItem
                key={field.id}
                field={field}
                depth={0}
                onUpdate={updateNode}
                onDelete={deleteNode}
                onAddChild={addChildToNode}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex gap-4">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Object</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div>Array</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Number</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Boolean</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div>String</div>
      </div>
    </div>
  );
};