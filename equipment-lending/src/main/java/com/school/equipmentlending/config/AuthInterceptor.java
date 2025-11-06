package com.school.equipmentlending.config;

import com.school.equipmentlending.controller.UserController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return true;
        }
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Public endpoints
        if (path.startsWith("/api/users/login") ||
                path.startsWith("/api/users/register") ||
                path.startsWith("/api/public")) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !UserController.tokenStore.containsKey(token)) {
            log.warn("Unauthorized request: {} {} (missing or invalid token)", method, path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized or invalid token\"}");
            return false;
        }

        // Optional: attach user ID to request for downstream use
        Long userId = UserController.tokenStore.get(token);
        request.setAttribute("userId", userId);

        log.debug("Authorized userId={} for {} {}", userId, method, path);
        return true;
    }
}
