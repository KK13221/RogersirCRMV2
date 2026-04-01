-- ============================================================
-- GBT Dashboard – Database Setup
-- Run this file in your MySQL client or phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS `gbt_dashboard`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `gbt_dashboard`;

-- Companies table
CREATE TABLE IF NOT EXISTS `companies` (
  `id`           INT(11)      NOT NULL AUTO_INCREMENT,
  `company_name` VARCHAR(255) NOT NULL,
  `owner_name`   VARCHAR(255) NOT NULL,
  `owner_mobile` VARCHAR(20)  NOT NULL,
  `owner_email`  VARCHAR(255) NOT NULL,
  `address`      TEXT         DEFAULT NULL,
  `admin_url`    VARCHAR(500) NOT NULL,
  `created_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_url` (`admin_url`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
