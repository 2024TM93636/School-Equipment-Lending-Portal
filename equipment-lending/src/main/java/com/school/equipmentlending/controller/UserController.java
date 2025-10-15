package com.school.equipmentlending.controller;

import com.school.equipmentlending.model.User;
import com.school.equipmentlending.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.concurrent.ConcurrentHashMap;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Allow all origins for now
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private static final Map<String, Long> tokenStore = new ConcurrentHashMap<>();

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User created = userService.registerUser(user);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> optionalUser = userService.findByEmail(email);

        if (optionalUser.isPresent() && optionalUser.get().getPassword().equals(password)) {
            // Simple simulated token (in real apps, use JWT)
            String token = UUID.randomUUID().toString();
            tokenStore.put(token, optionalUser.get().getId());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("user", optionalUser.get());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
