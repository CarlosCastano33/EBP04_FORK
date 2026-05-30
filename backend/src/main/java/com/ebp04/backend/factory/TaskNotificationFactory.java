package com.ebp04.backend.factory;

import org.springframework.stereotype.Component;

import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.TaskNotification;
import com.ebp04.backend.entity.TaskNotificationType;
import com.ebp04.backend.entity.User;

@Component
public class TaskNotificationFactory {

    public TaskNotification createTaskAssignedNotification(HouseholdTask task, User assignedUser) {
        return TaskNotification.builder()
                .user(assignedUser)
                .task(task)
                .message("Se te ha asignado la tarea: " + task.getNombre())
                .read(Boolean.FALSE)
                .type(TaskNotificationType.TASK_ASSIGNED)
                .build();
    }

    public TaskNotification createTaskAcceptedNotification(HouseholdTask task) {
        return TaskNotification.builder()
                .user(task.getCreadoPor())
                .task(task)
                .message("La tarea fue aceptada: " + task.getNombre())
                .read(Boolean.FALSE)
                .type(TaskNotificationType.TASK_ACCEPTED)
                .build();
    }
}
