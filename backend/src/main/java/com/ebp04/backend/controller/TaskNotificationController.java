package com.ebp04.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.TaskNotificationResponse;
import com.ebp04.backend.service.TaskNotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class TaskNotificationController {

    private final TaskNotificationService taskNotificationService;

    @GetMapping
    public ResponseEntity<List<TaskNotificationResponse>> getNotifications(Authentication authentication) {
        String correoAutenticado = authentication.getName();
        List<TaskNotificationResponse> response = taskNotificationService.getNotifications(correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<TaskNotificationResponse> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        TaskNotificationResponse response = taskNotificationService.markAsRead(notificationId, correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(Authentication authentication) {
        String correoAutenticado = authentication.getName();
        ApiResponse response = taskNotificationService.markAllAsRead(correoAutenticado);
        return ResponseEntity.ok(response);
    }
}
