package com.ebp04.backend.factory;

import org.springframework.stereotype.Component;

import com.ebp04.backend.dto.request.CreateHouseholdTaskRequest;
import com.ebp04.backend.entity.Household;
import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.TaskStatus;
import com.ebp04.backend.entity.User;

@Component
public class HouseholdTaskFactory {

    public HouseholdTask createTask(
            CreateHouseholdTaskRequest request,
            Household household,
            User createdBy,
            User assignedUser) {

        return HouseholdTask.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .prioridad(request.getPrioridad())
                .fechaLimite(request.getFechaLimite())
                .household(household)
                .creadoPor(createdBy)
                .asignadoA(assignedUser)
                .estado(assignedUser != null ? TaskStatus.ASIGNADA : TaskStatus.SIN_ASIGNAR)
                .build();
    }
}
