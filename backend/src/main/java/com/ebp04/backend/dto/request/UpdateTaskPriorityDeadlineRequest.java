package com.ebp04.backend.dto.request;

import java.time.LocalDate;

import com.ebp04.backend.entity.TaskPriority;

import jakarta.validation.constraints.NotNull;
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
public class UpdateTaskPriorityDeadlineRequest {

    @NotNull(message = "Los campos Prioridad y Fecha limite son obligatorios")
    private TaskPriority prioridad;

    @NotNull(message = "Los campos Prioridad y Fecha limite son obligatorios")
    private LocalDate fechaLimite;
}
