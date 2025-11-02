package com.school.equipmentlending.repository;

import com.school.equipmentlending.model.BorrowRequest;
import com.school.equipmentlending.model.User;
import com.school.equipmentlending.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    List<BorrowRequest> findByUser(User user);

    List<BorrowRequest> findByEquipment(Equipment equipment);

    // ✅ Detect overlapping borrow requests for the same equipment
    @Query("""
        SELECT br FROM BorrowRequest br
        WHERE br.equipment.id = :equipmentId
          AND br.status IN ('APPROVED', 'PENDING')
          AND (
                (br.borrowStartDate <= :borrowEndDate)
                AND (br.borrowEndDate >= :borrowStartDate)
              )
    """)
    List<BorrowRequest> findOverlappingRequests(
            @Param("equipmentId") Long equipmentId,
            @Param("borrowStartDate") LocalDate borrowStartDate,
            @Param("borrowEndDate") LocalDate borrowEndDate
    );
}
