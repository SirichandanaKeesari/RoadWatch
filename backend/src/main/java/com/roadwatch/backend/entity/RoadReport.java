package com.roadwatch.backend.entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;

@Entity
public class RoadReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @NotBlank(message = "Report type is required")
private String type;

@NotBlank(message = "Severity is required")
@Pattern(
    regexp = "(?i)Low|Medium|High",
    message = "Severity must be Low, Medium, or High"
)
private String severity;

private String status = "ACTIVE";

private String reviewStatus = "PENDING";


@NotBlank(message = "Location is required")
private String location;

@NotBlank(message = "Description is required")
private String description;

@Min(value = 0, message = "Confirmation count cannot be negative")
private int confirmationCount;

@OneToMany(
    mappedBy = "report",
    cascade = CascadeType.ALL,
    orphanRemoval = true
)
@JsonIgnore
private List<ReportComment> comments = new ArrayList<>();

    public RoadReport() {
    }

    public Long getId() {
        return id;
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
public User getUser() {
    return user;
}

public void setUser(User user) {
    this.user = user;
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

    public int getConfirmationCount() {
        return confirmationCount;
    }

    public void setConfirmationCount(int confirmationCount) {
        this.confirmationCount = confirmationCount;
    }
}