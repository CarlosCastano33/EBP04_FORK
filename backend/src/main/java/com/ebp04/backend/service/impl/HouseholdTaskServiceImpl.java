package com.ebp04.backend.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ebp04.backend.dto.request.AssignHouseholdTaskRequest;
import com.ebp04.backend.dto.request.CreateHouseholdTaskRequest;
import com.ebp04.backend.dto.request.RejectHouseholdTaskRequest;
import com.ebp04.backend.dto.request.UpdateHouseholdTaskRequest;
import com.ebp04.backend.dto.request.UpdateTaskPriorityDeadlineRequest;
import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.HouseholdTaskResponse;
import com.ebp04.backend.entity.Household;
import com.ebp04.backend.entity.HouseholdMember;
import com.ebp04.backend.entity.HouseholdRole;
import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.TaskStatus;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.exception.BusinessException;
import com.ebp04.backend.exception.ResourceNotFoundException;
import com.ebp04.backend.facade.TaskNotificationFacade;
import com.ebp04.backend.factory.HouseholdTaskFactory;
import com.ebp04.backend.repository.HouseholdMemberRepository;
import com.ebp04.backend.repository.HouseholdRepository;
import com.ebp04.backend.repository.HouseholdTaskRepository;
import com.ebp04.backend.repository.UserRepository;
import com.ebp04.backend.service.HouseholdTaskService;
import com.ebp04.backend.strategy.TaskUpdatePermissionStrategy;
import com.ebp04.backend.strategy.TaskUpdatePermissionStrategyResolver;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HouseholdTaskServiceImpl implements HouseholdTaskService {

    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final HouseholdTaskRepository householdTaskRepository;
    private final HouseholdTaskFactory householdTaskFactory;
    private final TaskNotificationFacade taskNotificationFacade;
    private final TaskUpdatePermissionStrategyResolver taskUpdatePermissionStrategyResolver;

    @Override
    @Transactional
    public HouseholdTaskResponse createTask(Long householdId, CreateHouseholdTaskRequest request, String correoAutenticado) {
        Household household = getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateAdminAccess(householdId, authenticatedUser.getId());
        validateTaskCreateRequest(request);

        User assignedUser = null;
        if (request.getAsignadoAId() != null) {
            assignedUser = validateAssignableUser(householdId, request.getAsignadoAId());
        }

        HouseholdTask task = householdTaskFactory.createTask(request, household, authenticatedUser, assignedUser);

        HouseholdTask savedTask = householdTaskRepository.save(task);

        if (assignedUser != null) {
            createTaskAssignedNotification(savedTask, assignedUser);
        }

        return buildTaskResponse(savedTask);
    }

    @Override
    @Transactional
    public ApiResponse deleteTask(Long householdId, Long taskId, String correoAutenticado) {
        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateAdminAccess(householdId, authenticatedUser.getId());

        HouseholdTask task = householdTaskRepository.findByIdAndHouseholdId(taskId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro la tarea solicitada."));

        taskNotificationFacade.deleteNotificationsForTask(taskId);
        householdTaskRepository.delete(task);

        return ApiResponse.builder()
                .message("Tarea eliminada exitosamente.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public HouseholdTaskResponse updateTaskPriorityDeadline(
            Long householdId,
            Long taskId,
            UpdateTaskPriorityDeadlineRequest request,
            String correoAutenticado) {

        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateAdminAccess(householdId, authenticatedUser.getId());

        HouseholdTask task = householdTaskRepository.findByIdAndHouseholdId(taskId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro la tarea solicitada."));

        if (request.getFechaLimite().isBefore(LocalDate.now())) {
            throw new BusinessException("La fecha limite no puede ser anterior a la fecha actual");
        }

        task.setPrioridad(request.getPrioridad());
        task.setFechaLimite(request.getFechaLimite());

        HouseholdTask savedTask = householdTaskRepository.save(task);

        return buildTaskResponse(savedTask);
    }

    @Override
    @Transactional
    public HouseholdTaskResponse updateTask(
            Long householdId,
            Long taskId,
            UpdateHouseholdTaskRequest request,
            String correoAutenticado) {

        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        HouseholdTask task = householdTaskRepository.findByIdAndHouseholdId(taskId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro la tarea solicitada."));

        HouseholdMember authenticatedMember = getAuthenticatedHouseholdMember(householdId, authenticatedUser.getId());
        TaskUpdatePermissionStrategy taskUpdatePermissionStrategy =
                taskUpdatePermissionStrategyResolver.resolve(authenticatedMember.getRole());

        taskUpdatePermissionStrategy.validateTaskEditAccess(authenticatedMember, authenticatedUser, task);
        validateTaskUpdateRequest(request);
        taskUpdatePermissionStrategy.validateAllowedFields(request);

        if (request.getNombre() != null) {
            task.setNombre(request.getNombre());
        }
        if (request.getDescripcion() != null) {
            task.setDescripcion(request.getDescripcion());
        }
        if (request.getPrioridad() != null) {
            task.setPrioridad(request.getPrioridad());
        }
        if (request.getFechaLimite() != null) {
            task.setFechaLimite(request.getFechaLimite());
        }

        HouseholdTask savedTask = householdTaskRepository.save(task);

        return buildTaskResponse(savedTask);
    }

    @Override
    @Transactional
    public HouseholdTaskResponse assignTask(
            Long householdId,
            Long taskId,
            AssignHouseholdTaskRequest request,
            String correoAutenticado) {

        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateAdminAccess(householdId, authenticatedUser.getId());

        HouseholdTask task = householdTaskRepository.findByIdAndHouseholdId(taskId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro la tarea solicitada."));

        User userToAssign = validateAssignableUser(householdId, request.getUserId());

        task.setAsignadoA(userToAssign);
        task.setEstado(TaskStatus.ASIGNADA);
        task.setFechaAceptacion(null);
        task.setMotivoRechazo(null);
        HouseholdTask savedTask = householdTaskRepository.save(task);

        createTaskAssignedNotification(savedTask, userToAssign);

        return buildTaskResponse(savedTask);
    }

    @Override
    @Transactional
    public HouseholdTaskResponse acceptTask(Long householdId, Long taskId, String correoAutenticado) {
        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        HouseholdTask task = householdTaskRepository.findByIdAndHouseholdId(taskId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro la tarea solicitada."));

        validateHouseholdAccess(householdId, authenticatedUser.getId());
        validateAssignedUser(task, authenticatedUser);

        if (task.getEstado() == TaskStatus.ACEPTADA) {
            throw new BusinessException("La tarea ya esta aceptada.");
        }

        task.setEstado(TaskStatus.ACEPTADA);
        task.setFechaAceptacion(LocalDateTime.now());
        task.setMotivoRechazo(null);

        HouseholdTask savedTask = householdTaskRepository.save(task);

        taskNotificationFacade.notifyTaskAccepted(savedTask);

        return buildTaskResponse(savedTask);
    }

    @Override
    @Transactional
    public HouseholdTaskResponse rejectTask(
            Long householdId,
            Long taskId,
            RejectHouseholdTaskRequest request,
            String correoAutenticado) {

        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        HouseholdTask task = householdTaskRepository.findByIdAndHouseholdId(taskId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro la tarea solicitada."));

        validateHouseholdAccess(householdId, authenticatedUser.getId());
        validateAssignedUser(task, authenticatedUser);

        if (task.getEstado() == TaskStatus.ACEPTADA) {
            throw new BusinessException("No se puede rechazar una tarea ya aceptada.");
        }

        if (task.getEstado() == TaskStatus.RECHAZADA) {
            throw new BusinessException("La tarea ya fue rechazada.");
        }

        task.setEstado(TaskStatus.RECHAZADA);
        task.setFechaAceptacion(null);
        task.setMotivoRechazo(request.getReason());

        HouseholdTask savedTask = householdTaskRepository.save(task);

        return buildTaskResponse(savedTask);
    }

    @Override
    @Transactional
    public HouseholdTaskResponse unassignTask(Long householdId, Long taskId, String correoAutenticado) {
        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateAdminAccess(householdId, authenticatedUser.getId());

        HouseholdTask task = householdTaskRepository.findByIdAndHouseholdId(taskId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro la tarea solicitada."));

        task.setAsignadoA(null);
        task.setEstado(TaskStatus.SIN_ASIGNAR);
        task.setFechaAceptacion(null);
        task.setMotivoRechazo(null);

        HouseholdTask savedTask = householdTaskRepository.save(task);

        return buildTaskResponse(savedTask);
    }

    @Override
    public List<HouseholdTaskResponse> getTasks(Long householdId, String correoAutenticado) {
        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateHouseholdAccess(householdId, authenticatedUser.getId());

        return householdTaskRepository.findByHouseholdId(householdId)
                .stream()
                .map(this::buildTaskResponse)
                .toList();
    }

    private User getUserByCorreo(String correo) {
        return userRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro un usuario con el correo proporcionado."));
    }

    private Household getHouseholdById(Long householdId) {
        return householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro el hogar solicitado."));
    }

    private void validateAdminAccess(Long householdId, Long userId) {
        HouseholdMember member = householdMemberRepository.findByHouseholdIdAndUserId(householdId, userId)
                .orElseThrow(() -> new BusinessException("No tienes acceso a este hogar."));

        if (member.getRole() != HouseholdRole.ADMIN) {
            throw new BusinessException("Solo un ADMIN del hogar puede realizar esta accion.");
        }
    }

    private HouseholdMember getHouseholdMember(Long householdId, Long userId) {
        return householdMemberRepository.findByHouseholdIdAndUserId(householdId, userId)
                .orElseThrow(() -> new BusinessException("El usuario no es miembro del hogar."));
    }

    private HouseholdMember getAuthenticatedHouseholdMember(Long householdId, Long userId) {
        return householdMemberRepository.findByHouseholdIdAndUserId(householdId, userId)
                .orElseThrow(() -> new BusinessException("No tienes acceso a este hogar."));
    }

    private void validateHouseholdAccess(Long householdId, Long userId) {
        if (!householdMemberRepository.existsByHouseholdIdAndUserId(householdId, userId)) {
            throw new BusinessException("No tienes acceso a este hogar.");
        }
    }

    private void validateAssignedUser(HouseholdTask task, User authenticatedUser) {
        if (task.getAsignadoA() == null || !task.getAsignadoA().getId().equals(authenticatedUser.getId())) {
            throw new BusinessException("No tienes permisos para modificar esta tarea.");
        }
    }

    private void validateTaskCreateRequest(CreateHouseholdTaskRequest request) {
        if (request.getNombre() != null && !StringUtils.hasText(request.getNombre())) {
            throw new BusinessException("El nombre no puede estar vacio.");
        }

        if (request.getFechaLimite() != null && request.getFechaLimite().isBefore(LocalDate.now())) {
            throw new BusinessException("La fecha limite no puede ser anterior a la fecha actual");
        }
    }

    private void validateTaskUpdateRequest(UpdateHouseholdTaskRequest request) {
        if (request.getNombre() == null
                && request.getDescripcion() == null
                && request.getPrioridad() == null
                && request.getFechaLimite() == null) {
            throw new BusinessException("Debe modificar al menos un campo de la tarea.");
        }

        if (request.getNombre() != null && !StringUtils.hasText(request.getNombre())) {
            throw new BusinessException("El nombre no puede estar vacio.");
        }

        if (request.getFechaLimite() != null && request.getFechaLimite().isBefore(LocalDate.now())) {
            throw new BusinessException("La fecha limite no puede ser anterior a la fecha actual");
        }
    }

    private User validateAssignableUser(Long householdId, Long userId) {
        User userToAssign = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro el usuario a asignar."));

        HouseholdMember memberToAssign = getHouseholdMember(householdId, userToAssign.getId());
        if (memberToAssign.getRole() == HouseholdRole.INVITADO) {
            throw new BusinessException("No es posible asignar tareas a usuarios con rol INVITADO.");
        }

        return userToAssign;
    }

    private void createTaskAssignedNotification(HouseholdTask task, User assignedUser) {
        taskNotificationFacade.notifyTaskAssigned(task, assignedUser);
    }

    private HouseholdTaskResponse buildTaskResponse(HouseholdTask task) {
        Long asignadoAId = task.getAsignadoA() != null ? task.getAsignadoA().getId() : null;

        return HouseholdTaskResponse.builder()
                .id(task.getId())
                .nombre(task.getNombre())
                .descripcion(task.getDescripcion())
                .prioridad(task.getPrioridad())
                .fechaLimite(task.getFechaLimite())
                .estado(task.getEstado())
                .fechaAceptacion(task.getFechaAceptacion())
                .motivoRechazo(task.getMotivoRechazo())
                .householdId(task.getHousehold().getId())
                .creadoPorId(task.getCreadoPor().getId())
                .asignadoAId(asignadoAId)
                .timestamp(LocalDateTime.now())
                .build();
    }
}


