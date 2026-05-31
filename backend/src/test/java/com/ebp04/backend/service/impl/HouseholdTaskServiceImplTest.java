package com.ebp04.backend.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ebp04.backend.dto.request.UpdateHouseholdTaskRequest;
import com.ebp04.backend.dto.request.RejectHouseholdTaskRequest;
import com.ebp04.backend.dto.request.RejectTaskVerificationRequest;
import com.ebp04.backend.entity.Household;
import com.ebp04.backend.entity.HouseholdMember;
import com.ebp04.backend.entity.HouseholdRole;
import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.TaskPriority;
import com.ebp04.backend.entity.TaskStatus;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.exception.BusinessException;
import com.ebp04.backend.facade.TaskNotificationFacade;
import com.ebp04.backend.repository.HouseholdMemberRepository;
import com.ebp04.backend.repository.HouseholdRepository;
import com.ebp04.backend.repository.HouseholdTaskRepository;
import com.ebp04.backend.repository.UserRepository;
import com.ebp04.backend.strategy.NonAdminTaskUpdatePermissionStrategy;
import com.ebp04.backend.strategy.TaskUpdatePermissionStrategyResolver;

@ExtendWith(MockitoExtension.class)
class HouseholdTaskServiceImplTest {

    private static final Long HOUSEHOLD_ID = 1L;
    private static final Long TASK_ID = 2L;
    private static final Long USER_ID = 3L;
    private static final Long ADMIN_ID = 4L;
    private static final String USER_EMAIL = "miembro@test.com";
    private static final String ADMIN_EMAIL = "admin@test.com";

    @Mock
    private UserRepository userRepository;

    @Mock
    private HouseholdRepository householdRepository;

    @Mock
    private HouseholdMemberRepository householdMemberRepository;

    @Mock
    private HouseholdTaskRepository householdTaskRepository;

    @Mock
    private TaskNotificationFacade taskNotificationFacade;

    @Mock
    private TaskUpdatePermissionStrategyResolver taskUpdatePermissionStrategyResolver;

    @InjectMocks
    private HouseholdTaskServiceImpl householdTaskService;

    private User assignedUser;
    private User adminUser;
    private Household household;
    private HouseholdTask assignedTask;

    @BeforeEach
    void setUp() {
        assignedUser = User.builder()
                .id(USER_ID)
                .correo(USER_EMAIL)
                .nombre("Miembro")
                .build();

        household = Household.builder()
                .id(HOUSEHOLD_ID)
                .nombre("Casa")
                .creadoPor(assignedUser)
                .build();

        adminUser = User.builder()
                .id(ADMIN_ID)
                .correo(ADMIN_EMAIL)
                .nombre("Admin")
                .build();

        assignedTask = HouseholdTask.builder()
                .id(TASK_ID)
                .nombre("Lavar platos")
                .household(household)
                .creadoPor(assignedUser)
                .asignadoA(assignedUser)
                .estado(TaskStatus.ASIGNADA)
                .build();
    }

    @Test
    void startTaskMarksAcceptedTaskAsInProgress() {
        assignedTask.setEstado(TaskStatus.ACEPTADA);

        mockAssignedTaskWithMembership();
        when(householdTaskRepository.save(assignedTask)).thenReturn(assignedTask);

        householdTaskService.startTask(HOUSEHOLD_ID, TASK_ID, USER_EMAIL);

        assertEquals(TaskStatus.EN_PROGRESO, assignedTask.getEstado());
        assertNotNull(assignedTask.getFechaInicio());
        verify(householdTaskRepository).save(assignedTask);
    }

    @Test
    void completeTaskMarksInProgressTaskAsCompletedAndNotifiesCreator() {
        assignedTask.setEstado(TaskStatus.EN_PROGRESO);

        mockAssignedTaskWithMembership();
        when(householdTaskRepository.save(assignedTask)).thenReturn(assignedTask);

        householdTaskService.completeTask(HOUSEHOLD_ID, TASK_ID, USER_EMAIL);

        assertEquals(TaskStatus.COMPLETADA, assignedTask.getEstado());
        assertNotNull(assignedTask.getFechaFinalizacion());
        verify(taskNotificationFacade).notifyTaskCompleted(assignedTask);
    }

    @Test
    void verifyTaskMarksCompletedTaskAsVerifiedWhenUserIsAdmin() {
        assignedTask.setEstado(TaskStatus.COMPLETADA);

        mockCompletedTaskForAdminVerification();
        when(householdTaskRepository.save(assignedTask)).thenReturn(assignedTask);

        householdTaskService.verifyTask(HOUSEHOLD_ID, TASK_ID, ADMIN_EMAIL);

        assertEquals(TaskStatus.VERIFICADA, assignedTask.getEstado());
        assertEquals(adminUser, assignedTask.getVerificadoPor());
        assertNotNull(assignedTask.getFechaVerificacion());
        verify(taskNotificationFacade).notifyTaskVerified(assignedTask);
    }

    @Test
    void rejectTaskVerificationMarksCompletedTaskAsRejectedWhenUserIsAdmin() {
        assignedTask.setEstado(TaskStatus.COMPLETADA);
        RejectTaskVerificationRequest request = RejectTaskVerificationRequest.builder()
                .reason("Falto limpiar una parte")
                .build();

        mockCompletedTaskForAdminVerification();
        when(householdTaskRepository.save(assignedTask)).thenReturn(assignedTask);

        householdTaskService.rejectTaskVerification(HOUSEHOLD_ID, TASK_ID, request, ADMIN_EMAIL);

        assertEquals(TaskStatus.VERIFICACION_RECHAZADA, assignedTask.getEstado());
        assertEquals(adminUser, assignedTask.getVerificadoPor());
        assertNotNull(assignedTask.getFechaVerificacion());
        assertEquals("Falto limpiar una parte", assignedTask.getMotivoRechazoVerificacion());
        verify(taskNotificationFacade).notifyTaskVerificationRejected(assignedTask);
    }

    @Test
    void acceptTaskFailsWhenAssignedUserNoLongerBelongsToHousehold() {
        mockAssignedTaskWithoutMembership();

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> householdTaskService.acceptTask(HOUSEHOLD_ID, TASK_ID, USER_EMAIL));

        assertEquals("No tienes acceso a este hogar.", exception.getMessage());
        verify(householdTaskRepository, never()).save(assignedTask);
        verify(taskNotificationFacade, never()).notifyTaskAccepted(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectTaskFailsWhenAssignedUserNoLongerBelongsToHousehold() {
        mockAssignedTaskWithoutMembership();

        RejectHouseholdTaskRequest request = RejectHouseholdTaskRequest.builder()
                .reason("No puedo hacerla")
                .build();

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> householdTaskService.rejectTask(HOUSEHOLD_ID, TASK_ID, request, USER_EMAIL));

        assertEquals("No tienes acceso a este hogar.", exception.getMessage());
        verify(householdTaskRepository, never()).save(assignedTask);
    }

    @Test
    void updateTaskFailsWhenAssignedMemberChangesPriorityOrDeadline() {
        HouseholdMember member = HouseholdMember.builder()
                .user(assignedUser)
                .household(household)
                .role(HouseholdRole.MIEMBRO)
                .build();
        UpdateHouseholdTaskRequest request = UpdateHouseholdTaskRequest.builder()
                .prioridad(TaskPriority.ALTA)
                .fechaLimite(LocalDate.now().plusDays(1))
                .build();

        when(householdRepository.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
        when(userRepository.findByCorreo(USER_EMAIL)).thenReturn(Optional.of(assignedUser));
        when(householdTaskRepository.findByIdAndHouseholdId(TASK_ID, HOUSEHOLD_ID))
                .thenReturn(Optional.of(assignedTask));
        when(householdMemberRepository.findByHouseholdIdAndUserId(HOUSEHOLD_ID, USER_ID))
                .thenReturn(Optional.of(member));
        when(taskUpdatePermissionStrategyResolver.resolve(HouseholdRole.MIEMBRO))
                .thenReturn(new NonAdminTaskUpdatePermissionStrategy());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> householdTaskService.updateTask(HOUSEHOLD_ID, TASK_ID, request, USER_EMAIL));

        assertEquals("Solo un ADMIN del hogar puede modificar la prioridad o la fecha limite.", exception.getMessage());
        verify(householdTaskRepository, never()).save(assignedTask);
    }

    private void mockAssignedTaskWithoutMembership() {
        when(householdRepository.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
        when(userRepository.findByCorreo(USER_EMAIL)).thenReturn(Optional.of(assignedUser));
        when(householdTaskRepository.findByIdAndHouseholdId(TASK_ID, HOUSEHOLD_ID))
                .thenReturn(Optional.of(assignedTask));
        when(householdMemberRepository.existsByHouseholdIdAndUserId(HOUSEHOLD_ID, USER_ID))
                .thenReturn(false);
    }

    private void mockAssignedTaskWithMembership() {
        when(householdRepository.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
        when(userRepository.findByCorreo(USER_EMAIL)).thenReturn(Optional.of(assignedUser));
        when(householdTaskRepository.findByIdAndHouseholdId(TASK_ID, HOUSEHOLD_ID))
                .thenReturn(Optional.of(assignedTask));
        when(householdMemberRepository.existsByHouseholdIdAndUserId(HOUSEHOLD_ID, USER_ID))
                .thenReturn(true);
    }

    private void mockCompletedTaskForAdminVerification() {
        HouseholdMember adminMember = HouseholdMember.builder()
                .user(adminUser)
                .household(household)
                .role(HouseholdRole.ADMIN)
                .build();

        when(householdRepository.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
        when(userRepository.findByCorreo(ADMIN_EMAIL)).thenReturn(Optional.of(adminUser));
        when(householdMemberRepository.findByHouseholdIdAndUserId(HOUSEHOLD_ID, ADMIN_ID))
                .thenReturn(Optional.of(adminMember));
        when(householdTaskRepository.findByIdAndHouseholdId(TASK_ID, HOUSEHOLD_ID))
                .thenReturn(Optional.of(assignedTask));
    }
}
