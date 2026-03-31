import React from 'react';
import { SchemaField, FieldType } from '../../types';
import { Button } from '../ui/Button';
import { generateId } from '../../utils/schemaUtils';

interface SchemaItemProps {
  field: SchemaField;
  depth: number;
  onUpdate: (id: string, updates: Partial<SchemaField>) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string, node: SchemaField) => void;
}

export const SchemaItem: React.FC<SchemaItemProps> = ({
  field,
  depth,
  onUpdate,
  onDelete,
  onAddChild
}) => {
  const isContainer = field.type === 'object' || field.type === 'array';
  const paddingLeft = depth * 24; // Indentation

  const handleAddChild = () => {
    const newNode: SchemaField = {
      id: generateId(),
      key: 'new_field',
      type: 'string',
      description: 'Description',
      required: true
    };
    onAddChild(field.id, newNode);
  };

  return (
    <div className="flex flex-col">
      {/* Row Content */}
      <div 
        className={`group flex items-center gap-2 py-2 pr-2 border-b border-slate-100 hover:bg-slate-50 transition-colors ${depth === 0 ? 'bg-slate-50/50' : ''}`}
        style={{ paddingLeft: `${Math.max(paddingLeft, 8)}px` }}
      >
        {/* Type Indicator Icon */}
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          field.type === 'object' ? 'bg-purple-500' :
          field.type === 'array' ? 'bg-orange-500' :
          field.type === 'number' ? 'bg-blue-500' :
          field.type === 'boolean' ? 'bg-green-500' :
          'bg-slate-400'
        }`} />

        {/* Key Input */}
        <input
          type="text"
          value={field.key}
          onChange={(e) => onUpdate(field.id, { key: e.target.value })}
          className="bg-transparent border-none p-1 text-sm font-mono text-slate-900 focus:ring-1 focus:ring-primary-500 rounded w-32 hover:bg-white transition-colors"
          placeholder="key_name"
        />

        <span className="text-slate-400 text-xs font-mono">:</span>

        {/* Type Select */}
        <div className="relative group/select">
          <select
            value={field.type}
            onChange={(e) => onUpdate(field.id, { type: e.target.value as FieldType })}
            className="appearance-none bg-transparent text-xs font-medium text-slate-500 uppercase cursor-pointer hover:text-primary-600 py-1 pr-4 focus:outline-none"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
          </select>
        </div>

        {/* Description Input */}
        <input
          type="text"
          value={field.description || ''}
          onChange={(e) => onUpdate(field.id, { description: e.target.value })}
          className="flex-1 bg-transparent text-xs text-slate-500 placeholder-slate-300 p-1 focus:ring-1 focus:ring-primary-500 rounded hover:bg-white transition-colors min-w-[100px]"
          placeholder="Description (optional)"
        />

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isContainer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddChild}
              title="Add Child Field"
              className="h-6 w-6 p-0"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              }
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(field.id)}
            title="Remove Field"
            className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            }
          />
        </div>
      </div>

      {/* Recursive Children */}
      {isContainer && field.children && field.children.length > 0 && (
        <div className="flex flex-col">
           {field.children.map((child) => (
             <SchemaItem
               key={child.id}
               field={child}
               depth={depth + 1}
               onUpdate={onUpdate}
               onDelete={onDelete}
               onAddChild={onAddChild}
             />
           ))}
        </div>
      )}
    </div>
  );
};
