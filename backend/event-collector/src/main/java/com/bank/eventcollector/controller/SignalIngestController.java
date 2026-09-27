package com.bank.eventcollector.controller;

import com.bank.eventcollector.model.RawSignal;
import com.bank.eventcollector.model.SignalRepository;
import com.bank.eventcollector.service.KafkaProducerService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Entry point for both external (news/RBI/social) and internal
 * (transactions/complaints/branch) signals. Persists the raw signal
 * and publishes it to Kafka for the AI Intelligence Engine to consume.
 */
@RestController
@RequestMapping("/api/signals")
@RequiredArgsConstructor
public class SignalIngestController {

    private final SignalRepository repository;
    private final KafkaProducerService kafkaProducerService;

    public record IngestRequest(@NotBlank String sourceType, @NotBlank String content) {}

    @PostMapping
    public RawSignal ingest(@RequestBody IngestRequest request) {
        RawSignal saved = repository.save(new RawSignal(null, request.sourceType(), request.content(), null));
        kafkaProducerService.publishRawSignal(request.sourceType(), request.content());
        return saved;
    }

    @GetMapping
    public List<RawSignal> recent() {
        return repository.findAll();
    }
}
