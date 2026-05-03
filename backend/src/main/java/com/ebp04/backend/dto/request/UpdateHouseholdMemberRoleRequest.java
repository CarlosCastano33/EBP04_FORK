package com.ebp04.backend.dto.request;

import com.ebp04.backend.entity.HouseholdRole;

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
public class UpdateHouseholdMemberRoleRequest {

    @NotNull(message = "Debe seleccionar un rol.")
    private HouseholdRole role;
}
