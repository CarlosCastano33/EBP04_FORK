package com.ebp04.backend.dto.request;

import java.time.LocalDate;

import com.ebp04.backend.entity.TaskPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class CreateHouseholdTaskRequest {

    @NotBlank(message = "El nombre de la tarea es obligatorio.")
    private String nombre;

    @Size(max = 500, message = "La descripcion no puede superar 500 caracteres.")
    private String descripcion;

    private TaskPriority prioridad;

    private LocalDate fechaLimite;

    private Long asignadoAId;
}
