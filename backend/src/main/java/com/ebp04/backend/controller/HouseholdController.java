package com.ebp04.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebp04.backend.dto.request.AddMemberRequest;
import com.ebp04.backend.dto.request.CreateHouseholdRequest;
import com.ebp04.backend.dto.request.UpdateHouseholdMemberRoleRequest;
import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.HouseholdMemberResponse;
import com.ebp04.backend.dto.response.HouseholdResponse;
import com.ebp04.backend.service.HouseholdService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/households")
@RequiredArgsConstructor
public class HouseholdController {

    private final HouseholdService householdService;

    @GetMapping
    public ResponseEntity<List<HouseholdResponse>> getHouseholds(Authentication authentication) {
        String correoAutenticado = authentication.getName();
        List<HouseholdResponse> response = householdService.getHouseholds(correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<HouseholdResponse> createHousehold(
            @Valid @RequestBody CreateHouseholdRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdResponse response = householdService.createHousehold(request, correoAutenticado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{householdId}/members")
    public ResponseEntity<ApiResponse> addMember(
            @PathVariable Long householdId,
            @Valid @RequestBody AddMemberRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        ApiResponse response = householdService.addMember(householdId, request, correoAutenticado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{householdId}/members")
    public ResponseEntity<List<HouseholdMemberResponse>> getMembers(
            @PathVariable Long householdId,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        List<HouseholdMemberResponse> response = householdService.getMembers(householdId, correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{householdId}/members/{userId}")
    public ResponseEntity<ApiResponse> removeMember(
            @PathVariable Long householdId,
            @PathVariable Long userId,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        ApiResponse response = householdService.removeMember(householdId, userId, correoAutenticado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{householdId}/members/{userId}/role")
    public ResponseEntity<HouseholdMemberResponse> updateMemberRole(
            @PathVariable Long householdId,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateHouseholdMemberRoleRequest request,
            Authentication authentication) {

        String correoAutenticado = authentication.getName();
        HouseholdMemberResponse response = householdService.updateMemberRole(
                householdId,
                userId,
                request,
                correoAutenticado);
        return ResponseEntity.ok(response);
    }
}
