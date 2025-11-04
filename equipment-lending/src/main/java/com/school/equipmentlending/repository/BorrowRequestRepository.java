package com.school.equipmentlending.repository;

import com.school.equipmentlending.model.BorrowRequest;
import com.school.equipmentlending.model.User;
import com.school.equipmentlending.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    List<BorrowRequest> findByUser(User user);

    List<BorrowRequest> findByEquipment(Equipment equipment);

    // ✅ Check if the same user already has an active (PENDING/APPROVED) request for this equipment
    @Query("""
        SELECT br FROM BorrowRequest br
        WHERE br.equipment.id = :equipmentId
          AND br.user.id = :userId
          AND br.status IN ('APPROVED', 'PENDING')
    """)
    List<BorrowRequest> findActiveRequestsByUserAndEquipment(
            @Param("equipmentId") Long equipmentId,
            @Param("userId") Long userId
    );
}
