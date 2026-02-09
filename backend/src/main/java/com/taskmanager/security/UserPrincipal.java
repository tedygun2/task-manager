package com.taskmanager.security;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class UserPrincipal {
    private UUID userId;
    private String username;
}
