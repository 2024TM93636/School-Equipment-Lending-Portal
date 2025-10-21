package com.school.equipmentlending.service.impl;

import com.school.equipmentlending.exception.ResourceAlreadyExistsException;
import com.school.equipmentlending.exception.ResourceNotFoundException;
import com.school.equipmentlending.model.User;
import com.school.equipmentlending.repository.UserRepository;
import com.school.equipmentlending.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User registerUser(User user) {
        String normalizedEmail = user.getEmail().trim().toLowerCase();
        user.setEmail(normalizedEmail);

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Registration failed: Email {} is already registered", normalizedEmail);
            throw new ResourceAlreadyExistsException("Email already registered: " + normalizedEmail);
        }

        User savedUser = userRepository.save(user);
        log.info("New user registered successfully: {} ({})", savedUser.getName(), savedUser.getRole());
        return savedUser;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            log.error("User not found with id {}", id);
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        return userOpt;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOpt = findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt;
        }
        return Optional.empty();
    }
}
