package com.ebp04.backend.dto.response;

import java.time.LocalDateTime;

import com.ebp04.backend.entity.HouseholdRole;

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
public class HouseholdMemberResponse {

    private Long userId;
    private String nombre;
    private String correo;
    private HouseholdRole role;
    private LocalDateTime fechaIngreso;
}
