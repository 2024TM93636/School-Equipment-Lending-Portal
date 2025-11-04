package com.school.equipmentlending.service;

import com.school.equipmentlending.model.User;
import java.util.Optional;
import java.util.List;

public interface UserService {

    /**
     * Registers a new user if the email is not already taken.
     *
     * @param user The user object containing registration details.
     * @return The saved User entity.
     */
    User registerUser(User user);

    /**
     * Finds a user by their email address.
     *
     * @param email The user's email.
     * @return An Optional containing the User if found, or empty if not.
     */
    Optional<User> findByEmail(String email);

    /**
     * Retrieves a list of all users in the system.
     *
     * @return A list of all users.
     */
    List<User> getAllUsers();

    /**
     * Retrieves a user by their unique ID.
     *
     * @param id The user's ID.
     * @return An Optional containing the User if found, or empty if not.
     */
    Optional<User> getUserById(Long id);

    /**
     * Validates user credentials for login.
     *
     * @param email The user's email.
     * @param password The user's password.
     * @return An Optional containing the User if authentication succeeds, or empty if it fails.
     */
    Optional<User> authenticate(String email, String password);
}
