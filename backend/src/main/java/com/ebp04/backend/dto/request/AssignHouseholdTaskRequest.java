package com.ebp04.backend.dto.request;

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
public class AssignHouseholdTaskRequest {

    @NotNull(message = "Debe seleccionar un miembro para asignar la tarea.")
    private Long userId;
}
