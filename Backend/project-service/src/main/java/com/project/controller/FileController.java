package com.project.controller;

import com.project.entity.DBFile;
import com.project.repository.DBFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FileController {

    @Autowired
    private DBFileRepository dbFileRepository;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        DBFile dbFile = new DBFile(
            file.getOriginalFilename(),
            file.getContentType(),
            file.getBytes()
        );
        DBFile saved = dbFileRepository.save(dbFile);

        Map<String, String> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("fileName", saved.getFileName());
        response.put("fileUrl", "http://localhost:8082/api/files/download/" + saved.getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String id) {
        return dbFileRepository.findById(id)
            .map(file -> ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .body(file.getData()))
            .orElse(ResponseEntity.notFound().build());
    }
}
