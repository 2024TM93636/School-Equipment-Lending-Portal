package com.school.equipmentlending.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category;

    @Column(name = "condition_status")
    private String conditionStatus;

    private int quantity;

    @Column(name = "available_quantity")
    private int availableQuantity;
}
