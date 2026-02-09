import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/TaskForm';

describe('TaskForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form when no task provided', () => {
    render(
      <TaskForm open={true} task={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('renders edit form when task provided', () => {
    const task = {
      title: 'Existing Task',
      description: 'Existing Description',
      status: 'IN_PROGRESS',
    };

    render(
      <TaskForm open={true} task={task} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
  });

  it('shows character count for title', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm open={true} task={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await user.type(titleInput, 'Test');

    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm open={true} task={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'New Task');
    await user.type(screen.getByRole('textbox', { name: /description/i }), 'New Description');

    const submitButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        status: 'TODO',
      });
    });
  });

  it('calls onClose when Cancel clicked', () => {
    render(
      <TaskForm open={true} task={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
