import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { taskApi } from '../services/api';
import TaskForm from '../components/TaskForm';

const columns = {
  TODO: {
    id: 'TODO',
    title: 'To Do',
    color: '#9e9e9e',
    bgColor: '#f5f5f5',
  },
  IN_PROGRESS: {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    color: '#1976d2',
    bgColor: '#e3f2fd',
  },
  COMPLETED: {
    id: 'COMPLETED',
    title: 'Completed',
    color: '#2e7d32',
    bgColor: '#e8f5e9',
  },
};

function Kanban() {
  const [tasks, setTasks] = useState({
    TODO: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getAll();
      const allTasks = response.data.data;

      const grouped = {
        TODO: allTasks.filter((t) => t.status === 'TODO'),
        IN_PROGRESS: allTasks.filter((t) => t.status === 'IN_PROGRESS'),
        COMPLETED: allTasks.filter((t) => t.status === 'COMPLETED'),
      };

      setTasks(grouped);
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

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    const sourceTasks = [...tasks[sourceColumn]];
    const destTasks = sourceColumn === destColumn ? sourceTasks : [...tasks[destColumn]];

    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceColumn === destColumn) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: sourceTasks,
      }));
    } else {
      const updatedTask = { ...movedTask, status: destColumn };
      destTasks.splice(destination.index, 0, updatedTask);

      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: sourceTasks,
        [destColumn]: destTasks,
      }));

      try {
        await taskApi.updateStatus(draggableId, destColumn);
      } catch (err) {
        setError('Failed to update task status');
        fetchTasks();
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await taskApi.update(editingTask.id, taskData);
      setEditingTask(null);
      setFormOpen(false);
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId, status) => {
    try {
      await taskApi.delete(taskId);
      setTasks((prev) => ({
        ...prev,
        [status]: prev[status].filter((t) => t.id !== taskId),
      }));
    } catch (err) {
      setError('Failed to delete task');
    }
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
      <Typography variant="h4" component="h1" gutterBottom>
        Kanban Board
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            minHeight: 'calc(100vh - 200px)',
          }}
        >
          {Object.values(columns).map((column) => (
            <Paper
              key={column.id}
              sx={{
                minWidth: 300,
                maxWidth: 350,
                flex: 1,
                bgcolor: column.bgColor,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: `3px solid ${column.color}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {column.title}
                </Typography>
                <Chip
                  label={tasks[column.id].length}
                  size="small"
                  sx={{ bgcolor: column.color, color: 'white' }}
                />
              </Box>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      p: 1,
                      flex: 1,
                      minHeight: 200,
                      bgcolor: snapshot.isDraggingOver
                        ? `${column.color}20`
                        : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {tasks[column.id].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              mb: 1,
                              cursor: 'grab',
                              boxShadow: snapshot.isDragging ? 6 : 1,
                              transform: snapshot.isDragging
                                ? 'rotate(3deg)'
                                : 'none',
                              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                              '&:hover': {
                                boxShadow: 3,
                              },
                            }}
                          >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="flex-start"
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="medium"
                                  sx={{ flex: 1, wordBreak: 'break-word' }}
                                >
                                  {task.title}
                                </Typography>
                                <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTask(task);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(task.id, column.id);
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              {task.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mt: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {task.description}
                                </Typography>
                              )}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 1, display: 'block' }}
                              >
                                {task.createdAt
                                  ? new Date(task.createdAt).toLocaleDateString()
                                  : 'Just now'}
                              </Typography>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          ))}
        </Box>
      </DragDropContext>

      <TaskForm
        open={formOpen}
        task={editingTask}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleUpdateTask}
      />
    </Box>
  );
}

export default Kanban;
