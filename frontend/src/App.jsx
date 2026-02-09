import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskList from './pages/TaskList';
import TaskChart from './pages/TaskChart';
import Kanban from './pages/Kanban';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          {user && (
            <>
              <Button color="inherit" href="/tasks">
                Tasks
              </Button>
              <Button color="inherit" href="/kanban">
                Kanban
              </Button>
              <Button color="inherit" href="/charts">
                Charts
              </Button>
              <Typography variant="body2" sx={{ mx: 2 }}>
                {user.username}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flex: 1, py: 4 }} maxWidth="xl">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/tasks" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/tasks" />} />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TaskList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <Kanban />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charts"
            element={
              <ProtectedRoute>
                <TaskChart />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={user ? '/tasks' : '/login'} />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
