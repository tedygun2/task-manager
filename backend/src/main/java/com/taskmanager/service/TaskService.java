package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.dto.TaskStatsDto;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.exception.CustomExceptions.TaskNotFoundException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TaskDto> getAllTasks(UUID userId) {
        return taskRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskById(UUID taskId, UUID userId) {
        Task task = findTaskByIdAndUser(taskId, userId);
        return toDto(task);
    }

    @Transactional
    public TaskDto createTask(TaskDto taskDto, UUID userId) {
        User user = userRepository.getReferenceById(userId);

        Task task = Task.builder()
                .title(taskDto.getTitle())
                .description(taskDto.getDescription())
                .status(taskDto.getStatus() != null ? taskDto.getStatus() : TaskStatus.TODO)
                .user(user)
                .build();

        Task savedTask = taskRepository.save(task);
        log.info("Task created: {} for user: {}", savedTask.getId(), userId);
        return toDto(savedTask);
    }

    @Transactional
    public TaskDto updateTask(UUID taskId, TaskDto taskDto, UUID userId) {
        Task task = findTaskByIdAndUser(taskId, userId);

        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        if (taskDto.getStatus() != null) {
            task.setStatus(taskDto.getStatus());
        }

        Task updatedTask = taskRepository.save(task);
        log.info("Task updated: {} for user: {}", taskId, userId);
        return toDto(updatedTask);
    }

    @Transactional
    public TaskDto updateTaskStatus(UUID taskId, TaskStatus status, UUID userId) {
        Task task = findTaskByIdAndUser(taskId, userId);
        task.setStatus(status);

        Task updatedTask = taskRepository.save(task);
        log.info("Task status updated: {} to {} for user: {}", taskId, status, userId);
        return toDto(updatedTask);
    }

    @Transactional
    public void deleteTask(UUID taskId, UUID userId) {
        Task task = findTaskByIdAndUser(taskId, userId);
        taskRepository.delete(task);
        log.info("Task deleted: {} for user: {}", taskId, userId);
    }

    @Transactional(readOnly = true)
    public TaskStatsDto getTaskStats(UUID userId) {
        long todo = taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO);
        long inProgress = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long completed = taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED);
        long total = taskRepository.countByUserId(userId);

        return TaskStatsDto.builder()
                .todo(todo)
                .inProgress(inProgress)
                .completed(completed)
                .total(total)
                .build();
    }

    private Task findTaskByIdAndUser(UUID taskId, UUID userId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }

    private TaskDto toDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
