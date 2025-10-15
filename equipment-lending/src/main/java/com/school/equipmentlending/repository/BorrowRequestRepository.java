package com.school.equipmentlending.repository;

import com.school.equipmentlending.model.BorrowRequest;
import com.school.equipmentlending.model.User;
import com.school.equipmentlending.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    List<BorrowRequest> findByUser(User user);

    List<BorrowRequest> findByEquipment(Equipment equipment);
}
