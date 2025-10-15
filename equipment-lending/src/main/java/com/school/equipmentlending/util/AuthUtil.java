package com.school.equipmentlending.util;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthUtil {

    // Shared token store (used in controllers)
    public static final Map<String, Long> tokenStore = new ConcurrentHashMap<>();

    public static Long validateToken(String token) {
        if (token == null || !tokenStore.containsKey(token)) {
            throw new RuntimeException("Unauthorized");
        }
        return tokenStore.get(token);
    }

    public static String extractToken(HttpHeaders headers) {
        if (headers.containsKey("Authorization")) {
            String authHeader = headers.getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }
        return null;
    }
}
