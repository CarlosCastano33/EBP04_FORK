package com.ebp04.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.TaskNotificationResponse;
import com.ebp04.backend.entity.TaskNotification;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.exception.ResourceNotFoundException;
import com.ebp04.backend.repository.TaskNotificationRepository;
import com.ebp04.backend.repository.UserRepository;
import com.ebp04.backend.service.TaskNotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskNotificationServiceImpl implements TaskNotificationService {

    private final UserRepository userRepository;
    private final TaskNotificationRepository taskNotificationRepository;

    @Override
    public List<TaskNotificationResponse> getNotifications(String correoAutenticado) {
        User user = userRepository.findByCorreo(correoAutenticado)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro un usuario con el correo proporcionado."));

        return taskNotificationRepository.findByUserIdOrderByFechaCreacionDesc(user.getId())
                .stream()
                .map(this::buildNotificationResponse)
                .toList();
    }

    @Override
    @Transactional
    public TaskNotificationResponse markAsRead(Long notificationId, String correoAutenticado) {
        User user = getUserByCorreo(correoAutenticado);
        TaskNotification notification = getNotificationForUser(notificationId, user.getId());

        notification.setRead(Boolean.TRUE);
        TaskNotification savedNotification = taskNotificationRepository.save(notification);

        return buildNotificationResponse(savedNotification);
    }

    @Override
    @Transactional
    public ApiResponse markAllAsRead(String correoAutenticado) {
        User user = getUserByCorreo(correoAutenticado);
        List<TaskNotification> notifications = taskNotificationRepository.findByUserIdOrderByFechaCreacionDesc(user.getId());

        notifications.forEach(notification -> notification.setRead(Boolean.TRUE));
        taskNotificationRepository.saveAll(notifications);

        return ApiResponse.builder()
                .message("Notificaciones marcadas como leidas.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    private User getUserByCorreo(String correo) {
        return userRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro un usuario con el correo proporcionado."));
    }

    private TaskNotification getNotificationForUser(Long notificationId, Long userId) {
        TaskNotification notification = taskNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro la notificacion solicitada."));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("No se encontro la notificacion solicitada.");
        }

        return notification;
    }

    private TaskNotificationResponse buildNotificationResponse(TaskNotification notification) {
        return TaskNotificationResponse.builder()
                .id(notification.getId())
                .taskId(notification.getTask().getId())
                .message(notification.getMessage())
                .read(notification.getRead())
                .type(notification.getType())
                .timestamp(notification.getFechaCreacion())
                .build();
    }
}
