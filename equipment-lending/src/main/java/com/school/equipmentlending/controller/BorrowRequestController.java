package com.school.equipmentlending.controller;

import com.school.equipmentlending.model.BorrowRequest;
import com.school.equipmentlending.model.User;
import com.school.equipmentlending.service.BorrowRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
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
            log.info("Borrow request created for item ID: {} by user ID: {}",
                    request.getEquipment().getId(), request.getUser().getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("Failed to create borrow request: {}", e.getMessage());
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
    public ResponseEntity<BorrowRequest> approveRequest(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body) {
        String remarks = body.getOrDefault("remarks", "");
        log.info("Approving request ID: {} with remarks: {}", id, remarks);
        return ResponseEntity.ok(borrowRequestService.approveRequest(id, remarks));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BorrowRequest> rejectRequest(@PathVariable Long id,
                                                       @RequestBody Map<String, String> body) {
        String remarks = body.getOrDefault("remarks", "");
        log.info("Rejecting request ID: {} with remarks: {}", id, remarks);
        return ResponseEntity.ok(borrowRequestService.rejectRequest(id, remarks));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<BorrowRequest> markReturned(@PathVariable Long id) {
        log.info("Marking request ID: {} as returned", id);
        return ResponseEntity.ok(borrowRequestService.markReturned(id));
    }
}
