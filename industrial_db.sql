-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 15, 2025 at 05:51 AM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `industrial_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `machines`
--

CREATE TABLE `machines` (
  `id` int(11) NOT NULL,
  `machine_code` varchar(50) NOT NULL,
  `machine_name` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `year_installed` year(4) DEFAULT NULL,
  `status` enum('Active','Inactive','Under Maintenance') DEFAULT 'Active',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `machines`
--

INSERT INTO `machines` (`id`, `machine_code`, `machine_name`, `location`, `serial_number`, `brand`, `model`, `year_installed`, `status`, `description`, `created_at`, `updated_at`) VALUES
(1, 'MC-001', 'CNC Milling Machine', 'Workshop AV', 'SN-2020-001', 'Makita', 'MX-300', 2020, 'Active', 'Used for precision metal cutting operations.', '2025-10-10 14:26:39', '2025-10-10 16:49:57'),
(2, 'MC-002', 'Lathe Machine', 'Workshop B', 'SN-2019-004', 'Yamazaki Mazak', 'Quick Turn 250', 2019, 'Under Maintenance', 'Currently under spindle motor repair.', '2025-10-10 14:26:39', '2025-10-10 14:26:39'),
(3, 'MC-003', 'Hydraulic Press', 'Workshop C', 'SN-2018-009', 'Komatsu', 'HP-500', 2018, 'Inactive', 'Decommissioned and waiting for replacement.', '2025-10-10 14:26:39', '2025-10-10 14:26:39'),
(4, 'MC-004', 'Welding Robot', 'Assembly Area', 'SN-2021-013', 'KUKA', 'KR 10 R1420', 2021, 'Active', 'Automated welding arm for chassis assembly.', '2025-10-10 14:26:39', '2025-10-10 14:26:39'),
(5, 'MC-005', 'Injection Molding Machine', 'Production Line 2', 'SN-2022-020', 'Arburg', 'Allrounder 370S', 2022, 'Active', 'Used for producing plastic components.', '2025-10-10 14:26:39', '2025-10-10 14:26:39'),
(6, 'MC-006', 'Air Compressor', 'Utility Room', 'SN-2017-002', 'Atlas Copco', 'GA 55+', 2017, 'Under Maintenance', 'Undergoing filter and oil replacement.', '2025-10-10 14:26:39', '2025-10-10 14:26:39'),
(7, 'MC-007', 'Laser Cutting Machine', 'Workshop A', 'SN-2023-008', 'Trumpf', 'TruLaser 1030', 2023, 'Active', 'Used for sheet metal cutting.', '2025-10-10 14:26:39', '2025-10-10 14:26:39'),
(8, 'MC-008', '3D Printer', 'R&D Lab', 'SN-2020-007', 'Ultimaker', 'S5 Pro', 2020, 'Active', 'Used for prototyping and design testing.', '2025-10-10 14:26:39', '2025-10-10 14:26:39'),
(9, 'MC-009', 'Conveyor System', 'Production Line 1', 'SN-2019-015', 'Siemens', 'CV-900', 2019, 'Inactive', 'Scheduled for upgrade next quarter.', '2025-10-10 14:26:39', '2025-10-10 14:26:39'),
(10, 'MC-010', 'Packaging Machine', 'Packaging Area', 'SN-2021-030', 'Bosch', 'Pack 403', 2021, 'Active', 'Automated packaging line for final products.', '2025-10-10 14:26:39', '2025-10-10 14:26:39');

-- --------------------------------------------------------

--
-- Table structure for table `machine_issues`
--

CREATE TABLE `machine_issues` (
  `id` int(11) NOT NULL,
  `machine_id` int(11) DEFAULT NULL,
  `error_summary` varchar(255) DEFAULT NULL,
  `error_description` text DEFAULT NULL,
  `error_code` varchar(50) DEFAULT NULL,
  `occurred_at` datetime DEFAULT NULL,
  `reported_by_id` int(11) DEFAULT NULL,
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `status` enum('Open','On Progress','Pending Part','Closed') DEFAULT 'Open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `machine_issues`
--

INSERT INTO `machine_issues` (`id`, `machine_id`, `error_summary`, `error_description`, `error_code`, `occurred_at`, `reported_by_id`, `priority`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Spindle Overheating', 'Spindle temperature exceeded 85°C during continuous operation.', 'ERR-SPD-001', '2025-10-01 09:30:00', 3, 'High', 'Closed', '2025-10-10 14:25:28', '2025-10-11 03:53:32'),
(2, 2, 'Abnormal Vibration', 'Operator reported strong vibration and noise from spindle during turning.', 'ERR-VIB-004', '2025-09-29 14:15:00', 4, 'Critical', 'Closed', '2025-10-10 14:25:28', '2025-10-11 04:02:24'),
(3, 3, 'Hydraulic Pressure Drop', 'Pressure dropped from 200 bar to 120 bar unexpectedly.', 'ERR-HYD-010', '2025-09-25 11:20:00', 6, 'High', 'Closed', '2025-10-10 14:25:28', '2025-10-10 14:25:28'),
(4, 4, 'Arm Calibration Error', 'Robot arm calibration failed, movement misaligned by 5mm.', 'ERR-CAL-022', '2025-09-30 08:45:00', 2, 'Medium', 'Closed', '2025-10-10 14:25:28', '2025-10-10 14:25:28'),
(5, 5, 'Heater Temperature Fault', 'Barrel heater temperature fluctuating beyond control limit.', 'ERR-HTR-012', '2025-10-03 16:10:00', 3, 'High', 'On Progress', '2025-10-10 14:25:28', '2025-10-10 14:25:28'),
(6, 6, 'Low Air Pressure Output', 'Compressor unable to reach target pressure of 8 bar.', 'ERR-CMP-007', '2025-09-28 10:40:00', 1, 'Medium', 'Closed', '2025-10-10 14:25:28', '2025-10-10 14:25:28'),
(7, 7, 'Laser Beam Misalignment', 'Cutting precision decreased; beam not centered.', 'ERR-LSR-015', '2025-10-05 08:20:00', 2, 'Critical', 'On Progress', '2025-10-10 14:25:28', '2025-10-10 14:25:28'),
(8, 8, 'Filament Jam', 'Filament jammed during print, extrusion stopped mid-process.', 'ERR-FLM-002', '2025-10-02 14:50:00', 3, 'Low', 'Closed', '2025-10-10 14:25:28', '2025-10-10 14:25:28'),
(9, 9, 'Motor Overload', 'Conveyor stopped due to motor overload alarm.', 'ERR-MTR-005', '2025-09-27 13:25:00', 5, 'Medium', 'Closed', '2025-10-10 14:25:28', '2025-10-10 14:25:28'),
(10, 10, 'Sensor Fault', 'Package detection sensor intermittently fails.', 'ERR-SNS-018', '2025-10-04 10:10:00', 4, 'High', 'On Progress', '2025-10-10 14:25:28', '2025-10-10 14:25:28'),
(17, 2, 'test', 'tes', 'tes', '2025-10-11 12:16:00', 3, 'High', 'Open', '2025-10-11 05:16:00', '2025-10-14 16:11:05'),
(18, 2, 'tes', 'tes', 'tes', '2025-10-14 22:36:38', 2, 'Medium', 'On Progress', '2025-10-14 15:36:38', '2025-10-14 16:12:31'),
(19, 1, 'tes', 'tes', 'tes', '2025-10-14 23:18:27', 2, 'High', 'On Progress', '2025-10-14 16:18:27', '2025-10-14 16:19:39');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `name`, `email`, `address`) VALUES
(1, 1, 'John Doe', 'admin@admin.com', '1234 Elm Street, Springfield, IL 62704'),
(2, 2, 'Jane Smith', 'operator@operator.com', '5678 Oak Avenue, Lincoln, NE 68508'),
(3, 3, 'Michael Johnson', 'technician@technician.com', '9102 Pine Road, Chicago, IL 60601'),
(4, 6, 'Raynold', 'raynold@gmail.com', 'Jl. Sukaraya No. 10'),
(5, 7, 'Raygard', 'raygard@gmail.com', 'Jl. Permata hijau No. 100'),
(6, 8, 'Glen F', '', 'Jl. Permata No. 102'),
(7, 9, 'Tes tes1', '', 'Jl. R.A Kartini'),
(8, 10, 'tess trt', '', 'tes'),
(9, 11, 'tes13', '', 'tes');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `token` text DEFAULT NULL,
  `role` enum('admin','operator','technician') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `token`, `role`, `created_at`) VALUES
(1, 'admin', 'admin@admin.com', '$2b$10$d0Pdgk5tIm8cbHY0QjpyfeP9G5T7lbFgABk5DA98dH56KI4A01vT.', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwiaWF0IjoxNzYwNDU4NDQ4LCJleHAiOjE3NjA0NjIwNDh9.htUeeHp1C6ayy2JHj39Ra3fZRKZSAi161kGy48JiFqM', 'admin', '2025-10-08 08:12:12'),
(2, 'operator', 'operator@operator.com', '$2b$10$d0Pdgk5tIm8cbHY0QjpyfeP9G5T7lbFgABk5DA98dH56KI4A01vT.', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJvcGVyYXRvciIsInJvbGUiOiJvcGVyYXRvciIsImVtYWlsIjoib3BlcmF0b3JAb3BlcmF0b3IuY29tIiwiaWF0IjoxNzYwNDU4Nzk2LCJleHAiOjE3NjA0NjIzOTZ9.awD32Tbczf6VUsz1RSbry0QFtGR8J4zhpCWGAlJZJqA', 'operator', '2025-10-08 08:12:12'),
(3, 'technician', 'technician@tehchnician.com', '$2b$10$ETMvNBESyEqmSLAKkdcWpeZrpTPFgsqQitLlb2QE5j/8OrQlOC7be', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ0ZWNobmljaWFuIiwicm9sZSI6InRlY2huaWNpYW4iLCJlbWFpbCI6InRlY2huaWNpYW5AdGVoY2huaWNpYW4uY29tIiwiaWF0IjoxNzYwNDU4NzczLCJleHAiOjE3NjA0NjIzNzN9.d6bBCbKVDy9QEj4HNm-2M9cAXXCAFp_py_lNEiXzgm4', 'technician', '2025-10-08 08:12:12'),
(6, 'technician001', 'raynold@gmail.com', '$2b$10$ETMvNBESyEqmSLAKkdcWpeZrpTPFgsqQitLlb2QE5j/8OrQlOC7be', NULL, 'technician', '2025-10-10 15:36:32'),
(8, 'technician003', 'glen@gmail.com', '$2b$10$BDD1w3fVcvmX.025a/TdseMmIBh34RPA2uEsOlJwJ4LRTRQ1B54w.', NULL, 'technician', '2025-10-10 15:43:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `machines`
--
ALTER TABLE `machines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `machine_code` (`machine_code`);

--
-- Indexes for table `machine_issues`
--
ALTER TABLE `machine_issues`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `machines`
--
ALTER TABLE `machines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `machine_issues`
--
ALTER TABLE `machine_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
