-- backend/schema.sql
-- INI RUN FEST 2026 — results table
-- Run once: mysql -u user -p dbname < schema.sql

CREATE TABLE IF NOT EXISTS inirun_results (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  bib                   VARCHAR(20)  NOT NULL,
  name                  VARCHAR(150) NOT NULL,
  category              VARCHAR(30)  NOT NULL,        -- '5K', '10K', 'Half Marathon'
  gender                ENUM('M','F') NOT NULL,
  age_group             VARCHAR(20)  NULL,
  gun_time              TIME         NOT NULL,
  net_time              TIME         NOT NULL,
  pace                  VARCHAR(20)  NULL,             -- e.g. '4:48/km'
  rank_overall          INT          NULL,
  rank_category_gender  INT          NULL,             -- 1,2,3… basis podium
  city                  VARCHAR(100) NULL,
  photo_url             VARCHAR(255) NULL,
  checkpoint            VARCHAR(50)  NULL,
  UNIQUE KEY uniq_bib_category (bib, category),
  INDEX idx_category_gender             (category, gender),
  INDEX idx_rank_category_gender        (category, gender, rank_category_gender),
  INDEX idx_name                        (name),
  INDEX idx_rank_overall                (rank_overall)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
