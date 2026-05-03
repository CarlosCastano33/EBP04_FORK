package com.ebp04.backend.dto.response;

import java.time.LocalDateTime;

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
public class HouseholdResponse {

    private Long id;
    private String nombre;
    private Long creadoPorId;
    private LocalDateTime timestamp;
}
