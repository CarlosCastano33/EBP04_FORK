package com.ebp04.backend.service;

import com.ebp04.backend.dto.request.UpdateUserProfileRequest;
import com.ebp04.backend.dto.response.UserResponse;

public interface UserService {

    UserResponse getMe(String correoAutenticado);

    UserResponse updateMe(UpdateUserProfileRequest request, String correoAutenticado);
}
