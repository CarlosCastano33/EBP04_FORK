package com.ebp04.backend.service.impl;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ebp04.backend.dto.request.LoginRequest;
import com.ebp04.backend.dto.request.RegisterRequest;
import com.ebp04.backend.dto.response.ApiResponse;
import com.ebp04.backend.dto.response.AuthResponse;
import com.ebp04.backend.entity.User;
import com.ebp04.backend.exception.BusinessException;
import com.ebp04.backend.repository.UserRepository;
import com.ebp04.backend.security.JwtService;
import com.ebp04.backend.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationConfiguration authenticationConfiguration;

    @Override
    public ApiResponse register(RegisterRequest request) {
        if (userRepository.existsByCorreo(request.getCorreo())) {
            throw new BusinessException("El correo ya se encuentra registrado.");
        }

        User user = User.builder()
                .nombre(request.getNombre())
                .correo(request.getCorreo())
                .password(passwordEncoder.encode(request.getPassword()))
                .activo(Boolean.TRUE)
                .build();

        userRepository.save(user);

        return ApiResponse.builder()
                .message("Usuario registrado exitosamente.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager().authenticate(
                    new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getPassword()));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Credenciales invalidas.");
        }

        User user = userRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new UsernameNotFoundException("No se encontro un usuario con el correo proporcionado."));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .nombre(user.getNombre())
                .correo(user.getCorreo())
                .timestamp(LocalDateTime.now())
                .build();
    }

    private AuthenticationManager authenticationManager() {
        try {
            return authenticationConfiguration.getAuthenticationManager();
        } catch (Exception ex) {
            throw new IllegalStateException("No fue posible obtener el AuthenticationManager.", ex);
        }
    }
}
