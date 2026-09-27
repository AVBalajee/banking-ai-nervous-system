package com.bank.predictionengine.controller;

import com.bank.predictionengine.service.AiEngineClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Public API consumed by the React dashboard. Delegates the actual
 * intelligence to the Python AI engine; this layer owns auth, persistence,
 * and shaping the response for the frontend.
 */
@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final AiEngineClient aiEngineClient;

    public record AnalyzeRequest(String text) {}
    public record ScenarioRequest(String scenarioKey, double magnitude) {}

    @PostMapping("/analyze")
    public Mono<Map> analyze(@RequestBody AnalyzeRequest request) {
        return aiEngineClient.runFullPipeline(request.text());
    }

    @PostMapping("/scenario")
    public Mono<Map> scenario(@RequestBody ScenarioRequest request) {
        return aiEngineClient.simulateScenario(request.scenarioKey(), request.magnitude());
    }
}
