package com.leather.attendancesystem.config;

import com.cloudinary.Cloudinary;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        
        String cloudName = dotenv.get("CLOUDINARY_CLOUD_NAME", System.getenv("CLOUDINARY_CLOUD_NAME"));
        String apiKey = dotenv.get("CLOUDINARY_API_KEY", System.getenv("CLOUDINARY_API_KEY"));
        String apiSecret = dotenv.get("CLOUDINARY_API_SECRET", System.getenv("CLOUDINARY_API_SECRET"));

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        
        return new Cloudinary(config);
    }
}
