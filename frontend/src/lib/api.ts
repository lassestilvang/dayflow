import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:3000/api"; // Adjust as needed

// Types
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  rrule?: string;
  created_at: string;
  updated_at: string;
  user: { id: number };
  category?: { id: number; name: string; color?: string };
  subtasks?: Subtask[];
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  task_id: number;
}

export interface Category {
  id: number;
  name: string;
  color?: string;
  created_at: string;
  user: { id: number };
}

// API functions
const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error("Login failed");
  const data = await response.json();
  localStorage.setItem("token", data.token);
  return data;
};

const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Registration failed");
  const data = await response.json();
  localStorage.setItem("token", data.token);
  return data;
};

const fetchTasks = async (): Promise<Task[]> => {
  const token = localStorage.getItem("token");
  console.log("Frontend: Fetching tasks, token present:", token ? "yes" : "no");
  if (!token) {
    throw new Error("No authentication token");
  }
  console.log("Frontend: Sending request with Authorization header");
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Frontend: Response status:", response.status);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
};

const createTask = async (task: Partial<Task>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return response.json();
};

const updateTask = async ({
  id,
  ...task
}: Partial<Task> & { id: number }): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return response.json();
};

const deleteTask = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete task");
};

const fetchCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
};

const createCategory = async (
  category: Partial<Category>
): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Failed to create category");
  return response.json();
};

const updateCategory = async ({
  id,
  ...category
}: Partial<Category> & { id: number }): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Failed to update category");
  return response.json();
};

const deleteCategory = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete category");
};

// React Query hooks
export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};

// Events
export interface Event {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  source?: string;
  external_id?: string;
  rrule?: string;
  created_at: string;
  updated_at: string;
  user: { id: number };
  collaborations?: Collaboration[];
}

export interface CalendarIntegration {
  id: number;
  provider: string;
  created_at: string;
  updated_at: string;
}

const fetchEvents = async (): Promise<Event[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }
  const response = await fetch(`${API_BASE_URL}/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
};

const createEvent = async (event: Partial<Event>): Promise<Event> => {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error("Failed to create event");
  return response.json();
};

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Calendar integrations
const fetchCalendarIntegrations = async (): Promise<CalendarIntegration[]> => {
  const response = await fetch(`${API_BASE_URL}/calendars`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch calendar integrations");
  return response.json();
};

const initiateCalendarAuth = async (
  provider: string
): Promise<{ url: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/calendars/initiate/${provider}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to initiate calendar auth");
  return response.json();
};

const disconnectCalendar = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/calendars/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to disconnect calendar");
};

const syncCalendars = async (): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/calendars/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to sync calendars");
  return response.json();
};

export const useCalendarIntegrations = () => {
  return useQuery({
    queryKey: ["calendarIntegrations"],
    queryFn: fetchCalendarIntegrations,
  });
};

export const useInitiateCalendarAuth = () => {
  return useMutation({
    mutationFn: initiateCalendarAuth,
  });
};

export const useDisconnectCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarIntegrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useSyncCalendars = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncCalendars,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Task imports
export interface TaskImport {
  id: number;
  provider: "notion" | "clickup" | "linear" | "todoist";
  created_at: string;
  updated_at: string;
}

export interface ImportHistory {
  id: number;
  provider: "notion" | "clickup" | "linear" | "todoist";
  imported_at: string;
  tasks_imported: number;
  tasks_skipped: number;
  status: "success" | "partial" | "failed";
  error_message?: string;
}

export interface Collaboration {
  id: number;
  role: "read" | "write" | "admin";
  invited_at: string;
  user: { id: number; name: string; email: string };
  task?: Task;
  event?: Event;
}

const fetchTaskImports = async (): Promise<TaskImport[]> => {
  const response = await fetch(`${API_BASE_URL}/task-imports`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch task imports");
  return response.json();
};

const createTaskImport = async (data: {
  provider: string;
  credentials: string;
}): Promise<TaskImport> => {
  const response = await fetch(`${API_BASE_URL}/task-imports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create task import");
  return response.json();
};

const updateTaskImport = async ({
  id,
  ...taskImport
}: Partial<TaskImport> & { id: number }): Promise<TaskImport> => {
  const response = await fetch(`${API_BASE_URL}/task-imports/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(taskImport),
  });
  if (!response.ok) throw new Error("Failed to update task import");
  return response.json();
};

const deleteTaskImport = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/task-imports/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete task import");
};

const importTasks = async (
  importId: number
): Promise<{ message: string; imported: number; skipped: number }> => {
  const response = await fetch(`${API_BASE_URL}/import/${importId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to import tasks");
  return response.json();
};

const fetchImportHistory = async (): Promise<ImportHistory[]> => {
  const response = await fetch(`${API_BASE_URL}/import/history`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch import history");
  return response.json();
};

export const useTaskImports = () => {
  return useQuery({
    queryKey: ["taskImports"],
    queryFn: fetchTaskImports,
  });
};

export const useCreateTaskImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTaskImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskImports"] });
    },
  });
};

export const useUpdateTaskImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTaskImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskImports"] });
    },
  });
};

export const useDeleteTaskImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTaskImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskImports"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useImportTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["importHistory"] });
    },
  });
};

export const useImportHistory = () => {
  return useQuery({
    queryKey: ["importHistory"],
    queryFn: fetchImportHistory,
  });
};

// Collaborations
const fetchCollaborations = async (): Promise<Collaboration[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token");
  }
  const response = await fetch(`${API_BASE_URL}/collaborations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch collaborations");
  return response.json();
};

const createCollaboration = async (data: {
  resource_type: "task" | "event";
  resource_id: number;
  collaborator_email: string;
  role: "read" | "write" | "admin";
}): Promise<Collaboration> => {
  const response = await fetch(`${API_BASE_URL}/collaborations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create collaboration");
  return response.json();
};

const deleteCollaboration = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/collaborations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete collaboration");
};

export const useCollaborations = () => {
  return useQuery({
    queryKey: ["collaborations"],
    queryFn: fetchCollaborations,
  });
};

export const useCreateCollaboration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCollaboration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useDeleteCollaboration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCollaboration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// NLP and Scheduling
export interface ParsedTask {
  title: string;
  description?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
  isEvent?: boolean;
  start_time?: string;
  end_time?: string;
  location?: string;
  rrule?: string;
}

export interface SchedulingSuggestion {
  suggestedTime: {
    start: string;
    end: string;
  };
  reason: string;
  confidence: number;
}

const parseNLP = async (input: string): Promise<ParsedTask> => {
  const response = await fetch(`${API_BASE_URL}/tasks/parse-nlp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) throw new Error("Failed to parse NLP input");
  return response.json();
};

const createFromNLP = async (
  input: string
): Promise<{ type: "task" | "event"; data: Task | Event }> => {
  const response = await fetch(`${API_BASE_URL}/tasks/create-from-nlp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) throw new Error("Failed to create from NLP");
  return response.json();
};

const getSchedulingSuggestions = async (data: {
  start_time: string;
  end_time: string;
  duration_minutes?: number;
}): Promise<SchedulingSuggestion[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks/scheduling-suggestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to get scheduling suggestions");
  return response.json();
};

export const useParseNLP = () => {
  return useMutation({
    mutationFn: parseNLP,
  });
};

export const useCreateFromNLP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFromNLP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useSchedulingSuggestions = () => {
  return useMutation({
    mutationFn: getSchedulingSuggestions,
  });
};
