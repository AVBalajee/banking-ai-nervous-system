package com.bank.eventcollector.service;

import com.bank.eventcollector.config.KafkaTopicConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void publishRawSignal(String sourceType, String content) {
        String payload = "{\"sourceType\":\"" + sourceType + "\",\"content\":" + jsonEscape(content) + "}";
        kafkaTemplate.send(KafkaTopicConfig.RAW_SIGNALS_TOPIC, sourceType, payload);
        log.info("Published raw signal from source={}", sourceType);
    }

    private String jsonEscape(String raw) {
        return "\"" + raw.replace("\"", "\\\"").replace("\n", " ") + "\"";
    }
}
