// src/types/kanban.ts

export interface Task {
  id: string; // ou number, selon votre backend
  title: string;
  description?: string;
  status: string; // Correspondra à l'ID de la colonne
  order?: number;
  // Ajoutez d'autres champs si nécessaire (ex: assignee, dueDate, tags)
}

export interface Column {
  id: string; // Ex: "todo", "inprogress", "done"
  title: string;
  tasks: Task[];
}

// Type pour les données du tableau Kanban, si vous préférez une structure de map
export interface KanbanData {
  columns: Record<string, Column>;
  columnOrder: string[]; // Pour maintenir l'ordre des colonnes
}
