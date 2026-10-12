
package com.roadwatch.backend.service;

import java.util.List;
import java.util.Optional;

import com.roadwatch.backend.entity.RoadReport;
import com.roadwatch.backend.entity.ReportComment;
import com.roadwatch.backend.entity.User;
import com.roadwatch.backend.repository.RoadReportRepository;
import com.roadwatch.backend.repository.ReportCommentRepository;
import com.roadwatch.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class RoadReportService {

    private final RoadReportRepository roadReportRepository;
    private final ReportCommentRepository reportCommentRepository;
    private final UserRepository userRepository;

    public RoadReportService(
            RoadReportRepository roadReportRepository,
            ReportCommentRepository reportCommentRepository,
            UserRepository userRepository) {
        this.roadReportRepository = roadReportRepository;
        this.reportCommentRepository = reportCommentRepository;
        this.userRepository = userRepository;
    }

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in.");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found."));
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null &&
                user.getRole().equalsIgnoreCase("ADMIN");
    }

    private void checkReportOwnership(RoadReport report, User user) {
        if (isAdmin(user)) {
            return;
        }

        if (report.getUser() == null ||
                report.getUser().getId() == null ||
                !report.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only modify your own reports.");
        }
    }

    @Transactional
    public RoadReport createReport(RoadReport report) {
        User loggedInUser = getLoggedInUser();

        Optional<RoadReport> rejectedReport =
                roadReportRepository
                        .findByTypeIgnoreCaseAndLocationIgnoreCaseAndStatus(
                                report.getType(),
                                report.getLocation(),
                                "INVALID");

        if (rejectedReport.isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This issue has already been rejected.");
        }

        Optional<RoadReport> existingReport =
                roadReportRepository
                        .findByTypeIgnoreCaseAndLocationIgnoreCaseAndStatus(
                                report.getType(),
                                report.getLocation(),
                                "ACTIVE");

        if (existingReport.isPresent()) {
            RoadReport existing = existingReport.get();

            existing.setConfirmationCount(
                    existing.getConfirmationCount() + 1);

            ReportComment comment = new ReportComment();
            comment.setDescription(report.getDescription());
            comment.setUsername(loggedInUser.getName());
            comment.setReport(existing);

            reportCommentRepository.save(comment);

            return roadReportRepository.save(existing);
        }

        report.setUser(loggedInUser);
        report.setStatus("ACTIVE");
        report.setReviewStatus("PENDING");
        report.setConfirmationCount(1);

        RoadReport savedReport = roadReportRepository.save(report);

        ReportComment comment = new ReportComment();
        comment.setDescription(savedReport.getDescription());
        comment.setUsername(loggedInUser.getName());
        comment.setReport(savedReport);

        reportCommentRepository.save(comment);

        return savedReport;
    }

    public List<RoadReport> getAllReports() {
        return roadReportRepository.findAll();
    }

    public Optional<RoadReport> getReportById(Long id) {
        return roadReportRepository.findById(id);
    }

    @Transactional
    public void deleteReport(Long id) {
        RoadReport report = roadReportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found."));

        checkReportOwnership(report, getLoggedInUser());
        roadReportRepository.delete(report);
    }

    @Transactional
    public RoadReport updateReport(Long id, RoadReport updatedReport) {
        RoadReport existingReport = roadReportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found."));

        checkReportOwnership(existingReport, getLoggedInUser());

        existingReport.setType(updatedReport.getType());
        existingReport.setSeverity(updatedReport.getSeverity());
        existingReport.setLocation(updatedReport.getLocation());
        existingReport.setDescription(updatedReport.getDescription());

        return roadReportRepository.save(existingReport);
    }

    public Page<RoadReport> getReports(Pageable pageable) {
        return roadReportRepository.findAll(pageable);
    }

    @Transactional
    public RoadReport updateReportStatus(Long id, String status) {
        RoadReport report = roadReportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found."));

        if (status == null ||
                !List.of("ACTIVE", "RESOLVED", "INVALID")
                        .contains(status.toUpperCase())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be ACTIVE, RESOLVED, or INVALID.");
        }

        report.setStatus(status.toUpperCase());
        return roadReportRepository.save(report);
    }

    @Transactional
    public RoadReport updateReviewStatus(Long id, String reviewStatus) {
        RoadReport report = roadReportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found."));

        if (reviewStatus == null ||
                !List.of("PENDING", "APPROVED", "REJECTED")
                        .contains(reviewStatus.toUpperCase())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Review status must be PENDING, APPROVED, or REJECTED.");
        }

        String review = reviewStatus.toUpperCase();
        report.setReviewStatus(review);

        if (review.equals("REJECTED")) {
            report.setStatus("INVALID");
        } else if (review.equals("APPROVED") &&
                "INVALID".equalsIgnoreCase(report.getStatus())) {
            report.setStatus("ACTIVE");
        }

        return roadReportRepository.save(report);
    }

    public Page<RoadReport> getReportsByStatus(
            String status, Pageable pageable) {
        return roadReportRepository.findByStatusIgnoreCase(status, pageable);
    }

    public Page<RoadReport> getReportsByReviewStatus(
            String reviewStatus, Pageable pageable) {
        return roadReportRepository.findByReviewStatusIgnoreCase(
                reviewStatus, pageable);
    }
}
