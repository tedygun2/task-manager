import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useState } from 'react';

const statusColors = {
  TODO: 'default',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
};

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleStatusClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setAnchorEl(null);
  };

  const handleStatusSelect = (status) => {
    onStatusChange(task.id, status);
    handleStatusClose();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" component="h2" gutterBottom>
            {task.title}
          </Typography>
          <Chip
            label={statusLabels[task.status]}
            color={statusColors[task.status]}
            size="small"
            onClick={handleStatusClick}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {task.description || 'No description'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Just now'}
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton size="small" onClick={() => onEdit(task)} aria-label="edit">
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(task)} aria-label="delete" color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusClose}
      >
        <MenuItem onClick={() => handleStatusSelect('TODO')}>To Do</MenuItem>
        <MenuItem onClick={() => handleStatusSelect('IN_PROGRESS')}>In Progress</MenuItem>
        <MenuItem onClick={() => handleStatusSelect('COMPLETED')}>Completed</MenuItem>
      </Menu>
    </Card>
  );
}

export default TaskCard;
