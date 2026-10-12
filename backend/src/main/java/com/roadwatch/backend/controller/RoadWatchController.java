
package com.roadwatch.backend.controller;

import com.roadwatch.backend.dto.ReportRequestDTO;
import com.roadwatch.backend.dto.ReportResponseDTO;
import com.roadwatch.backend.entity.RoadReport;
import com.roadwatch.backend.entity.ReportComment;
import com.roadwatch.backend.service.RoadReportService;
import com.roadwatch.backend.repository.ReportCommentRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class RoadWatchController {

    private final RoadReportService roadReportService;
    private final ReportCommentRepository reportCommentRepository;

    public RoadWatchController(
            RoadReportService roadReportService,
            ReportCommentRepository reportCommentRepository) {
        this.roadReportService = roadReportService;
        this.reportCommentRepository = reportCommentRepository;
    }

    private RoadReport toEntity(ReportRequestDTO dto) {
        RoadReport report = new RoadReport();
        report.setType(dto.getType());
        report.setSeverity(dto.getSeverity());
        report.setLocation(dto.getLocation());
        report.setDescription(dto.getDescription());
        return report;
    }

    private ReportResponseDTO toDTO(RoadReport report) {
        return new ReportResponseDTO(
                report.getId(),
                report.getType(),
                report.getSeverity(),
                report.getLocation(),
                report.getDescription(),
                report.getStatus(),
                report.getReviewStatus(),
                report.getConfirmationCount());
    }

    @PostMapping
    public ReportResponseDTO createReport(
            @Valid @RequestBody ReportRequestDTO request) {
        return toDTO(
                roadReportService.createReport(toEntity(request)));
    }

    @GetMapping
    public List<ReportResponseDTO> getAllReports() {
        return roadReportService.getAllReports()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ReportResponseDTO getReportById(@PathVariable Long id) {
        RoadReport report = roadReportService.getReportById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found"));
        return toDTO(report);
    }

    @GetMapping("/{id}/comments")
    public List<ReportComment> getReportComments(
            @PathVariable Long id) {
        roadReportService.getReportById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found"));

        return reportCommentRepository
                .findByReportIdOrderByCreatedAtAsc(id);
    }

    @DeleteMapping("/{id}")
    public String deleteReport(@PathVariable Long id) {
        roadReportService.deleteReport(id);
        return "Road report deleted successfully!";
    }

    @PutMapping("/{id}")
    public ReportResponseDTO updateReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportRequestDTO request) {
        return toDTO(
                roadReportService.updateReport(id, toEntity(request)));
    }

    @GetMapping("/page")
    public Page<ReportResponseDTO> getReportsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid page or size");
        }

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return roadReportService.getReports(pageable)
                .map(this::toDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ReportResponseDTO updateReportStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return toDTO(
                roadReportService.updateReportStatus(id, status));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/review")
    public ReportResponseDTO updateReviewStatus(
            @PathVariable Long id,
            @RequestParam String reviewStatus) {
        return toDTO(
                roadReportService.updateReviewStatus(id, reviewStatus));
    }

    @GetMapping("/filter/status")
    public Page<ReportResponseDTO> getReportsByStatus(
            @RequestParam String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid page or size");
        }

        Pageable pageable = PageRequest.of(page, size);

        return roadReportService.getReportsByStatus(status, pageable)
                .map(this::toDTO);
    }

    @GetMapping("/filter/review")
    public Page<ReportResponseDTO> getReportsByReviewStatus(
            @RequestParam String reviewStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid page or size");
        }

        Pageable pageable = PageRequest.of(page, size);

        return roadReportService
                .getReportsByReviewStatus(reviewStatus, pageable)
                .map(this::toDTO);
    }
}
