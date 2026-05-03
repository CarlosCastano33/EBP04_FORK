package com.ebp04.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebp04.backend.dto.request.AssignHouseholdTaskRequest;
import com.ebp04.backend.dto.request.CreateHouseholdTaskRequest;
import com.ebp04.backend.dto.request.RejectHouseholdTaskRequest;
import com.ebp04.backend.dto.request.UpdateHouseholdTaskRequest;
import com.ebp04.backend.dto.request.UpdateTaskPriorityDeadlineRequest;
import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.HouseholdTaskResponse;
import com.ebp04.backend.service.HouseholdTaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/households")
@RequiredArgsConstructor
public class HouseholdTaskController {

    private final HouseholdTaskService householdTaskService;

    @GetMapping("/{householdId}/tasks")
    public ResponseEntity<List<HouseholdTaskResponse>> getTasks(
            @PathVariable Long householdId,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        List<HouseholdTaskResponse> response = householdTaskService.getTasks(householdId, correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{householdId}/tasks")
    public ResponseEntity<HouseholdTaskResponse> createTask(
            @PathVariable Long householdId,
            @Valid @RequestBody CreateHouseholdTaskRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdTaskResponse response = householdTaskService.createTask(householdId, request, correoAutenticado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{householdId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse> deleteTask(
            @PathVariable Long householdId,
            @PathVariable Long taskId,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        ApiResponse response = householdTaskService.deleteTask(householdId, taskId, correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{householdId}/tasks/{taskId}")
    public ResponseEntity<HouseholdTaskResponse> updateTask(
            @PathVariable Long householdId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateHouseholdTaskRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdTaskResponse response = householdTaskService.updateTask(
                householdId,
                taskId,
                request,
                correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{householdId}/tasks/{taskId}/priority-deadline")
    public ResponseEntity<HouseholdTaskResponse> updateTaskPriorityDeadline(
            @PathVariable Long householdId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskPriorityDeadlineRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdTaskResponse response = householdTaskService.updateTaskPriorityDeadline(
                householdId,
                taskId,
                request,
                correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{householdId}/tasks/{taskId}/assign")
    public ResponseEntity<HouseholdTaskResponse> assignTask(
            @PathVariable Long householdId,
            @PathVariable Long taskId,
            @Valid @RequestBody AssignHouseholdTaskRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdTaskResponse response = householdTaskService.assignTask(
                householdId,
                taskId,
                request,
                correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{householdId}/tasks/{taskId}/accept")
    public ResponseEntity<HouseholdTaskResponse> acceptTask(
            @PathVariable Long householdId,
            @PathVariable Long taskId,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdTaskResponse response = householdTaskService.acceptTask(householdId, taskId, correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{householdId}/tasks/{taskId}/reject")
    public ResponseEntity<HouseholdTaskResponse> rejectTask(
            @PathVariable Long householdId,
            @PathVariable Long taskId,
            @Valid @RequestBody RejectHouseholdTaskRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdTaskResponse response = householdTaskService.rejectTask(
                householdId,
                taskId,
                request,
                correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{householdId}/tasks/{taskId}/unassign")
    public ResponseEntity<HouseholdTaskResponse> unassignTask(
            @PathVariable Long householdId,
            @PathVariable Long taskId,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdTaskResponse response = householdTaskService.unassignTask(householdId, taskId, correoAutenticado);
        return ResponseEntity.ok(response);
    }
}
