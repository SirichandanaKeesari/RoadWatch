
package com.roadwatch.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ReportRequestDTO {

    @NotBlank(message = "Issue type is required")
    @Pattern(
        regexp = "Pothole|Waterlogging|Accident|Roadblock",
        message = "Invalid issue type"
    )
    private String type;

    @NotBlank(message = "Severity is required")
    @Pattern(
        regexp = "Low|Medium|High",
        message = "Severity must be Low, Medium, or High"
    )
    private String severity;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location must be under 150 characters")
    private String location;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be under 1000 characters")
    private String description;

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
}
