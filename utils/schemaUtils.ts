import { SchemaField } from '../types';

/**
 * Generates a recursive UUID for nodes
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Generates a sample JSON object based on the schema definition
 * to be used in the system prompt.
 */
export const generateExampleJson = (fields: SchemaField[]): any => {
  const result: any = {};

  fields.forEach((field) => {
    switch (field.type) {
      case 'string':
        result[field.key] = field.description || "string_value";
        break;
      case 'number':
        result[field.key] = 0;
        break;
      case 'boolean':
        result[field.key] = true;
        break;
      case 'object':
        result[field.key] = field.children ? generateExampleJson(field.children) : {};
        break;
      case 'array':
        // For array, if it has children, it's an array of objects
        // If no children, we assume array of strings or generic
        if (field.children && field.children.length > 0) {
          result[field.key] = [generateExampleJson(field.children)];
        } else {
          result[field.key] = ["item1", "item2"];
        }
        break;
    }
  });

  return result;
};

/**
 * Recursively updates a node in the schema tree
 */
export const updateSchemaNode = (
  fields: SchemaField[],
  id: string,
  updates: Partial<SchemaField>
): SchemaField[] => {
  return fields.map((field) => {
    if (field.id === id) {
      return { ...field, ...updates };
    }
    if (field.children) {
      return { ...field, children: updateSchemaNode(field.children, id, updates) };
    }
    return field;
  });
};

/**
 * Recursively deletes a node from the schema tree
 */
export const deleteSchemaNode = (fields: SchemaField[], id: string): SchemaField[] => {
  return fields
    .filter((field) => field.id !== id)
    .map((field) => {
      if (field.children) {
        return { ...field, children: deleteSchemaNode(field.children, id) };
      }
      return field;
    });
};

/**
 * Recursively adds a child node to a specific parent
 */
export const addChildNode = (
  fields: SchemaField[],
  parentId: string,
  newNode: SchemaField
): SchemaField[] => {
  return fields.map((field) => {
    if (field.id === parentId) {
      const currentChildren = field.children || [];
      return { ...field, children: [...currentChildren, newNode] };
    }
    if (field.children) {
      return { ...field, children: addChildNode(field.children, parentId, newNode) };
    }
    return field;
  });
};
