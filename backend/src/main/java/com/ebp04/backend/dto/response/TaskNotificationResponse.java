package com.ebp04.backend.dto.response;

import java.time.LocalDateTime;

import com.ebp04.backend.entity.TaskNotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskNotificationResponse {

    private Long id;
    private Long taskId;
    private String message;
    private Boolean read;
    private TaskNotificationType type;
    private LocalDateTime timestamp;
}
