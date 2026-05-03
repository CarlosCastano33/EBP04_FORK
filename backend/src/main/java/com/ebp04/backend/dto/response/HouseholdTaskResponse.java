package com.ebp04.backend.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.ebp04.backend.entity.TaskPriority;
import com.ebp04.backend.entity.TaskStatus;

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
public class HouseholdTaskResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private TaskPriority prioridad;
    private LocalDate fechaLimite;
    private TaskStatus estado;
    private LocalDateTime fechaAceptacion;
    private String motivoRechazo;
    private Long householdId;
    private Long creadoPorId;
    private Long asignadoAId;
    private LocalDateTime timestamp;
}
