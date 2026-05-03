package com.ebp04.backend.dto.request;

import jakarta.validation.constraints.Positive;
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
public class UpdateUserProfileRequest {

    @Size(max = 100, message = "El nombre no puede superar 100 caracteres.")
    private String nombre;

    @Size(max = 30, message = "El telefono no puede superar 30 caracteres.")
    private String telefono;

    @Positive(message = "La edad debe ser mayor a cero.")
    private Integer edad;

    @Size(max = 30, message = "El sexo no puede superar 30 caracteres.")
    private String sexo;
}
