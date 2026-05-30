package com.ebp04.backend.strategy;

import org.springframework.stereotype.Component;

import com.ebp04.backend.dto.request.UpdateHouseholdTaskRequest;
import com.ebp04.backend.entity.HouseholdMember;
import com.ebp04.backend.entity.HouseholdRole;
import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.User;

@Component
public class AdminTaskUpdatePermissionStrategy implements TaskUpdatePermissionStrategy {

    @Override
    public boolean supports(HouseholdRole role) {
        return role == HouseholdRole.ADMIN;
    }

    @Override
    public void validateTaskEditAccess(HouseholdMember member, User authenticatedUser, HouseholdTask task) {
        // Los administradores pueden editar cualquier tarea del hogar.
    }

    @Override
    public void validateAllowedFields(UpdateHouseholdTaskRequest request) {
        // Los administradores pueden modificar todos los campos editables.
    }
}
