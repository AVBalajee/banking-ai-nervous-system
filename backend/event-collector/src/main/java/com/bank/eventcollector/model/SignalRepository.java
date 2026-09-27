package com.bank.eventcollector.model;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SignalRepository extends JpaRepository<RawSignal, Long> {
}
