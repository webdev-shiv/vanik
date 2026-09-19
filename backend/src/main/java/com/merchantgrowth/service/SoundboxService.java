package com.merchantgrowth.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Isolated Soundbox integration service.
 * Prepares and dispatches voice scripts to authorized Paytm Soundbox devices.
 * If live hardware connection is unavailable, provides honest diagnostic status
 * and safely delegates audio delivery to Web Speech client-side synthesis without faking hardware calls.
 */
public interface SoundboxService {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class SoundboxStatus {
        private String soundboxId;
        private String connectionState; // "OFFLINE", "CONNECTED_DEMO", "CONNECTED_LIVE"
        private boolean hardwareAvailable;
        private String batteryLevel;
        private String networkType; // "4G", "WIFI"
        private String supportedCodec;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class SoundboxDispatchResult {
        private boolean success;
        private String soundboxId;
        private String status; // "DISPATCHED", "SOUNDBOX_OFFLINE", "QUEUED"
        private String fallbackChannel; // "WEB_SPEECH_AUDIO"
        private String message;
    }

    SoundboxStatus getSoundboxStatus(String merchantId, String soundboxId);

    SoundboxDispatchResult dispatchVoiceAnnouncement(String merchantId, String soundboxId, String voiceScript, String audioUrl);
}
