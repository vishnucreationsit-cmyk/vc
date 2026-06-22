package com.leather.attendancesystem.controller;

import com.leather.attendancesystem.model.Order;
import com.leather.attendancesystem.model.OrderImage;
import com.leather.attendancesystem.repository.OrderImageRepository;
import com.leather.attendancesystem.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderImageRepository orderImageRepository;

    @Autowired
    private Cloudinary cloudinary;

    private static final String UPLOAD_DIR = "uploads/orders/";

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        // Generate Order Number
        String maxOrderNo = orderRepository.findMaxOrderNumber();
        if (maxOrderNo == null) {
            order.setOrderNumber("ORD-1001");
        } else {
            try {
                int nextId = Integer.parseInt(maxOrderNo.split("-")[1]) + 1;
                order.setOrderNumber("ORD-" + nextId);
            } catch (Exception e) {
                order.setOrderNumber("ORD-" + System.currentTimeMillis());
            }
        }
        
        if (order.getStatus() == null || order.getStatus().isEmpty()) {
            order.setStatus("Order Received");
        }
        order.setProgressPercentage(10); // Initial progress

        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.ok(savedOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order orderDetails) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setCompanyName(orderDetails.getCompanyName());
                    order.setClientContactPerson(orderDetails.getClientContactPerson());
                    order.setMobileNumber(orderDetails.getMobileNumber());
                    order.setEmail(orderDetails.getEmail());
                    order.setProductName(orderDetails.getProductName());
                    order.setProductCategory(orderDetails.getProductCategory());
                    order.setQuantity(orderDetails.getQuantity());
                    order.setUnitPrice(orderDetails.getUnitPrice());
                    order.setTotalValue(orderDetails.getTotalValue());
                    order.setOrderDate(orderDetails.getOrderDate());
                    order.setProductionStartDate(orderDetails.getProductionStartDate());
                    order.setExpectedDeliveryDate(orderDetails.getExpectedDeliveryDate());
                    order.setActualDeliveryDate(orderDetails.getActualDeliveryDate());
                    order.setPriority(orderDetails.getPriority());
                    order.setDescription(orderDetails.getDescription());
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return orderRepository.findById(id)
                .map(order -> {
                    if (updates.containsKey("status")) {
                        order.setStatus(updates.get("status").toString());
                    }
                    if (updates.containsKey("progressPercentage")) {
                        order.setProgressPercentage(Integer.parseInt(updates.get("progressPercentage").toString()));
                    }
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<?> uploadImages(@PathVariable Long id,
                                          @RequestParam(value = "files", required = false) List<MultipartFile> files,
                                          @RequestParam(value = "imageType", required = false) String imageType) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No files provided in the request"));
        }
        if (imageType == null || imageType.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imageType is required"));
        }
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        List<OrderImage> savedImages = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                // Upload to Cloudinary
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                String fileUrl = uploadResult.get("url").toString();

                OrderImage image = new OrderImage();
                image.setOrder(order);
                image.setImageUrl(fileUrl);
                image.setImageType(imageType); // Sample, Production, Finished
                
                savedImages.add(orderImageRepository.save(image));
            }
            return ResponseEntity.ok(savedImages);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Could not upload files: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(order -> {
                    orderRepository.delete(order);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        return orderImageRepository.findById(imageId)
                .map(image -> {
                    try {
                        String imageUrl = image.getImageUrl();
                        if (imageUrl.contains("cloudinary")) {
                            // Extract public ID and delete from Cloudinary if needed
                            // For now we just orphan it
                        } else {
                            String fileName = imageUrl.substring("/uploads/orders/".length());
                            Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName);
                            Files.deleteIfExists(filePath);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    orderImageRepository.delete(image);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
