package com.ebp04.backend.service;

import java.util.List;

import com.ebp04.backend.dto.request.AssignHouseholdTaskRequest;
import com.ebp04.backend.dto.request.CreateHouseholdTaskRequest;
import com.ebp04.backend.dto.request.RejectHouseholdTaskRequest;
import com.ebp04.backend.dto.request.RejectTaskVerificationRequest;
import com.ebp04.backend.dto.request.UpdateHouseholdTaskRequest;
import com.ebp04.backend.dto.request.UpdateTaskPriorityDeadlineRequest;
import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.HouseholdTaskResponse;

public interface HouseholdTaskService {

    HouseholdTaskResponse createTask(Long householdId, CreateHouseholdTaskRequest request, String correoAutenticado);

    ApiResponse deleteTask(Long householdId, Long taskId, String correoAutenticado);

    HouseholdTaskResponse updateTaskPriorityDeadline(
            Long householdId,
            Long taskId,
            UpdateTaskPriorityDeadlineRequest request,
            String correoAutenticado);

    HouseholdTaskResponse updateTask(
            Long householdId,
            Long taskId,
            UpdateHouseholdTaskRequest request,
            String correoAutenticado);

    HouseholdTaskResponse assignTask(
            Long householdId,
            Long taskId,
            AssignHouseholdTaskRequest request,
            String correoAutenticado);

    HouseholdTaskResponse acceptTask(Long householdId, Long taskId, String correoAutenticado);

    HouseholdTaskResponse rejectTask(
            Long householdId,
            Long taskId,
            RejectHouseholdTaskRequest request,
            String correoAutenticado);

    HouseholdTaskResponse unassignTask(Long householdId, Long taskId, String correoAutenticado);

    HouseholdTaskResponse startTask(Long householdId, Long taskId, String correoAutenticado);

    HouseholdTaskResponse completeTask(Long householdId, Long taskId, String correoAutenticado);

    HouseholdTaskResponse verifyTask(Long householdId, Long taskId, String correoAutenticado);

    HouseholdTaskResponse rejectTaskVerification(
            Long householdId,
            Long taskId,
            RejectTaskVerificationRequest request,
            String correoAutenticado);

    List<HouseholdTaskResponse> getTasks(Long householdId, String correoAutenticado);
}
