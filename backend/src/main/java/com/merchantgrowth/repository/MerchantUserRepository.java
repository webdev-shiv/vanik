package com.merchantgrowth.repository;

import com.merchantgrowth.entity.MerchantUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchantUserRepository extends JpaRepository<MerchantUserEntity, String> {

    Optional<MerchantUserEntity> findByUsername(String username);

    Optional<MerchantUserEntity> findByEmail(String email);

    Optional<MerchantUserEntity> findByUsernameOrEmail(String username, String email);
}
