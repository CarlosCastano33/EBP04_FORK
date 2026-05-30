package com.ebp04.backend.service.impl;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ebp04.backend.entity.Household;
import com.ebp04.backend.entity.HouseholdMember;
import com.ebp04.backend.entity.HouseholdRole;
import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.TaskStatus;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.dto.request.UpdateHouseholdMemberRoleRequest;
import com.ebp04.backend.repository.HouseholdMemberRepository;
import com.ebp04.backend.repository.HouseholdRepository;
import com.ebp04.backend.repository.HouseholdTaskRepository;
import com.ebp04.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class HouseholdServiceImplTest {

    private static final Long HOUSEHOLD_ID = 1L;
    private static final Long ADMIN_ID = 2L;
    private static final Long MEMBER_ID = 3L;
    private static final String ADMIN_EMAIL = "admin@test.com";

    @Mock
    private UserRepository userRepository;

    @Mock
    private HouseholdRepository householdRepository;

    @Mock
    private HouseholdMemberRepository householdMemberRepository;

    @Mock
    private HouseholdTaskRepository householdTaskRepository;

    @InjectMocks
    private HouseholdServiceImpl householdService;

    private User adminUser;
    private User memberUser;
    private Household household;
    private HouseholdMember adminMember;
    private HouseholdMember memberToRemove;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(ADMIN_ID)
                .correo(ADMIN_EMAIL)
                .nombre("Admin")
                .build();

        memberUser = User.builder()
                .id(MEMBER_ID)
                .correo("miembro@test.com")
                .nombre("Miembro")
                .build();

        household = Household.builder()
                .id(HOUSEHOLD_ID)
                .nombre("Casa")
                .creadoPor(adminUser)
                .build();

        adminMember = HouseholdMember.builder()
                .user(adminUser)
                .household(household)
                .role(HouseholdRole.ADMIN)
                .build();

        memberToRemove = HouseholdMember.builder()
                .user(memberUser)
                .household(household)
                .role(HouseholdRole.MIEMBRO)
                .build();
    }

    @Test
    void removeMemberUnassignsTheirHouseholdTasksBeforeDeletingMembership() {
        HouseholdTask assignedTask = HouseholdTask.builder()
                .id(10L)
                .nombre("Limpiar sala")
                .household(household)
                .creadoPor(adminUser)
                .asignadoA(memberUser)
                .estado(TaskStatus.ACEPTADA)
                .fechaAceptacion(LocalDateTime.now())
                .motivoRechazo("Motivo previo")
                .build();

        when(householdRepository.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
        when(userRepository.findByCorreo(ADMIN_EMAIL)).thenReturn(Optional.of(adminUser));
        when(householdMemberRepository.findByHouseholdIdAndUserId(HOUSEHOLD_ID, ADMIN_ID))
                .thenReturn(Optional.of(adminMember));
        when(householdMemberRepository.findByHouseholdIdAndUserId(HOUSEHOLD_ID, MEMBER_ID))
                .thenReturn(Optional.of(memberToRemove));
        when(householdTaskRepository.findByHouseholdIdAndAsignadoAId(HOUSEHOLD_ID, MEMBER_ID))
                .thenReturn(List.of(assignedTask));

        householdService.removeMember(HOUSEHOLD_ID, MEMBER_ID, ADMIN_EMAIL);

        assertNull(assignedTask.getAsignadoA());
        assertEquals(TaskStatus.SIN_ASIGNAR, assignedTask.getEstado());
        assertNull(assignedTask.getFechaAceptacion());
        assertNull(assignedTask.getMotivoRechazo());
        verify(householdTaskRepository).saveAll(List.of(assignedTask));
        verify(householdMemberRepository).delete(memberToRemove);
    }

    @Test
    void updateMemberRoleToGuestUnassignsTheirHouseholdTasks() {
        HouseholdTask assignedTask = HouseholdTask.builder()
                .id(11L)
                .nombre("Sacar basura")
                .household(household)
                .creadoPor(adminUser)
                .asignadoA(memberUser)
                .estado(TaskStatus.ASIGNADA)
                .fechaAceptacion(LocalDateTime.now())
                .motivoRechazo("Motivo previo")
                .build();
        UpdateHouseholdMemberRoleRequest request = UpdateHouseholdMemberRoleRequest.builder()
                .role(HouseholdRole.INVITADO)
                .build();

        when(householdRepository.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
        when(userRepository.findByCorreo(ADMIN_EMAIL)).thenReturn(Optional.of(adminUser));
        when(householdMemberRepository.findByHouseholdIdAndUserId(HOUSEHOLD_ID, ADMIN_ID))
                .thenReturn(Optional.of(adminMember));
        when(householdMemberRepository.findByHouseholdIdAndUserId(HOUSEHOLD_ID, MEMBER_ID))
                .thenReturn(Optional.of(memberToRemove));
        when(householdTaskRepository.findByHouseholdIdAndAsignadoAId(HOUSEHOLD_ID, MEMBER_ID))
                .thenReturn(List.of(assignedTask));
        when(householdMemberRepository.save(memberToRemove)).thenReturn(memberToRemove);

        householdService.updateMemberRole(HOUSEHOLD_ID, MEMBER_ID, request, ADMIN_EMAIL);

        assertEquals(HouseholdRole.INVITADO, memberToRemove.getRole());
        assertNull(assignedTask.getAsignadoA());
        assertEquals(TaskStatus.SIN_ASIGNAR, assignedTask.getEstado());
        assertNull(assignedTask.getFechaAceptacion());
        assertNull(assignedTask.getMotivoRechazo());
        verify(householdTaskRepository).saveAll(List.of(assignedTask));
    }
}
