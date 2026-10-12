
package com.roadwatch.backend.dto;

public class ReportResponseDTO {

    private Long id;
    private String type;
    private String severity;
    private String location;
    private String description;
    private String status;
    private String reviewStatus;
    private int confirmationCount;

    public ReportResponseDTO() {
    }

    public ReportResponseDTO(
        Long id,
        String type,
        String severity,
        String location,
        String description,
        String status,
        String reviewStatus,
        int confirmationCount
    ) {
        this.id = id;
        this.type = type;
        this.severity = severity;
        this.location = location;
        this.description = description;
        this.status = status;
        this.reviewStatus = reviewStatus;
        this.confirmationCount = confirmationCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public int getConfirmationCount() {
        return confirmationCount;
    }

    public void setConfirmationCount(int confirmationCount) {
        this.confirmationCount = confirmationCount;
    }
}
