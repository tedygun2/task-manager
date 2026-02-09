package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.taskmanager.dto.TaskDto;
import com.taskmanager.dto.TaskStatsDto;
import com.taskmanager.dto.TaskStatusUpdateDto;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.exception.CustomExceptions.TaskNotFoundException;
import com.taskmanager.exception.GlobalExceptionHandler;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TaskControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TaskService taskService;

    @InjectMocks
    private TaskController taskController;

    private ObjectMapper objectMapper;

    private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private UUID taskId;
    private TaskDto taskDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);

        // Custom argument resolver that provides UserPrincipal
        HandlerMethodArgumentResolver principalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.getParameterType().equals(UserPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return new UserPrincipal(USER_ID, "testuser");
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(taskController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(converter)
                .setCustomArgumentResolvers(principalResolver)
                .build();

        taskId = UUID.randomUUID();

        taskDto = TaskDto.builder()
                .id(taskId)
                .title("Test Task")
                .description("Test Description")
                .status(TaskStatus.TODO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("GET /api/tasks - Returns all tasks")
    void getAllTasks_ReturnsTaskList() throws Exception {
        when(taskService.getAllTasks(USER_ID)).thenReturn(List.of(taskDto));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Test Task"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} - Returns task by ID")
    void getTaskById_ReturnsTask() throws Exception {
        when(taskService.getTaskById(taskId, USER_ID)).thenReturn(taskDto);

        mockMvc.perform(get("/api/tasks/{id}", taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Task"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} - Returns 404 when not found")
    void getTaskById_Returns404WhenNotFound() throws Exception {
        when(taskService.getTaskById(taskId, USER_ID))
                .thenThrow(new TaskNotFoundException(taskId));

        mockMvc.perform(get("/api/tasks/{id}", taskId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("TASK_NOT_FOUND"));
    }

    @Test
    @DisplayName("POST /api/tasks - Creates a new task")
    void createTask_ReturnsCreatedTask() throws Exception {
        TaskDto inputDto = TaskDto.builder()
                .title("New Task")
                .description("Description")
                .build();

        when(taskService.createTask(any(TaskDto.class), eq(USER_ID))).thenReturn(taskDto);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Task created successfully"));
    }

    @Test
    @DisplayName("POST /api/tasks - Returns 400 for invalid input")
    void createTask_Returns400ForInvalidInput() throws Exception {
        TaskDto invalidDto = TaskDto.builder()
                .title("")  // Invalid: empty title
                .build();

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} - Updates a task")
    void updateTask_ReturnsUpdatedTask() throws Exception {
        TaskDto updateDto = TaskDto.builder()
                .title("Updated Task")
                .description("Updated Description")
                .status(TaskStatus.IN_PROGRESS)
                .build();

        when(taskService.updateTask(eq(taskId), any(TaskDto.class), eq(USER_ID)))
                .thenReturn(taskDto);

        mockMvc.perform(put("/api/tasks/{id}", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Task updated successfully"));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/status - Updates task status")
    void updateTaskStatus_ReturnsUpdatedTask() throws Exception {
        TaskStatusUpdateDto statusDto = new TaskStatusUpdateDto(TaskStatus.COMPLETED);

        when(taskService.updateTaskStatus(taskId, TaskStatus.COMPLETED, USER_ID))
                .thenReturn(taskDto);

        mockMvc.perform(patch("/api/tasks/{id}/status", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Task status updated successfully"));
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} - Deletes a task")
    void deleteTask_ReturnsSuccess() throws Exception {
        doNothing().when(taskService).deleteTask(taskId, USER_ID);

        mockMvc.perform(delete("/api/tasks/{id}", taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Task deleted successfully"));
    }

    @Test
    @DisplayName("GET /api/tasks/stats - Returns task statistics")
    void getTaskStats_ReturnsStats() throws Exception {
        TaskStatsDto stats = TaskStatsDto.builder()
                .todo(5)
                .inProgress(3)
                .completed(10)
                .total(18)
                .build();

        when(taskService.getTaskStats(USER_ID)).thenReturn(stats);

        mockMvc.perform(get("/api/tasks/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.todo").value(5))
                .andExpect(jsonPath("$.data.inProgress").value(3))
                .andExpect(jsonPath("$.data.completed").value(10))
                .andExpect(jsonPath("$.data.total").value(18));
    }
}
