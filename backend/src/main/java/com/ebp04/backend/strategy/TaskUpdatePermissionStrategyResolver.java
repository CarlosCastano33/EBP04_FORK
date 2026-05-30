package com.ebp04.backend.strategy;

import java.util.List;

import org.springframework.stereotype.Component;

import com.ebp04.backend.entity.HouseholdRole;
import com.ebp04.backend.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TaskUpdatePermissionStrategyResolver {

    private final List<TaskUpdatePermissionStrategy> strategies;

    public TaskUpdatePermissionStrategy resolve(HouseholdRole role) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(role))
                .findFirst()
                .orElseThrow(() -> new BusinessException("No tienes permisos para editar esta tarea."));
    }
}
