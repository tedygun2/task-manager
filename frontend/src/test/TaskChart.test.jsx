import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskChart from '../pages/TaskChart';
import { taskApi } from '../services/api';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  taskApi: {
    getStats: vi.fn(),
  },
}));

// Mock Recharts as it doesn't work well in test environment
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const mockStats = {
  todo: 5,
  inProgress: 3,
  completed: 10,
  total: 18,
};

const renderWithProviders = (component) => {
  window.localStorage.getItem.mockReturnValue(JSON.stringify({ username: 'testuser' }));
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('TaskChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    taskApi.getStats.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<TaskChart />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders statistics when loaded', async () => {
    taskApi.getStats.mockResolvedValue({ data: { data: mockStats } });
    renderWithProviders(<TaskChart />);

    await waitFor(() => {
      expect(screen.getByText('Task Statistics')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks: 18')).toBeInTheDocument();
    });
  });

  it('displays correct stat counts', async () => {
    taskApi.getStats.mockResolvedValue({ data: { data: mockStats } });
    renderWithProviders(<TaskChart />);

    await waitFor(() => {
      expect(screen.getByText(/To Do:/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress:/)).toBeInTheDocument();
      expect(screen.getByText(/Completed:/)).toBeInTheDocument();
    });
  });

  it('renders charts when data exists', async () => {
    taskApi.getStats.mockResolvedValue({ data: { data: mockStats } });
    renderWithProviders(<TaskChart />);

    await waitFor(() => {
      expect(screen.getByText('Task Distribution')).toBeInTheDocument();
      expect(screen.getByText('Tasks by Status')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('shows empty state when no tasks', async () => {
    taskApi.getStats.mockResolvedValue({
      data: { data: { todo: 0, inProgress: 0, completed: 0, total: 0 } },
    });
    renderWithProviders(<TaskChart />);

    await waitFor(() => {
      expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    taskApi.getStats.mockRejectedValue(new Error('API Error'));
    renderWithProviders(<TaskChart />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
    });
  });
});
