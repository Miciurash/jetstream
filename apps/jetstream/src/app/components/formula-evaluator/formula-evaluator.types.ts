const x = false; // here for local dev refresh

export interface FormulaFieldsByType {
  objectFields: string[];
  customLabels: string[];
  apiFields: string[];
  customMetadata: string[];
  organization: string[];
  customPermissions: string[];
  profile: string[];
  customSettings: string[];
  system: string[];
  user: string[];
  userRole: string[];
}

// export interface EntityParticle {
//   Name: string;
//   DataType: string;
//   DeveloperName: string;
//   EntityDefinition: { QualifiedApiName: string };
//   EntityDefinitionId: string;
//   Label: string;
//   QualifiedApiName: string;
//   ReferenceTo?: { referenceTo: [string] };
//   RelationshipName?: string;
// }

// export interface CompletionFieldTree {
//   sobject: string;
//   fields: EntityParticle[];
//   relatedFields: {
//     [field: string]: CompletionFieldTree;
//   };
// }

export interface EntityDefinition {
  Id: string;
  KeyPrefix: string;
  QualifiedApiName: string;
}

export interface CharacterInfo {
  textUntilPosition: string;
  mostRecentCharacter: string;
  range: {
    startLineNumber: number;
    endLineNumber: number;
    startColumn: number;
    endColumn: number;
  };
}

export type SpecialWordType =
  | {
      type: 'api' | 'sobject' | 'customLabel' | 'customMetadata' | 'customSettings' | 'customPermission';
      value: string;
    }
  | { type: 'hardCoded'; value: string[] };

export interface ExternalString {
  Name: string;
  MasterLabel: string;
  NamespacePrefix?: string;
  Value: string;
}

export interface CustomPermission {
  DeveloperName: string;
  MasterLabel: string;
  NamespacePrefix?: string;
  Description: string;
}
