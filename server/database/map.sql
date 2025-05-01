-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 16 Apr 2025 pada 09.44
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `map`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `boq`
--

CREATE TABLE `boq` (
  `boq_id` int(11) NOT NULL,
  `materials_id` int(11) NOT NULL,
  `locations_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `boq`
--

INSERT INTO `boq` (`boq_id`, `materials_id`, `locations_id`, `quantity`) VALUES
(1, 2, 1, 8),
(2, 1, 2, 644),
(3, 2, 3, 15),
(4, 1, 4, 128),
(5, 2, 5, 5),
(6, 1, 6, 26475),
(7, 2, 7, 6),
(8, 1, 8, 6393),
(9, 2, 9, 4),
(10, 1, 10, 7563),
(11, 2, 11, 2),
(12, 1, 12, 5304620),
(13, 2, 13, 4),
(14, 1, 14, 9145769),
(15, 2, 15, 5),
(16, 1, 16, 23132099),
(17, 2, 17, 4),
(18, 1, 18, 8663),
(19, 2, 19, 2),
(20, 1, 20, 1808),
(21, 2, 21, 4),
(22, 1, 22, 9642),
(23, 2, 23, 2),
(24, 1, 24, 940),
(25, 2, 25, 16),
(26, 1, 26, 138),
(27, 2, 27, 20),
(28, 1, 28, 49074),
(29, 2, 29, 4),
(30, 1, 30, 11160),
(31, 2, 31, 18),
(32, 1, 32, 100717),
(33, 2, 33, 4),
(34, 1, 34, 5080),
(35, 2, 35, 3),
(36, 1, 36, 6803),
(37, 2, 37, 4),
(38, 1, 38, 6244),
(39, 2, 39, 4),
(40, 1, 40, 6244),
(41, 2, 41, 4),
(42, 1, 42, 6244),
(43, 2, 43, 2),
(44, 1, 44, 2667),
(45, 2, 45, 4),
(46, 1, 46, 18208),
(47, 2, 47, 5),
(48, 1, 48, 6613),
(49, 2, 49, 5),
(50, 1, 50, 6613),
(51, 2, 51, 3),
(52, 1, 52, 9028),
(53, 2, 53, 3),
(54, 1, 54, 9028),
(55, 2, 55, 33),
(56, 1, 56, 12759973),
(57, 2, 57, 33),
(58, 1, 58, 12759973),
(59, 2, 59, 5),
(60, 1, 60, 75786),
(61, 2, 61, 5),
(62, 1, 62, 75786),
(63, 2, 63, 7),
(64, 1, 64, 8786),
(65, 2, 65, 7),
(66, 1, 66, 8786);

-- --------------------------------------------------------

--
-- Struktur dari tabel `locations`
--

CREATE TABLE `locations` (
  `locations_id` int(11) NOT NULL,
  `latt` decimal(10,6) NOT NULL,
  `lng` decimal(10,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `locations`
--

INSERT INTO `locations` (`locations_id`, `latt`, `lng`) VALUES
(1, -8.000000, 113.000000),
(2, -8.000000, 113.000000),
(3, -8.000000, 113.000000),
(4, -8.000000, 113.000000),
(5, -8.000000, 113.000000),
(6, -8.000000, 112.000000),
(7, -8.000000, 113.000000),
(8, -8.000000, 113.000000),
(9, -8.000000, 113.000000),
(10, -8.000000, 113.000000),
(11, -9.000000, 116.000000),
(12, 23.000000, 80.000000),
(13, 14.000000, 1.000000),
(14, 52.000000, 97.000000),
(15, -84.000000, 176.000000),
(16, -82.000000, 163.000000),
(17, -7.925069, 112.651721),
(18, -7.995452, 112.619448),
(19, -7.910445, 112.497675),
(20, -7.905004, 112.513125),
(21, -7.908064, 112.612345),
(22, -7.910445, 112.630198),
(23, -7.958800, 112.640185),
(24, -7.965260, 112.634692),
(25, -7.928848, 112.651912),
(26, -7.929778, 112.651429),
(27, -7.962726, 112.577731),
(28, -8.030723, 112.670428),
(29, -7.963560, 112.590403),
(30, -7.964240, 112.589717),
(31, -7.894872, 112.472987),
(32, -7.971442, 112.483605),
(33, -7.938536, 112.577934),
(34, -7.961180, 112.617011),
(35, -7.903034, 112.563109),
(36, -7.944996, 112.602997),
(37, -7.871558, 112.493281),
(38, -7.962491, 112.524867),
(39, -7.871558, 112.493281),
(40, -7.962491, 112.524867),
(41, -7.871558, 112.493281),
(42, -7.962491, 112.524867),
(43, -7.951388, 112.496196),
(44, -7.971108, 112.509929),
(45, -7.941741, 112.542147),
(46, -7.941061, 112.542147),
(47, -7.918278, 112.517772),
(48, -7.928140, 112.548671),
(49, -7.918278, 112.517772),
(50, -7.928140, 112.548671),
(51, -7.958732, 112.511302),
(52, -7.985252, 112.517825),
(53, -7.958732, 112.511302),
(54, -7.985252, 112.517825),
(55, -13.068296, 136.751493),
(56, -14.689404, 135.784696),
(57, -13.068296, 136.751493),
(58, -14.689404, 135.784696),
(59, -7.982533, 112.626315),
(60, -7.324778, 112.714895),
(61, -7.982533, 112.626315),
(62, -7.324778, 112.714895),
(63, -7.929490, 112.540141),
(64, -7.944451, 112.555247),
(65, -7.929490, 112.540141),
(66, -7.944451, 112.555247);

-- --------------------------------------------------------

--
-- Struktur dari tabel `materials`
--

CREATE TABLE `materials` (
  `materials_id` int(11) NOT NULL,
  `name` varchar(25) NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `unit` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `materials`
--

INSERT INTO `materials` (`materials_id`, `name`, `price`, `unit`) VALUES
(1, 'kabel', 5000, 'meter'),
(2, 'tiang', 40000, 'pcs');

-- --------------------------------------------------------

--
-- Struktur dari tabel `project`
--

CREATE TABLE `project` (
  `project_id` int(11) NOT NULL,
  `name` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`) VALUES
(1, 'iwAN', 'test@gmail.com', 'Rezky123');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `boq`
--
ALTER TABLE `boq`
  ADD PRIMARY KEY (`boq_id`),
  ADD KEY `materials_id` (`materials_id`),
  ADD KEY `locations_id` (`locations_id`);

--
-- Indeks untuk tabel `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`locations_id`);

--
-- Indeks untuk tabel `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`materials_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `boq`
--
ALTER TABLE `boq`
  MODIFY `boq_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT untuk tabel `locations`
--
ALTER TABLE `locations`
  MODIFY `locations_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT untuk tabel `materials`
--
ALTER TABLE `materials`
  MODIFY `materials_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `boq`
--
ALTER TABLE `boq`
  ADD CONSTRAINT `boq_ibfk_1` FOREIGN KEY (`locations_id`) REFERENCES `locations` (`locations_id`),
  ADD CONSTRAINT `boq_ibfk_2` FOREIGN KEY (`materials_id`) REFERENCES `materials` (`materials_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
