package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.dto.TaskStatsDto;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.exception.CustomExceptions.TaskNotFoundException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private UUID userId;
    private UUID taskId;
    private User user;
    private Task task;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        taskId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .username("testuser")
                .password("encoded_password")
                .build();

        task = Task.builder()
                .id(taskId)
                .title("Test Task")
                .description("Test Description")
                .status(TaskStatus.TODO)
                .user(user)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return all tasks for a user")
    void getAllTasks_ReturnsTaskList() {
        when(taskRepository.findByUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(task));

        List<TaskDto> result = taskService.getAllTasks(userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Task");
        verify(taskRepository).findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Test
    @DisplayName("Should return task by ID")
    void getTaskById_ReturnsTask() {
        when(taskRepository.findByIdAndUserId(taskId, userId))
                .thenReturn(Optional.of(task));

        TaskDto result = taskService.getTaskById(taskId, userId);

        assertThat(result.getId()).isEqualTo(taskId);
        assertThat(result.getTitle()).isEqualTo("Test Task");
    }

    @Test
    @DisplayName("Should throw exception when task not found")
    void getTaskById_ThrowsWhenNotFound() {
        when(taskRepository.findByIdAndUserId(taskId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById(taskId, userId))
                .isInstanceOf(TaskNotFoundException.class);
    }

    @Test
    @DisplayName("Should create a new task")
    void createTask_ReturnsCreatedTask() {
        TaskDto inputDto = TaskDto.builder()
                .title("New Task")
                .description("New Description")
                .build();

        when(userRepository.getReferenceById(userId)).thenReturn(user);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task savedTask = invocation.getArgument(0);
            savedTask.setId(taskId);
            savedTask.setCreatedAt(LocalDateTime.now());
            return savedTask;
        });

        TaskDto result = taskService.createTask(inputDto, userId);

        assertThat(result.getTitle()).isEqualTo("New Task");
        assertThat(result.getStatus()).isEqualTo(TaskStatus.TODO);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("Should update an existing task")
    void updateTask_ReturnsUpdatedTask() {
        TaskDto updateDto = TaskDto.builder()
                .title("Updated Title")
                .description("Updated Description")
                .status(TaskStatus.IN_PROGRESS)
                .build();

        when(taskRepository.findByIdAndUserId(taskId, userId))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskDto result = taskService.updateTask(taskId, updateDto, userId);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("Should update task status only")
    void updateTaskStatus_ReturnsUpdatedTask() {
        when(taskRepository.findByIdAndUserId(taskId, userId))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskDto result = taskService.updateTaskStatus(taskId, TaskStatus.COMPLETED, userId);

        assertThat(task.getStatus()).isEqualTo(TaskStatus.COMPLETED);
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("Should delete a task")
    void deleteTask_DeletesSuccessfully() {
        when(taskRepository.findByIdAndUserId(taskId, userId))
                .thenReturn(Optional.of(task));

        taskService.deleteTask(taskId, userId);

        verify(taskRepository).delete(task);
    }

    @Test
    @DisplayName("Should return task statistics")
    void getTaskStats_ReturnsStats() {
        when(taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO)).thenReturn(5L);
        when(taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS)).thenReturn(3L);
        when(taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED)).thenReturn(10L);
        when(taskRepository.countByUserId(userId)).thenReturn(18L);

        TaskStatsDto result = taskService.getTaskStats(userId);

        assertThat(result.getTodo()).isEqualTo(5);
        assertThat(result.getInProgress()).isEqualTo(3);
        assertThat(result.getCompleted()).isEqualTo(10);
        assertThat(result.getTotal()).isEqualTo(18);
    }
}
