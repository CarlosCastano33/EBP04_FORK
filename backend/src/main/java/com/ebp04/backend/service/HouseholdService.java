package com.ebp04.backend.service;

import java.util.List;

import com.ebp04.backend.dto.request.AddMemberRequest;
import com.ebp04.backend.dto.request.CreateHouseholdRequest;
import com.ebp04.backend.dto.request.UpdateHouseholdMemberRoleRequest;
import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.HouseholdMemberResponse;
import com.ebp04.backend.dto.response.HouseholdResponse;

public interface HouseholdService {

    HouseholdResponse createHousehold(CreateHouseholdRequest request, String correoAutenticado);

    ApiResponse addMember(Long householdId, AddMemberRequest request, String correoAutenticado);

    ApiResponse removeMember(Long householdId, Long userId, String correoAutenticado);

    HouseholdMemberResponse updateMemberRole(
            Long householdId,
            Long userId,
            UpdateHouseholdMemberRoleRequest request,
            String correoAutenticado);

    List<HouseholdResponse> getHouseholds(String correoAutenticado);

    List<HouseholdMemberResponse> getMembers(Long householdId, String correoAutenticado);
}
