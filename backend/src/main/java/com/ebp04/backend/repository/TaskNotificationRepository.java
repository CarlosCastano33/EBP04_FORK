package com.ebp04.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ebp04.backend.entity.TaskNotification;

public interface TaskNotificationRepository extends JpaRepository<TaskNotification, Long> {

    List<TaskNotification> findByUserIdOrderByFechaCreacionDesc(Long userId);

    void deleteByTaskId(Long taskId);
}
