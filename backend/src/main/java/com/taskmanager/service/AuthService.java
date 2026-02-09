package com.taskmanager.service;

import com.taskmanager.dto.AuthRequestDto;
import com.taskmanager.dto.AuthResponseDto;
import com.taskmanager.entity.User;
import com.taskmanager.exception.CustomExceptions.InvalidCredentialsException;
import com.taskmanager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthResponseDto register(AuthRequestDto request) {
        User user = userService.createUser(request.getUsername(), request.getPassword());
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());

        log.info("User registered successfully: {}", user.getUsername());
        return AuthResponseDto.builder()
                .token(token)
                .username(user.getUsername())
                .build();
    }

    public AuthResponseDto login(AuthRequestDto request) {
        User user = userService.findByUsername(request.getUsername());

        if (!userService.checkPassword(user, request.getPassword())) {
            log.warn("Invalid login attempt for user: {}", request.getUsername());
            throw new InvalidCredentialsException();
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getId());

        log.info("User logged in successfully: {}", user.getUsername());
        return AuthResponseDto.builder()
                .token(token)
                .username(user.getUsername())
                .build();
    }
}
