package com.ebp04.backend.facade;

import org.springframework.stereotype.Component;

import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.TaskNotification;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.factory.TaskNotificationFactory;
import com.ebp04.backend.repository.TaskNotificationRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TaskNotificationFacade {

    private final TaskNotificationFactory taskNotificationFactory;
    private final TaskNotificationRepository taskNotificationRepository;

    public void notifyTaskAssigned(HouseholdTask task, User assignedUser) {
        TaskNotification notification = taskNotificationFactory.createTaskAssignedNotification(task, assignedUser);
        taskNotificationRepository.save(notification);
    }

    public void notifyTaskAccepted(HouseholdTask task) {
        TaskNotification notification = taskNotificationFactory.createTaskAcceptedNotification(task);
        taskNotificationRepository.save(notification);
    }

    public void notifyTaskCompleted(HouseholdTask task) {
        TaskNotification notification = taskNotificationFactory.createTaskCompletedNotification(task);
        taskNotificationRepository.save(notification);
    }

    public void notifyTaskVerified(HouseholdTask task) {
        if (task.getAsignadoA() == null) {
            return;
        }

        TaskNotification notification = taskNotificationFactory.createTaskVerifiedNotification(task);
        taskNotificationRepository.save(notification);
    }

    public void notifyTaskVerificationRejected(HouseholdTask task) {
        if (task.getAsignadoA() == null) {
            return;
        }

        TaskNotification notification = taskNotificationFactory.createTaskVerificationRejectedNotification(task);
        taskNotificationRepository.save(notification);
    }

    public void deleteNotificationsForTask(Long taskId) {
        taskNotificationRepository.deleteByTaskId(taskId);
    }
}
