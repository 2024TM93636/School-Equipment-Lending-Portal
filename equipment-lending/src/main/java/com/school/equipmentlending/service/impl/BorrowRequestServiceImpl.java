package com.school.equipmentlending.service.impl;

import com.school.equipmentlending.exception.ResourceAlreadyExistsException;
import com.school.equipmentlending.model.*;
import com.school.equipmentlending.repository.BorrowRequestRepository;
import com.school.equipmentlending.repository.EquipmentRepository;
import com.school.equipmentlending.service.BorrowRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BorrowRequestServiceImpl implements BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentRepository equipmentRepository;

    @Override
    public BorrowRequest createRequest(BorrowRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipment().getId())
                .orElseThrow(() -> new RuntimeException("Equipment not found!"));

        User user = request.getUser();

        if (equipment.getAvailableQuantity() <= 0) {
            throw new RuntimeException("Equipment not available!");
        }

        // Prevent same user from borrowing same equipment multiple times
        List<BorrowRequest> existingRequests =
                borrowRequestRepository.findActiveRequestsByUserAndEquipment(
                        equipment.getId(), user.getId());

        if (!existingRequests.isEmpty()) {
            throw new ResourceAlreadyExistsException(
                    "You already have an active request or borrowed this equipment!");
        }

        // If allowed, reduce available count and create new request
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - 1);
        equipmentRepository.save(equipment);

        request.setEquipment(equipment);
        request.setUser(user);
        request.setStatus(BorrowRequest.RequestStatus.PENDING);
        request.setRequestDate(LocalDateTime.now());

        return borrowRequestRepository.save(request);
    }

    @Override
    public List<BorrowRequest> getRequestsByUser(User user) {
        return borrowRequestRepository.findByUserOrderByRequestDateDesc(user);
    }

    @Override
    public List<BorrowRequest> getAllRequests() {
        return borrowRequestRepository.findAllByOrderByRequestDateDesc();
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

        Equipment eq = request.getEquipment();
        int updatedAvailable = eq.getAvailableQuantity() + 1;
        if (updatedAvailable > eq.getQuantity()) {
            updatedAvailable = eq.getQuantity();
        }
        eq.setAvailableQuantity(updatedAvailable);
        equipmentRepository.save(eq);

        return borrowRequestRepository.save(request);
    }
}
