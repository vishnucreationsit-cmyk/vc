package com.leather.attendancesystem.service;

import com.leather.attendancesystem.model.AppConfig;
import com.leather.attendancesystem.repository.AppConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

import io.github.cdimascio.dotenv.Dotenv;

@Service
@RequiredArgsConstructor
public class GeofenceService {

    private final AppConfigRepository appConfigRepository;

    private double getDefaultLat() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String latStr = dotenv.get("HQ_LATITUDE", System.getenv("HQ_LATITUDE"));
        return latStr != null ? Double.parseDouble(latStr) : 12.861320;
    }

    private double getDefaultLng() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String lngStr = dotenv.get("HQ_LONGITUDE", System.getenv("HQ_LONGITUDE"));
        return lngStr != null ? Double.parseDouble(lngStr) : 77.654258;
    }

    private double getDefaultRadius() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String radiusStr = dotenv.get("HQ_RADIUS_METERS", System.getenv("HQ_RADIUS_METERS"));
        return radiusStr != null ? Double.parseDouble(radiusStr) : 200.0;
    }

    @PostConstruct
    public void initDefaultConfig() {
        if (!appConfigRepository.existsById("COMPANY_LAT")) {
            appConfigRepository.save(new AppConfig("COMPANY_LAT", String.valueOf(getDefaultLat())));
        }
        if (!appConfigRepository.existsById("COMPANY_LNG")) {
            appConfigRepository.save(new AppConfig("COMPANY_LNG", String.valueOf(getDefaultLng())));
        }
        if (!appConfigRepository.existsById("COMPANY_RADIUS")) {
            appConfigRepository.save(new AppConfig("COMPANY_RADIUS", String.valueOf(getDefaultRadius())));
        }
    }

    public double getCompanyLat() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String envLat = dotenv.get("HQ_LATITUDE", System.getenv("HQ_LATITUDE"));
        if (envLat != null && !envLat.trim().isEmpty()) {
            return Double.parseDouble(envLat);
        }
        return Double.parseDouble(appConfigRepository.findById("COMPANY_LAT")
                .map(AppConfig::getConfigValue)
                .orElse(String.valueOf(getDefaultLat())));
    }

    public double getCompanyLng() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String envLng = dotenv.get("HQ_LONGITUDE", System.getenv("HQ_LONGITUDE"));
        if (envLng != null && !envLng.trim().isEmpty()) {
            return Double.parseDouble(envLng);
        }
        return Double.parseDouble(appConfigRepository.findById("COMPANY_LNG")
                .map(AppConfig::getConfigValue)
                .orElse(String.valueOf(getDefaultLng())));
    }

    public double getAllowedRadiusMeters() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String envRadius = dotenv.get("HQ_RADIUS_METERS", System.getenv("HQ_RADIUS_METERS"));
        if (envRadius != null && !envRadius.trim().isEmpty()) {
            return Double.parseDouble(envRadius);
        }
        return Double.parseDouble(appConfigRepository.findById("COMPANY_RADIUS")
                .map(AppConfig::getConfigValue)
                .orElse(String.valueOf(getDefaultRadius())));
    }

    public void updateGeofenceSettings(double lat, double lng, double radius) {
        appConfigRepository.save(new AppConfig("COMPANY_LAT", String.valueOf(lat)));
        appConfigRepository.save(new AppConfig("COMPANY_LNG", String.valueOf(lng)));
        appConfigRepository.save(new AppConfig("COMPANY_RADIUS", String.valueOf(radius)));
    }

    /**
     * Calculates the distance between two coordinates in meters using the Haversine formula.
     */
    public double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c * 1000; // convert to meters

        return distance;
    }

    public boolean isWithinGeofence(double employeeLat, double employeeLng) {
        double distance = calculateDistanceMeters(getCompanyLat(), getCompanyLng(), employeeLat, employeeLng);
        return distance <= getAllowedRadiusMeters();
    }
}
