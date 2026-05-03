package com.ebp04.backend.service;

import com.ebp04.backend.dto.request.LoginRequest;
import com.ebp04.backend.dto.request.RegisterRequest;
import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.AuthResponse;

public interface AuthService {

    ApiResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
