export type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface SchemaField {
  id: string;
  key: string;
  type: FieldType;
  description?: string;
  children?: SchemaField[]; // For objects or array of objects
  required?: boolean;
}

export interface PromptState {
  expertise: string;
  template: string;
  schema: SchemaField[];
}
