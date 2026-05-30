package com.ebp04.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ebp04.backend.dto.request.AddMemberRequest;
import com.ebp04.backend.dto.request.CreateHouseholdRequest;
import com.ebp04.backend.dto.request.UpdateHouseholdMemberRoleRequest;
import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.HouseholdMemberResponse;
import com.ebp04.backend.dto.response.HouseholdResponse;
import com.ebp04.backend.entity.Household;
import com.ebp04.backend.entity.HouseholdMember;
import com.ebp04.backend.entity.HouseholdRole;
import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.TaskStatus;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.exception.BusinessException;
import com.ebp04.backend.exception.ResourceNotFoundException;
import com.ebp04.backend.repository.HouseholdMemberRepository;
import com.ebp04.backend.repository.HouseholdRepository;
import com.ebp04.backend.repository.HouseholdTaskRepository;
import com.ebp04.backend.repository.UserRepository;
import com.ebp04.backend.service.HouseholdService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HouseholdServiceImpl implements HouseholdService {

    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final HouseholdTaskRepository householdTaskRepository;

    @Override
    @Transactional
    public HouseholdResponse createHousehold(CreateHouseholdRequest request, String correoAutenticado) {
        User user = getUserByCorreo(correoAutenticado);

        Household household = Household.builder()
                .nombre(request.getNombre())
                .creadoPor(user)
                .build();

        Household savedHousehold = householdRepository.save(household);

        HouseholdMember householdMember = HouseholdMember.builder()
                .user(user)
                .household(savedHousehold)
                .role(HouseholdRole.ADMIN)
                .build();

        householdMemberRepository.save(householdMember);

        return HouseholdResponse.builder()
                .id(savedHousehold.getId())
                .nombre(savedHousehold.getNombre())
                .creadoPorId(user.getId())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse addMember(Long householdId, AddMemberRequest request, String correoAutenticado) {
        Household household = getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateAdminAccess(householdId, authenticatedUser.getId());

        User userToAdd = getUserByCorreo(request.getCorreo());

        if (householdMemberRepository.existsByHouseholdIdAndUserId(householdId, userToAdd.getId())) {
            throw new BusinessException("El usuario ya pertenece al hogar.");
        }

        HouseholdMember householdMember = HouseholdMember.builder()
                .user(userToAdd)
                .household(household)
                .role(HouseholdRole.MIEMBRO)
                .build();

        householdMemberRepository.save(householdMember);

        return ApiResponse.builder()
                .message("Miembro agregado exitosamente al hogar.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse removeMember(Long householdId, Long userId, String correoAutenticado) {
        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateAdminAccess(householdId, authenticatedUser.getId());

        HouseholdMember memberToRemove = householdMemberRepository.findByHouseholdIdAndUserId(householdId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("El miembro no pertenece al hogar."));

        if (memberToRemove.getRole() == HouseholdRole.ADMIN
                && householdMemberRepository.countByHouseholdIdAndRole(householdId, HouseholdRole.ADMIN) <= 1) {
            throw new BusinessException("No se puede eliminar al ultimo ADMIN del hogar.");
        }

        unassignTasksForRemovedMember(householdId, userId);
        householdMemberRepository.delete(memberToRemove);

        return ApiResponse.builder()
                .message("Miembro eliminado exitosamente del hogar.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public HouseholdMemberResponse updateMemberRole(
            Long householdId,
            Long userId,
            UpdateHouseholdMemberRoleRequest request,
            String correoAutenticado) {

        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateAdminAccess(householdId, authenticatedUser.getId());

        HouseholdMember memberToUpdate = householdMemberRepository.findByHouseholdIdAndUserId(householdId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("El miembro no pertenece al hogar."));

        HouseholdRole newRole = request.getRole();

        if (memberToUpdate.getRole() == HouseholdRole.ADMIN
                && newRole != HouseholdRole.ADMIN
                && householdMemberRepository.countByHouseholdIdAndRole(householdId, HouseholdRole.ADMIN) <= 1) {
            throw new BusinessException("No se puede cambiar el rol del ultimo ADMIN del hogar.");
        }

        memberToUpdate.setRole(newRole);
        if (newRole == HouseholdRole.INVITADO) {
            unassignTasksForRemovedMember(householdId, userId);
        }

        HouseholdMember savedMember = householdMemberRepository.save(memberToUpdate);

        return buildMemberResponse(savedMember);
    }

    @Override
    public List<HouseholdResponse> getHouseholds(String correoAutenticado) {
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        return householdMemberRepository.findByUserId(authenticatedUser.getId())
                .stream()
                .map(member -> HouseholdResponse.builder()
                        .id(member.getHousehold().getId())
                        .nombre(member.getHousehold().getNombre())
                        .creadoPorId(member.getHousehold().getCreadoPor().getId())
                        .timestamp(LocalDateTime.now())
                        .build())
                .toList();
    }

    @Override
    public List<HouseholdMemberResponse> getMembers(Long householdId, String correoAutenticado) {
        getHouseholdById(householdId);
        User authenticatedUser = getUserByCorreo(correoAutenticado);

        validateHouseholdAccess(householdId, authenticatedUser.getId());

        return householdMemberRepository.findByHouseholdId(householdId)
                .stream()
                .map(this::buildMemberResponse)
                .toList();
    }

    private HouseholdMemberResponse buildMemberResponse(HouseholdMember member) {
        return HouseholdMemberResponse.builder()
                .userId(member.getUser().getId())
                .nombre(member.getUser().getNombre())
                .correo(member.getUser().getCorreo())
                .role(member.getRole())
                .fechaIngreso(member.getFechaIngreso())
                .build();
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

    private void validateHouseholdAccess(Long householdId, Long userId) {
        if (!householdMemberRepository.existsByHouseholdIdAndUserId(householdId, userId)) {
            throw new BusinessException("No tienes acceso a este hogar.");
        }
    }

    private void unassignTasksForRemovedMember(Long householdId, Long userId) {
        List<HouseholdTask> assignedTasks =
                householdTaskRepository.findByHouseholdIdAndAsignadoAId(householdId, userId);

        if (assignedTasks.isEmpty()) {
            return;
        }

        assignedTasks.forEach(task -> {
            task.setAsignadoA(null);
            task.setEstado(TaskStatus.SIN_ASIGNAR);
            task.setFechaAceptacion(null);
            task.setMotivoRechazo(null);
        });

        householdTaskRepository.saveAll(assignedTasks);
    }
}
