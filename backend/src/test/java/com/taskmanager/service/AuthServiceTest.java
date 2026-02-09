package com.taskmanager.service;

import com.taskmanager.dto.AuthRequestDto;
import com.taskmanager.dto.AuthResponseDto;
import com.taskmanager.entity.User;
import com.taskmanager.exception.CustomExceptions.InvalidCredentialsException;
import com.taskmanager.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User user;
    private AuthRequestDto authRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .password("encoded_password")
                .build();

        authRequest = new AuthRequestDto("testuser", "password123");
    }

    @Test
    @DisplayName("Should register a new user successfully")
    void register_ReturnsTokenAndUsername() {
        when(userService.createUser(anyString(), anyString())).thenReturn(user);
        when(jwtUtil.generateToken(eq("testuser"), eq(user.getId()))).thenReturn("jwt_token");

        AuthResponseDto result = authService.register(authRequest);

        assertThat(result.getToken()).isEqualTo("jwt_token");
        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void login_ReturnsTokenWhenCredentialsValid() {
        when(userService.findByUsername("testuser")).thenReturn(user);
        when(userService.checkPassword(user, "password123")).thenReturn(true);
        when(jwtUtil.generateToken(eq("testuser"), eq(user.getId()))).thenReturn("jwt_token");

        AuthResponseDto result = authService.login(authRequest);

        assertThat(result.getToken()).isEqualTo("jwt_token");
        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should throw exception for invalid password")
    void login_ThrowsWhenPasswordInvalid() {
        when(userService.findByUsername("testuser")).thenReturn(user);
        when(userService.checkPassword(user, "password123")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(authRequest))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
