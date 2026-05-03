package com.ebp04.backend.dto.request;

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
public class RejectHouseholdTaskRequest {

    @NotBlank(message = "El motivo de rechazo es obligatorio.")
    @Size(max = 500, message = "El motivo de rechazo no puede superar 500 caracteres.")
    private String reason;
}
