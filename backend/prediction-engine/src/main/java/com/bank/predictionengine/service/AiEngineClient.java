package com.bank.predictionengine.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Thin client to the Python AI Intelligence Engine (FastAPI/LangChain service).
 * Keeps the Java side free of ML/LLM dependencies.
 */
@Service
@RequiredArgsConstructor
public class AiEngineClient {

    private final WebClient aiEngineWebClient;

    public Mono<Map> runFullPipeline(String text) {
        return aiEngineWebClient.post()
                .uri("/pipeline/full")
                .bodyValue(Map.of("text", text))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> simulateScenario(String scenarioKey, double magnitude) {
        return aiEngineWebClient.post()
                .uri("/scenario/simulate")
                .bodyValue(Map.of("scenario_key", scenarioKey, "magnitude", magnitude))
                .retrieve()
                .bodyToMono(Map.class);
    }
}
