package com.school.equipmentlending.service;

import com.school.equipmentlending.model.Equipment;
import java.util.List;

public interface EquipmentService {
    Equipment addEquipment(Equipment equipment);
    List<Equipment> getAllEquipment();
    List<Equipment> getAvailableEquipment();
    Equipment updateEquipment(Long id, Equipment updatedEquipment);
    void deleteEquipment(Long id);
}
