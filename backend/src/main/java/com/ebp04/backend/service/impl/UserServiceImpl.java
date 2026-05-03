package com.ebp04.backend.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ebp04.backend.dto.request.UpdateUserProfileRequest;
import com.ebp04.backend.dto.response.UserResponse;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.exception.BusinessException;
import com.ebp04.backend.exception.ResourceNotFoundException;
import com.ebp04.backend.repository.UserRepository;
import com.ebp04.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getMe(String correoAutenticado) {
        User user = getUserByCorreo(correoAutenticado);
        return buildUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateMe(UpdateUserProfileRequest request, String correoAutenticado) {
        User user = getUserByCorreo(correoAutenticado);
        validateProfileUpdateRequest(request);

        if (request.getNombre() != null) {
            user.setNombre(request.getNombre());
        }
        if (request.getTelefono() != null) {
            user.setTelefono(request.getTelefono());
        }
        if (request.getEdad() != null) {
            user.setEdad(request.getEdad());
        }
        if (request.getSexo() != null) {
            user.setSexo(request.getSexo());
        }

        User savedUser = userRepository.save(user);
        return buildUserResponse(savedUser);
    }

    private User getUserByCorreo(String correo) {
        return userRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro un usuario con el correo proporcionado."));
    }

    private void validateProfileUpdateRequest(UpdateUserProfileRequest request) {
        if (request.getNombre() == null
                && request.getTelefono() == null
                && request.getEdad() == null
                && request.getSexo() == null) {
            throw new BusinessException("Debe modificar al menos un campo del perfil.");
        }

        if (request.getNombre() != null && !StringUtils.hasText(request.getNombre())) {
            throw new BusinessException("El nombre no puede estar vacio.");
        }
    }

    private UserResponse buildUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .nombre(user.getNombre())
                .correo(user.getCorreo())
                .telefono(user.getTelefono())
                .edad(user.getEdad())
                .sexo(user.getSexo())
                .timestamp(LocalDateTime.now())
                .build();
    }
}
