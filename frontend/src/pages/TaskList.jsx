import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { taskApi } from '../services/api';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getAll();
      setTasks(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === statusFilter));
    }
  }, [tasks, statusFilter]);

  const handleCreateTask = async (taskData) => {
    try {
      const response = await taskApi.create(taskData);
      setTasks((prev) => [response.data.data, ...prev]);
      setFormOpen(false);
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await taskApi.update(editingTask.id, taskData);
      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? response.data.data : task))
      );
      setEditingTask(null);
      setFormOpen(false);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const response = await taskApi.updateStatus(taskId, status);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.data.data : task))
      );
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await taskApi.delete(deleteDialog.task.id);
      setTasks((prev) => prev.filter((task) => task.id !== deleteDialog.task.id));
      setDeleteDialog({ open: false, task: null });
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Tasks
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {filteredTasks.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          {statusFilter === 'ALL'
            ? 'No tasks yet. Create your first task!'
            : 'No tasks with this status.'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <TaskCard
                task={task}
                onEdit={handleEditClick}
                onDelete={(task) => setDeleteDialog({ open: true, task })}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <TaskForm
        open={formOpen}
        task={editingTask}
        onClose={handleFormClose}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, task: null })}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{deleteDialog.task?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, task: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TaskList;
