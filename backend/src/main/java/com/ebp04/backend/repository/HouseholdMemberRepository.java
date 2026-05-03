package com.ebp04.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ebp04.backend.entity.HouseholdMember;
import com.ebp04.backend.entity.HouseholdRole;

public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, Long> {

    boolean existsByHouseholdIdAndUserId(Long householdId, Long userId);

    Optional<HouseholdMember> findByHouseholdIdAndUserId(Long householdId, Long userId);

    List<HouseholdMember> findByUserId(Long userId);

    List<HouseholdMember> findByHouseholdId(Long householdId);

    long countByHouseholdIdAndRole(Long householdId, HouseholdRole role);
}
