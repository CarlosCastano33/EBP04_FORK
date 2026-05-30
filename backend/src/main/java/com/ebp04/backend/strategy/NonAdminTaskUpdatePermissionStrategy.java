package com.ebp04.backend.strategy;

import org.springframework.stereotype.Component;

import com.ebp04.backend.dto.request.UpdateHouseholdTaskRequest;
import com.ebp04.backend.entity.HouseholdMember;
import com.ebp04.backend.entity.HouseholdRole;
import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.exception.BusinessException;

@Component
public class NonAdminTaskUpdatePermissionStrategy implements TaskUpdatePermissionStrategy {

    @Override
    public boolean supports(HouseholdRole role) {
        return role == HouseholdRole.MIEMBRO || role == HouseholdRole.INVITADO;
    }

    @Override
    public void validateTaskEditAccess(HouseholdMember member, User authenticatedUser, HouseholdTask task) {
        if (task.getAsignadoA() != null && task.getAsignadoA().getId().equals(authenticatedUser.getId())) {
            return;
        }

        throw new BusinessException("No tienes permisos para editar esta tarea.");
    }

    @Override
    public void validateAllowedFields(UpdateHouseholdTaskRequest request) {
        boolean changesPriorityOrDeadline = request.getPrioridad() != null || request.getFechaLimite() != null;

        if (changesPriorityOrDeadline) {
            throw new BusinessException("Solo un ADMIN del hogar puede modificar la prioridad o la fecha limite.");
        }
    }
}
