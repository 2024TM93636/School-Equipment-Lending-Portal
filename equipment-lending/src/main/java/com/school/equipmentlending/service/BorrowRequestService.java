package com.school.equipmentlending.service;

import com.school.equipmentlending.model.BorrowRequest;
import com.school.equipmentlending.model.User;
import java.util.List;

public interface BorrowRequestService {
    BorrowRequest createRequest(BorrowRequest request);
    List<BorrowRequest> getRequestsByUser(User user);
    List<BorrowRequest> getAllRequests();
    BorrowRequest approveRequest(Long id, String remarks);
    BorrowRequest rejectRequest(Long id, String remarks);
    BorrowRequest markReturned(Long id);
}
