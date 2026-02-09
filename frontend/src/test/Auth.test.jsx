import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { AuthProvider } from '../context/AuthContext';
import { authApi } from '../services/api';

vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

const renderWithProviders = (component, initialEntry = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>{component}</AuthProvider>
    </MemoryRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockReturnValue(null);
  });

  it('renders login form', () => {
    renderWithProviders(<Login />);

    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows link to register page', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
  });

  it('calls login API with form data', async () => {
    authApi.login.mockResolvedValue({
      data: { data: { token: 'test-token', username: 'testuser' } },
    });

    renderWithProviders(<Login />);

    const usernameInput = screen.getByRole('textbox');
    const passwordInput = document.querySelector('input[type="password"]');

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    });

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('shows error message on login failure', async () => {
    authApi.login.mockRejectedValue({
      response: { data: { error: { message: 'Invalid credentials' } } },
    });

    renderWithProviders(<Login />);

    const usernameInput = screen.getByRole('textbox');
    const passwordInput = document.querySelector('input[type="password"]');

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockReturnValue(null);
  });

  it('renders registration form', () => {
    renderWithProviders(<Register />);

    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderWithProviders(<Register />);

    const inputs = screen.getAllByRole('textbox');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'newuser' } });
      fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'password456' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('calls register API with matching passwords', async () => {
    authApi.register.mockResolvedValue({
      data: { data: { token: 'test-token', username: 'newuser' } },
    });

    renderWithProviders(<Register />);

    const inputs = screen.getAllByRole('textbox');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'newuser' } });
      fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith('newuser', 'password123');
    });
  });

  it('shows error message on registration failure', async () => {
    authApi.register.mockRejectedValue({
      response: { data: { error: { message: 'Username already exists' } } },
    });

    renderWithProviders(<Register />);

    const inputs = screen.getAllByRole('textbox');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'existinguser' } });
      fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });
});
