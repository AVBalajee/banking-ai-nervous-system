package com.bank.eventcollector.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "raw_signals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RawSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** NEWS, RBI, SOCIAL, INTERNAL_TRANSACTION, INTERNAL_COMPLAINT, etc. */
    private String sourceType;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Instant receivedAt = Instant.now();
}
