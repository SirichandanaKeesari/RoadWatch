
package com.roadwatch.backend.repository;
import java.util.List;
import com.roadwatch.backend.entity.RoadReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoadReportRepository extends JpaRepository<RoadReport, Long> {

    Optional<RoadReport> findByTypeIgnoreCaseAndLocationIgnoreCaseAndStatus(
            String type,
            String location,
            String status
    );

    Page<RoadReport> findByStatusIgnoreCase(
            String status,
            Pageable pageable
    );

    Page<RoadReport> findByReviewStatusIgnoreCase(
            String reviewStatus,
            Pageable pageable
    );
    List<RoadReport> findByUserId(Long userId);
}
