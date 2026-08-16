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
        if (id != null && (id.equals("mock-matched-id") || id.startsWith("mock-"))) {
            byte[] mockData = ("ProjectPilot Demo File:\n\n" +
                "This is a mock weekly progress report file automatically served by the system " +
                "because this report was flagged with high semantic similarity during demo/simulation.\n\n" +
                "Original Text:\n" +
                "- Fully implemented database user profile registration endpoints.\n" +
                "- Configured Spring Security to support JWT authentication for microservices.\n" +
                "- Connected components to local MongoDB cluster and verified data persistence.").getBytes();
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Mock_Similarity_Reference.txt\"")
                .body(mockData);
        }

        return dbFileRepository.findById(id)
            .map(file -> ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .body(file.getData()))
            .orElseGet(() -> {
                byte[] mockData = ("ProjectPilot Demo File:\n\n" +
                    "This is a placeholder document automatically served because the original uploaded document is currently offline/not found in the database.\n\n" +
                    "Requested File ID: " + id).getBytes();
                return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Offline_Report_Document.txt\"")
                    .body(mockData);
            });
    }
}
