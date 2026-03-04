export interface TaskAssignee {
  name: string;
  characterId: string;
  color: string;
}

export interface Task {
  id: string;
  content: string;
  assignedTo?: TaskAssignee;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}
