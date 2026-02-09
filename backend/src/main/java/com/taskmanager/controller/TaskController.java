package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.TaskDto;
import com.taskmanager.dto.TaskStatsDto;
import com.taskmanager.dto.TaskStatusUpdateDto;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "Get all tasks for the authenticated user")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getAllTasks(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TaskDto> tasks = taskService.getAllTasks(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a task by ID")
    public ResponseEntity<ApiResponse<TaskDto>> getTaskById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskDto task = taskService.getTaskById(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskDto>> createTask(
            @Valid @RequestBody TaskDto taskDto,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskDto createdTask = taskService.createTask(taskDto, principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdTask, "Task created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(
            @PathVariable UUID id,
            @Valid @RequestBody TaskDto taskDto,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskDto updatedTask = taskService.updateTask(id, taskDto, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Task updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task status only")
    public ResponseEntity<ApiResponse<TaskDto>> updateTaskStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TaskStatusUpdateDto statusDto,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskDto updatedTask = taskService.updateTaskStatus(id, statusDto.getStatus(), principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Task status updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        taskService.deleteTask(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get task statistics by status")
    public ResponseEntity<ApiResponse<TaskStatsDto>> getTaskStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskStatsDto stats = taskService.getTaskStats(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
