import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskList from '../pages/TaskList';
import { taskApi } from '../services/api';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  taskApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Description 1',
    status: 'TODO',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Description 2',
    status: 'IN_PROGRESS',
    createdAt: '2024-01-02T00:00:00',
  },
];

const renderWithProviders = (component) => {
  window.localStorage.getItem.mockReturnValue(JSON.stringify({ username: 'testuser' }));
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('TaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    taskApi.getAll.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<TaskList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders tasks when loaded', async () => {
    taskApi.getAll.mockResolvedValue({ data: { data: mockTasks } });
    renderWithProviders(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('renders empty state when no tasks', async () => {
    taskApi.getAll.mockResolvedValue({ data: { data: [] } });
    renderWithProviders(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
    });
  });

  it('opens create task dialog when Add Task clicked', async () => {
    taskApi.getAll.mockResolvedValue({ data: { data: [] } });
    renderWithProviders(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Add Task')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Task'));
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    taskApi.getAll.mockRejectedValue(new Error('API Error'));
    renderWithProviders(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });
  });
});
