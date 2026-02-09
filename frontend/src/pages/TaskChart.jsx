import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { taskApi } from '../services/api';

const COLORS = {
  todo: '#9e9e9e',
  inProgress: '#1976d2',
  completed: '#2e7d32',
};

function TaskChart() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await taskApi.getStats();
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const pieData = [
    { name: 'To Do', value: stats.todo, color: COLORS.todo },
    { name: 'In Progress', value: stats.inProgress, color: COLORS.inProgress },
    { name: 'Completed', value: stats.completed, color: COLORS.completed },
  ].filter((item) => item.value > 0);

  const barData = [
    { name: 'To Do', count: stats.todo, fill: COLORS.todo },
    { name: 'In Progress', count: stats.inProgress, fill: COLORS.inProgress },
    { name: 'Completed', count: stats.completed, fill: COLORS.completed },
  ];

  const hasData = stats.total > 0;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Task Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom textAlign="center">
              Total Tasks: {stats.total}
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Typography color="text.secondary">
                  To Do: <strong>{stats.todo}</strong>
                </Typography>
              </Grid>
              <Grid item>
                <Typography color="primary">
                  In Progress: <strong>{stats.inProgress}</strong>
                </Typography>
              </Grid>
              <Grid item>
                <Typography color="success.main">
                  Completed: <strong>{stats.completed}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {hasData ? (
          <>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Task Distribution
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Tasks by Status
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No tasks yet. Create some tasks to see statistics!
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default TaskChart;
