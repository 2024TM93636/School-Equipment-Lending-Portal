package com.school.equipmentlending.service.impl;

import com.school.equipmentlending.model.*;
import com.school.equipmentlending.repository.BorrowRequestRepository;
import com.school.equipmentlending.repository.EquipmentRepository;
import com.school.equipmentlending.service.BorrowRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowRequestServiceImpl implements BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentRepository equipmentRepository;

    @Override
    public BorrowRequest createRequest(BorrowRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipment().getId())
                .orElseThrow(() -> new RuntimeException("Equipment not found!"));
        User user = request.getUser(); // optionally load from DB if needed

        if (equipment.getAvailableQuantity() <= 0) {
            throw new RuntimeException("Equipment not available!");
        }

        // Reduce available count
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - 1);
        equipmentRepository.save(equipment);

        request.setEquipment(equipment);
        request.setUser(user);
        request.setStatus(BorrowRequest.RequestStatus.PENDING);
        request.setRequestDate(java.time.LocalDateTime.now());

        return borrowRequestRepository.save(request);
    }

    @Override
    public List<BorrowRequest> getRequestsByUser(User user) {
        return borrowRequestRepository.findByUser(user);
    }

    @Override
    public List<BorrowRequest> getAllRequests() {
        return borrowRequestRepository.findAll();
    }

    @Override
    public BorrowRequest approveRequest(Long id, String remarks) {
        BorrowRequest request = borrowRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found!"));
        request.setStatus(BorrowRequest.RequestStatus.APPROVED);
        request.setAdminRemarks(remarks);
        return borrowRequestRepository.save(request);
    }

    @Override
    public BorrowRequest rejectRequest(Long id, String remarks) {
        BorrowRequest request = borrowRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found!"));
        request.setStatus(BorrowRequest.RequestStatus.REJECTED);
        request.setAdminRemarks(remarks);

        // Return the item to available pool
        Equipment eq = request.getEquipment();
        eq.setAvailableQuantity(eq.getAvailableQuantity() + 1);
        equipmentRepository.save(eq);

        return borrowRequestRepository.save(request);
    }

    @Override
    public BorrowRequest markReturned(Long id) {
        BorrowRequest request = borrowRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found!"));
        request.setStatus(BorrowRequest.RequestStatus.RETURNED);

        // Add back one item to available pool
        Equipment eq = request.getEquipment();
        eq.setAvailableQuantity(eq.getAvailableQuantity() + 1);
        equipmentRepository.save(eq);

        return borrowRequestRepository.save(request);
    }
}
