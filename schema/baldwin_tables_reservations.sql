SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `baldwin_tables_reservations` (
  `id` int(8) NOT NULL,
  `event_title` varchar(256) NOT NULL,
  `name` varchar(256) NOT NULL,
  `org_name` varchar(256) NOT NULL,
  `email` varchar(256) NOT NULL,
  `month` int(2) NOT NULL,
  `date` int(2) NOT NULL,
  `year` int(4) NOT NULL,
  `weekday` int(1) NOT NULL,
  `start_time` varchar(8) NOT NULL,
  `end_time` varchar(8) NOT NULL,
  `table_chosen` varchar(256) NOT NULL,
  `comments` varchar(500) NOT NULL,
  `reservation_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `baldwin_tables_reservations`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `baldwin_tables_reservations`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
