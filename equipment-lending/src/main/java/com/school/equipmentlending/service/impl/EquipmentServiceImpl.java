package com.school.equipmentlending.service.impl;

import com.school.equipmentlending.model.Equipment;
import com.school.equipmentlending.repository.BorrowRequestRepository;
import com.school.equipmentlending.repository.EquipmentRepository;
import com.school.equipmentlending.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final BorrowRequestRepository borrowRequestRepository;

    @Override
    public Equipment addEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    @Override
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @Override
    public List<Equipment> getAvailableEquipment() {
        return equipmentRepository.findByAvailableQuantityGreaterThan(0);
    }

    @Override
    public Equipment updateEquipment(Long id, Equipment updatedEquipment) {
        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found!"));
        existing.setName(updatedEquipment.getName());
        existing.setCategory(updatedEquipment.getCategory());
        existing.setConditionStatus(updatedEquipment.getConditionStatus());
        existing.setQuantity(updatedEquipment.getQuantity());
        existing.setAvailableQuantity(updatedEquipment.getAvailableQuantity());
        return equipmentRepository.save(existing);
    }

    @Override
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found!"));

        if (!borrowRequestRepository.findByEquipment(equipment).isEmpty()) {
            throw new RuntimeException("Cannot delete equipment with existing borrow requests!");
        }

        equipmentRepository.deleteById(id);
    }
}
