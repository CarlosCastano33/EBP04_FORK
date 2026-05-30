package com.ebp04.backend.strategy;

import com.ebp04.backend.dto.request.UpdateHouseholdTaskRequest;
import com.ebp04.backend.entity.HouseholdMember;
import com.ebp04.backend.entity.HouseholdRole;
import com.ebp04.backend.entity.HouseholdTask;
import com.ebp04.backend.entity.User;

public interface TaskUpdatePermissionStrategy {

    boolean supports(HouseholdRole role);

    void validateTaskEditAccess(HouseholdMember member, User authenticatedUser, HouseholdTask task);

    void validateAllowedFields(UpdateHouseholdTaskRequest request);
}
