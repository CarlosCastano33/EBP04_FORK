package com.ebp04.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ebp04.backend.entity.Household;

public interface HouseholdRepository extends JpaRepository<Household, Long> {
}
