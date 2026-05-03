package com.ebp04.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ebp04.backend.entity.HouseholdTask;

public interface HouseholdTaskRepository extends JpaRepository<HouseholdTask, Long> {

    List<HouseholdTask> findByHouseholdId(Long householdId);

    List<HouseholdTask> findByHouseholdIdAndAsignadoAId(Long householdId, Long userId);

    Optional<HouseholdTask> findByIdAndHouseholdId(Long taskId, Long householdId);
}
