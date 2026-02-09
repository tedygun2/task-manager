package com.taskmanager.exception;

import java.util.UUID;

public class CustomExceptions {

    public static class TaskNotFoundException extends RuntimeException {
        public TaskNotFoundException(UUID id) {
            super("Task with ID " + id + " not found");
        }
    }

    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String username) {
            super("User with username '" + username + "' not found");
        }
    }

    public static class UsernameAlreadyExistsException extends RuntimeException {
        public UsernameAlreadyExistsException(String username) {
            super("Username '" + username + "' already exists");
        }
    }

    public static class ValidationException extends RuntimeException {
        public ValidationException(String message) {
            super(message);
        }
    }

    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException() {
            super("Invalid username or password");
        }
    }
}
