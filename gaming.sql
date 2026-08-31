-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 30 Agu 2026 pada 09.58
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gaming`
--
USE `defaultdb`;

-- --------------------------------------------------------

--
-- Struktur dari tabel `badges`
--

DROP TABLE IF EXISTS `badges`;
CREATE TABLE `badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `image_url` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `badges`
--

INSERT INTO `badges` (`id`, `name`, `description`, `image_url`, `created_at`) VALUES
(1, 'Beginner Builder', 'Badge untuk pemula', '', '2026-08-10 13:59:16'),
(2, 'Creative Mind', 'Badge untuk siswa kreatif', '', '2026-08-10 13:59:16'),
(3, 'Script Master', 'Badge untuk kemampuan scripting', '', '2026-08-10 13:59:16'),
(4, 'Game Creator', 'Badge untuk pembuat game', '', '2026-08-10 13:59:16'),
(5, 'Master Developer', 'Badge untuk developer terbaik', '', '2026-08-10 13:59:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `gem_history`
--

DROP TABLE IF EXISTS `gem_history`;
CREATE TABLE `gem_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL,
  `gem` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `gem`, `rank`, `createdAt`, `updatedAt`) VALUES
(1, 'budi', '$2b$10$AYTsNKPH8ORmwRI9fBJJiOYWA4/O/CXLIusbsDJp5S57BJFCOIF3y', 'student', 250, 2, '2026-08-10 10:27:05', '2026-08-23 11:11:19'),
(2, 'budi2', '$2b$10$lt.DgEr0mw4NlYXBXO/nSOTUkSaDc0c699RY2Dg6AhOEmvSs6r/b2', 'student', 350, 2, '2026-08-10 10:28:28', '2026-08-23 11:01:29'),
(3, 'johnson', '$2b$10$7pxYUuagI039NAVtAeak0OzRKqFKPEGxETE9wq6NaoRdp/logo2ka', 'teacher', 0, 0, '2026-08-18 08:21:03', '2026-08-18 08:22:10');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `badge_id` int(11) NOT NULL,
  `obtained_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`badge_id`),
  KEY `badge_id` (`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user_badges`
--

INSERT INTO `user_badges` (`id`, `user_id`, `badge_id`, `obtained_at`) VALUES
(1, 1, 1, '2026-08-10 07:02:24');

ALTER TABLE `gem_history`
  ADD CONSTRAINT `gem_history_ibfk_1`
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
  ON DELETE CASCADE;

ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1`
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
  ON DELETE CASCADE,
  ADD CONSTRAINT `user_badges_ibfk_2`
  FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`)
  ON DELETE CASCADE;

COMMIT;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
