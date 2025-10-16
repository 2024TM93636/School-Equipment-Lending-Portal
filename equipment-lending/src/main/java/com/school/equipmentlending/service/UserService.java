package com.school.equipmentlending.service;

import com.school.equipmentlending.model.User;
import java.util.Optional;
import java.util.List;

public interface UserService {
    User registerUser(User user);
    Optional<User> findByEmail(String email);
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
}
