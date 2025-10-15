package com.school.equipmentlending.controller;

import com.school.equipmentlending.model.BorrowRequest;
import com.school.equipmentlending.model.User;
import com.school.equipmentlending.service.BorrowRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody BorrowRequest request) {
        try {
            BorrowRequest created = borrowRequestService.createRequest(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<BorrowRequest>> getAllRequests() {
        return ResponseEntity.ok(borrowRequestService.getAllRequests());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BorrowRequest>> getRequestsByUser(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        return ResponseEntity.ok(borrowRequestService.getRequestsByUser(user));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<BorrowRequest> approveRequest(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String remarks = body.getOrDefault("remarks", "");
        return ResponseEntity.ok(borrowRequestService.approveRequest(id, remarks));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BorrowRequest> rejectRequest(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String remarks = body.getOrDefault("remarks", "");
        return ResponseEntity.ok(borrowRequestService.rejectRequest(id, remarks));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<BorrowRequest> markReturned(@PathVariable Long id) {
        return ResponseEntity.ok(borrowRequestService.markReturned(id));
    }
}
