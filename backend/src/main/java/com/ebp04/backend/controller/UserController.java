package com.ebp04.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebp04.backend.dto.request.UpdateUserProfileRequest;
import com.ebp04.backend.dto.response.UserResponse;
import com.ebp04.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        String correoAutenticado = authentication.getName();
        UserResponse response = userService.getMe(correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @Valid @RequestBody UpdateUserProfileRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        UserResponse response = userService.updateMe(request, correoAutenticado);
        return ResponseEntity.ok(response);
    }
}
