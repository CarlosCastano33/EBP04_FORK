package com.ebp04.backend.service;

import java.util.List;

import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.TaskNotificationResponse;

public interface TaskNotificationService {

    List<TaskNotificationResponse> getNotifications(String correoAutenticado);

    TaskNotificationResponse markAsRead(Long notificationId, String correoAutenticado);

    ApiResponse markAllAsRead(String correoAutenticado);
}
