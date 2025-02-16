Create Table Address (
    address_id SERIAL PRIMARY KEY,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL
);


CREATE TABLE HotelChain (
    chain_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    central_office_address_id int  NOT NULL,
    number_of_hotels INT CHECK (number_of_hotels >= 0) default 0,
    email VARCHAR(100)  NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    FOREIGN KEY (central_office_address_id) REFERENCES Address(address_id)
);

CREATE TABLE Hotel (
    hotel_id SERIAL PRIMARY KEY,
    chain_id INT not null,
    name VARCHAR(100) not null,
    address_id int not null,
    number_of_rooms INT CHECK (number_of_rooms >= 0) default 0,
    email VARCHAR(100),
    phone_number VARCHAR(25),
    category INT check (category between 1 and 5),
    FOREIGN KEY (chain_id) REFERENCES HotelChain(chain_id) on delete cascade,
    FOREIGN KEY (address_id) REFERENCES Address(address_id) 
);

CREATE TABLE Room (
    room_id SERIAL PRIMARY KEY,
    hotel_id INT NOT NULL,
    price DECIMAL(10, 2) CHECK (price >= 0) NOT NULL,
    amenities TEXT,
    capacity VARCHAR(20),
    view VARCHAR(20) CHECK (view IN ('Sea', 'Mountain')) NOT NULL,
    is_extendable BOOLEAN DEFAULT false,
    problems TEXT,
    FOREIGN KEY (hotel_id) REFERENCES Hotel(hotel_id) ON DELETE CASCADE
);


CREATE TABLE Customer (
    customer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) not null,
    address VARCHAR(255),
    SSN VARCHAR(50) not null,
    registration_date DATE default CURRENT_DATE 
);

CREATE TABLE Employee (
    employee_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) not null,
    address VARCHAR(255),
    ssn VARCHAR(20) not null,
    hotel_id INT not null,
    role VARCHAR(50) not null,
    FOREIGN KEY (hotel_id) REFERENCES Hotel(hotel_id) on delete cascade
);

create table Payment (
    payment_id SERIAL PRIMARY KEY,
    payment_date DATE not null default CURRENT_DATE,
    amount DECIMAL(10, 2) check (amount >= 0) not null
);

CREATE TABLE Booking (
    booking_id SERIAL PRIMARY KEY,
    is_archived BOOLEAN default false,
    check_in_date DATE  not null,
    check_out_date DATE not null,
    booking_date DATE   not null default CURRENT_DATE,
    is_checkout BOOLEAN default false,
    room_id INT not null,
    customer_id INT not null,
    is_renting BOOLEAN default false,
    total_cost DECIMAL(10, 2) check (total_cost >= 0) not null,
    is_paid BOOLEAN default false,
    payment_id INT, 
    employee_id INT,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),     
    FOREIGN KEY (room_id) REFERENCES Room(room_id),
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id)
);



CREATE TABLE Manager (
    manager_id serial PRIMARY KEY,
    employee_id INT not null,
    hotel_id INT not null,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) on delete cascade,
    FOREIGN KEY (hotel_id) REFERENCES Hotel(hotel_id) on delete cascade
);


-- triggers

-- Create the function for IncrementHotelCount
CREATE OR REPLACE FUNCTION increment_hotel_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE HotelChain
    SET number_of_hotels = number_of_hotels + 1
    WHERE chain_id = NEW.chain_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the function after insert
CREATE TRIGGER IncrementHotelCount
AFTER INSERT ON Hotel
FOR EACH ROW
EXECUTE FUNCTION increment_hotel_count();

-- Create the function for DecrementHotelCount
CREATE OR REPLACE FUNCTION decrement_hotel_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE HotelChain
    SET number_of_hotels = number_of_hotels - 1
    WHERE chain_id = OLD.chain_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the function after delete
CREATE TRIGGER DecrementHotelCount
AFTER DELETE ON Hotel
FOR EACH ROW
EXECUTE FUNCTION decrement_hotel_count();

-- Create the function for IncrementRoomCount
CREATE OR REPLACE FUNCTION increment_room_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Hotel
    SET number_of_rooms = number_of_rooms + 1
    WHERE hotel_id = NEW.hotel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the function after insert
CREATE TRIGGER IncrementRoomCount
AFTER INSERT ON Room
FOR EACH ROW
EXECUTE FUNCTION increment_room_count();

-- Create the function for DecrementRoomCount
CREATE OR REPLACE FUNCTION decrement_room_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Hotel
    SET number_of_rooms = number_of_rooms - 1
    WHERE hotel_id = OLD.hotel_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the function after delete
CREATE TRIGGER DecrementRoomCount
AFTER DELETE ON Room
FOR EACH ROW
EXECUTE FUNCTION decrement_room_count();

-- Create the function for archive_past_bookings
CREATE OR REPLACE FUNCTION archive_past_bookings()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Booking
    SET is_archived = TRUE
    WHERE check_out_date < CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ArchivePastBookings
AFTER INSERT OR UPDATE ON Booking
FOR EACH ROW
EXECUTE FUNCTION archive_past_bookings();

-- Create the function for prevent_double_booking
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM Booking
        WHERE room_id = NEW.room_id
        AND (
            (NEW.check_in_date BETWEEN check_in_date AND check_out_date)
            OR
            (NEW.check_out_date BETWEEN check_in_date AND check_out_date)
        )
    ) THEN
        RAISE EXCEPTION 'This room is already booked for the given dates.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER PreventDoubleBooking
BEFORE INSERT ON Booking
FOR EACH ROW
EXECUTE FUNCTION prevent_double_booking();


--Views

CREATE VIEW AvailableRoomsPerArea AS
SELECT a.city, COUNT(r.room_id) AS available_rooms
FROM Hotel h
JOIN Address a ON h.address_id = a.address_id
JOIN Room r ON r.hotel_id = h.hotel_id
LEFT JOIN Booking b ON b.room_id = r.room_id AND b.is_renting = FALSE AND b.is_checkout = FALSE
WHERE b.booking_id IS NULL
GROUP BY a.city;

CREATE VIEW RoomCapacityPerHotel AS
SELECT h.name AS hotel_name, SUM(
    CASE 
        WHEN r.capacity = 'single' THEN 1
        WHEN r.capacity = 'double' THEN 2
        ELSE 3 -- Assume a generic value for unknown cases
    END
) AS total_capacity
FROM Hotel h
JOIN Room r ON h.hotel_id = r.hotel_id
GROUP BY h.name;


INSERT INTO Address (street_address, city, state, postal_code) VALUES
('8715 Mary Loaf Suite 501', 'Susanland', 'South Dakota', '19750'),
('9541 Natalie Centers', 'Susanland', 'South Dakota', '41243'),
('336 David Flats Apt. 836', 'Bowenview', 'Indiana', '24596'),
('803 Jonathan Station Apt. 661', 'Bowenview', 'Indiana', '73778'),
('84890 Simmons Port', 'East Kelsey', 'North Dakota', '69066'),
('76943 Burke Cliffs Apt. 299', 'East Kelsey', 'North Dakota', '55517'),
('164 Watson Mills Suite 204', 'Smithside', 'Wisconsin', '98600'),
('8595 Baldwin Station', 'Smithside', 'Wisconsin', '93512'),
('671 Andrea Circles Apt. 522', 'West Carmen', 'Tennessee', '81937'),
('93392 Jason Coves', 'West Carmen', 'Tennessee', '38864'),
('6851 Orr Corners', 'Allenstad', 'South Dakota', '85463'),
('77115 Adrienne Gateway', 'Allenstad', 'South Dakota', '71226'),
('232 Andrew Mill Suite 618', 'Smithburgh', 'Illinois', '45443'),
('21470 Christopher Glens Suite 275', 'Smithburgh', 'Illinois', '07889'),
('419 Alexander Point', 'South John', 'Vermont', '55341'),
('635 Jennifer Center Suite 718', 'South John', 'Vermont', '70552'),
('869 Long Trail', 'Kristinatown', 'Connecticut', '74226'),
('447 Andrea Parkway Apt. 105', 'Kristinatown', 'Connecticut', '02295'),
('33184 Flores Road', 'South Andreamouth', 'New York', '10473'),
('53455 Calvin Crossroad', 'South Andreamouth', 'New York', '32476'),
('0385 Wise Path Apt. 019', 'Lake Anthony', 'Wyoming', '60088'),
('97655 Julia Place', 'Lake Anthony', 'Wyoming', '07368'),
('59864 Sandoval Lakes Suite 071', 'South Aaronfort', 'North Dakota', '45843'),
('6177 Veronica Manors Suite 092', 'South Aaronfort', 'North Dakota', '36995'),
('2648 Heather Heights', 'Markfurt', 'New Mexico', '36308'),
('246 Angela Centers', 'Markfurt', 'New Mexico', '74693'),
('747 Taylor Stream', 'New Luke', 'Ohio', '84617'),
('05210 Tanya Path Suite 239', 'New Luke', 'Ohio', '88463'),
('557 Lozano Lock Apt. 708', 'Brennanton', 'Hawaii', '37974'),
('76747 James Mount', 'Brennanton', 'Hawaii', '35090'),
('70189 Gwendolyn Causeway Suite 138', 'West Amanda', 'Connecticut', '36888'),
('1447 Ross Avenue Suite 986', 'West Amanda', 'Connecticut', '04290'),
('47640 Claudia Bypass', 'Port Michael', 'Washington', '73660'),
('4496 Shelly Lights Apt. 984', 'Port Michael', 'Washington', '68857'),
('472 Kevin Spur', 'West Hannahtown', 'Minnesota', '89364'),
('7447 Dwayne Villages', 'West Hannahtown', 'Minnesota', '38254'),
('904 Warren Locks Suite 674', 'Scottburgh', 'Oklahoma', '73905'),
('2692 Darren Throughway', 'Scottburgh', 'Oklahoma', '65933'),
('367 Alan Turnpike', 'North Raven', 'Kansas', '78613'),
('71404 Barnes Stravenue', 'North Raven', 'Kansas', '67069'),
('07626 Brian Overpass Apt. 695', 'Middletonfurt', 'Nebraska', '27182'),
('4894 Patricia Isle', 'Middletonfurt', 'Nebraska', '58797'),
('013 Hill Villages', 'West Matthewhaven', 'Iowa', '40760'),
('03879 Debra Islands Suite 109', 'West Matthewhaven', 'Iowa', '28660'),
('9218 Tracy Bridge', 'Turnerberg', 'Vermont', '75532'),
('09065 Brett Unions', 'Turnerberg', 'Vermont', '95265'),
('2905 Sullivan Ville', 'South Jeffreystad', 'Ohio', '10954'),
('18767 Aaron Overpass', 'South Jeffreystad', 'Ohio', '34861'),
('700 Rose Oval Apt. 254', 'Brownshire', 'Delaware', '56510'),
('91884 Snyder Manor', 'Brownshire', 'Delaware', '06850');
-- Insert 5 hotel chains, each with one of these addresses as its HQ
INSERT INTO HotelChain (name, central_office_address_id, email, phone_number) VALUES
('Luxury Stay', 48,  'contact@luxurystay.com', '123-456-7890'),
('Cozy Inns', 19,  'info@cozyinns.com', '234-567-8901'),
('Budget Haven',34,  'support@budgethaven.com', '345-678-9012'),
('Elite Hotels', 26,  'hello@elitehotels.com', '456-789-0123'),
('Grand Escapes',41, 'reservations@grandesapes.com', '567-890-1234');
INSERT INTO Hotel (chain_id, name, address_id, email, phone_number, category) VALUES
('1', 'Castillo-White Hotel', '20', 'vcampbell@example.net', '(075) 966-4297', '5'),
('1', 'Bartlett, Brown and Williams Hotel', '19', 'eric86@example.net', '(647) 603-8780', '2'),
('1', 'Mcconnell Inc Hotel', '14', 'hurleysamuel@example.org', '(258) 207-9962', '3'),
('1', 'Anderson Ltd Hotel', '13', 'perrydylan@example.net', '(327) 865-1421', '4'),
('1', 'Pittman, Edwards and Armstrong Hotel', '46', 'brandon31@example.com', '(842) 336-9402', '3'),
('1', 'Cisneros and Sons Hotel', '45', 'aharvey@example.net', '(577) 656-7608', '1'),
('1', 'Hernandez-Taylor Hotel', '40', 'llong@example.net', '(748) 905-4234', '1'),
('1', 'Holmes, Kerr and Gregory Hotel', '39', 'iharrison@example.com', '(024) 604-1032', '2'),
('2', 'Carter-Bell Hotel', '28', 'gary32@example.org', '(528) 355-8148', '5'),
('2', 'Sanders, Harrell and Khan Hotel', '27', 'bsmith@example.com', '(773) 611-3481', '3'),
('2', 'Harris, Mcgrath and Eaton Hotel', '44', 'michelle40@example.org', '(956) 507-2548', '2'),
('2', 'Smith-Rivera Hotel', '43', 'gonzalesbrandon@example.org', '(047) 800-9926', '2'),
('2', 'Morales, Thomas and Ramsey Hotel', '4', 'travis45@example.net', '(344) 306-7881', '4'),
('2', 'Lopez-Mccormick Hotel', '3', 'vgray@example.org', '(670) 470-9932', '3'),
('2', 'Galvan, Jordan and Garcia Hotel', '16', 'smithcharles@example.net', '(763) 955-1727', '4'),
('2', 'Lee Inc Hotel', '41', 'nbutler@example.org', '(015) 615-1675', '5'),
('3', 'Meyers Ltd Hotel', '2', 'hardingjames@example.com', '(958) 263-7874', '5'),
('3', 'Richard, Gill and Olson Hotel', '1', 'james48@example.org', '(384) 957-5214', '5'),
('3', 'Williams, Weaver and Kelly Hotel', '15', 'robertwatts@example.com', '(616) 863-3550', '4'),
('3', 'Stewart, Baker and Gomez Hotel', '9', 'christine78@example.org', '(822) 686-6855', '2'),
('3', 'Mathews, Rodriguez and Davis Hotel', '10', 'elarson@example.org', '(989) 114-4639', '1'),
('3', 'White, Perry and Campbell Hotel', '5', 'theresa31@example.com', '(384) 802-1630', '5'),
('3', 'Houston, Garcia and Hanson Hotel', '37', 'onelson@example.net', '(141) 130-5656', '2'),
('3', 'Jackson, Miller and Flores Hotel', '33', 'derrickhicks@example.org', '(125) 894-6791', '3'),
('4', 'Cooper-Jensen Hotel', '34', 'chenolivia@example.com', '(421) 597-7669', '2'),
('4', 'Farrell, Mejia and Salinas Hotel', '11', 'aaron44@example.org', '(007) 500-2850', '5'),
('4', 'Horton Ltd Hotel', '42', 'tgreen@example.org', '(057) 751-8861', '5'),
('4', 'Butler Group Hotel', '30', 'jillianatkinson@example.org', '(173) 642-7618', '3'),
('4', 'Morris, Rivera and Barr Hotel', '7', 'alecharvey@example.com', '(854) 515-7075', '5'),
('4', 'Phillips Ltd Hotel', '17', 'iroman@example.org', '(221) 332-6616', '5'),
('4', 'Kramer, Garcia and Hamilton Hotel', '23', 'joshua23@example.com', '(202) 242-9569', '3'),
('4', 'Wilkinson Ltd Hotel', '6', 'newtonkayla@example.net', '(418) 824-6018', '2'),
('5', 'Davila Ltd Hotel', '32', 'dunnthomas@example.org', '(020) 757-0185', '1'),
('5', 'Patterson-Carey Hotel', '29', 'john27@example.net', '(411) 649-5664', '1'),
('5', 'Charles, Ford and Smith Hotel', '49', 'stephaniesmith@example.org', '(960) 249-9535', '1'),
('5', 'Hill Ltd Hotel', '12', 'stephaniehernandez@example.org', '(535) 588-8935', '2'),
('5', 'Walker-Johnson Hotel', '25', 'campbellbrittany@example.org', '(188) 771-1847', '2'),
('5', 'Torres-Pena Hotel', '50', 'wendyestrada@example.com', '(850) 110-0237', '2'),
('5', 'Campbell Inc Hotel', '18', 'janetestes@example.com', '(877) 836-5123', '4'),
('5', 'Wyatt-Noble Hotel', '8', 'fosterrebecca@example.net', '(296) 577-9888', '4');


-- Managers and Employees for HotelChain 1 - Royal Stay Hotels

-- Hotel 1: Royal Inn (Manager + Employees)
INSERT INTO Employee (full_name, address, ssn, hotel_id, role) VALUES
('Kimberly Ortiz', 'PSC 6883, Box 5369, APO AE 52657', '691-04-2676', 1, 'Manager'),
('Jacob Hart', '9132 Moore Tunnel Apt. 317, West Duane, MA 28570', '698-78-7652', 2, 'Manager'),
('Lori Reed', '77314 Rios Fork, Harrishaven, WI 04675', '320-15-2323', 3, 'Manager'),
('Kathleen Mills', '3610 Price Light Suite 338, South Linda, WV 40352', '571-69-1082', 4, 'Manager'),
('Victoria Walker', '3203 Diaz Burgs Apt. 879, Robinsonmouth, CA 26656', '307-64-7331', 5, 'Manager'),
('John Allen', '973 Cameron Hollow Apt. 681, North Billyland, ID 60879', '350-55-8022', 6, 'Manager'),
('Marissa Cruz', '27088 Jodi Isle, South Russell, NM 82080', '029-40-1992', 7, 'Manager'),
('Heather Smith', '167 Guzman Shoals, East Megan, PW 93613', '557-22-4817', 8, 'Manager'),
('Oscar Patterson', '807 Lopez Locks, Jennytown, NE 89380', '239-68-3784', 9, 'Manager'),
('David Marshall', '037 Victoria Gateway Apt. 426, Stantonmouth, VT 02264', '789-70-4333', 10, 'Manager'),
('Edwin Coleman', '188 Paige Port, Port Kathleenside, PR 61674', '509-67-8508', 11, 'Manager'),
('Cynthia Butler', '5237 Gordon Path Apt. 694, Carolville, CA 65820', '586-28-3768', 12, 'Manager'),
('Andrea Williams', '12582 Watson Plains, Lake Danielleshire, MI 13239', '109-77-8012', 13, 'Manager'),
('Lisa Kelley', '869 Adam Extensions, South Williamville, LA 25775', '629-44-4246', 14, 'Manager'),
('Heather Evans', '80590 Kelly Rapid, Port Lisashire, NC 34156', '024-01-4795', 15, 'Manager'),
('Wayne Orr', '03173 Martinez Curve, North Chad, MD 57093', '254-32-5639', 16, 'Manager'),
('Anita Chapman', '83700 Catherine Ferry, New Sherryport, GU 93969', '194-18-6633', 17, 'Manager'),
('Wesley Shah', '38735 Carter Plaza Apt. 668, Michaelfort, NM 01478', '657-13-2183', 18, 'Manager'),
('Kenneth Reeves', 'PSC 8953, Box 3993, APO AE 49707', '549-39-2018', 19, 'Manager'),
('Pamela Glenn', '025 Cobb Curve Apt. 284, Ashleyborough, MH 71256', '656-50-7308', 20, 'Manager'),
('Rhonda Reed', '437 Lambert Lock, East Curtis, IL 21075', '372-98-1735', 21, 'Manager'),
('Alexis Mendoza', '90513 Melendez Street Suite 578, East Samuelport, NY 22553', '856-43-0140', 22, 'Manager'),
('Sarah Abbott', 'USS Morgan, FPO AE 82433', '321-30-1752', 23, 'Manager'),
('Katherine Lucero', '526 Hendrix Brooks Suite 270, Port Christopherfort, ID 95347', '781-46-2378', 24, 'Manager'),
('Gina Tucker', '2730 Hatfield Trafficway Suite 498, North David, NY 44127', '173-96-9031', 25, 'Manager'),
('Ellen Moore', '99649 Larsen Bypass, Hallhaven, AZ 97133', '059-63-5629', 26, 'Manager'),
('Charles Richards', 'Unit 9494 Box 1446, DPO AE 34743', '605-63-1443', 27, 'Manager'),
('Andre Smith MD', '553 Donald Branch Apt. 745, Freemanland, NH 64398', '581-09-1366', 28, 'Manager'),
('Michael Johnson', '272 Tina Lane, Petersonchester, AL 37806', '873-29-9070', 29, 'Manager'),
('David Martin', '88632 Lucas Junction Apt. 662, Brownstad, IN 67647', '102-98-7777', 30, 'Manager'),
('Joseph Norton', '167 Lewis Glen, Philipbury, MA 95341', '235-90-9122', 31, 'Manager'),
('Jennifer Edwards', '56292 Shannon Unions Suite 642, East Adam, MA 14242', '561-15-4538', 32, 'Manager'),
('Kristin Adams', '6630 Marcus Port Suite 874, South Jason, MN 44486', '237-22-4888', 33, 'Manager'),
('Derrick Kennedy', '25764 Melinda Islands Suite 794, South Yeseniaside, MN 87767', '822-72-2152', 34, 'Manager'),
('Diane Jones', '90360 Gregory Valley, Danielberg, MD 97055', '668-01-0664', 35, 'Manager'),
('Marilyn Moore', '7725 Chris Crossroad, Jacksontown, FM 70105', '475-18-8088', 36, 'Manager'),
('Seth Mitchell', '119 Stone Mill Apt. 611, Courtneyland, KY 74849', '483-11-0105', 37, 'Manager'),
('Jason Allen', 'USNS Hall, FPO AP 42293', '648-97-9013', 38, 'Manager'),
('Danielle Hale', '78766 Charles Spur, Anthonyview, FM 90398', '796-64-8708', 39, 'Manager'),
('Paula Ramirez', '570 Pacheco Ferry Apt. 129, Port Patrick, FL 90371', '373-06-9160', 40, 'Manager'),
('Ian Marshall', '5108 Megan Throughway, Michaelborough, NM 31855', '270-26-9837', 1, 'Maintenance'),
('Dawn Wheeler', '87619 Hodge Land, Jeremyside, NH 94587', '346-08-3243', 1, 'Receptionist'),
('Christine Cunningham', '753 Heather Streets, Virginiahaven, AL 77561', '037-67-3010', 1, 'Housekeeping'),
('Mallory Cortez', '6322 Michael Mall Apt. 620, Parkerton, PA 48605', '209-42-4673', 1, 'Chef'),
('Jamie Green', '57930 James Extensions, Jasonmouth, CT 79677', '037-28-8715', 1, 'Security'),
('Debra Green', '302 Victoria Ports Suite 738, Cookville, MH 05088', '828-76-3801', 2, 'Maintenance'),
('Katrina Miranda', '276 White Square Suite 985, Port David, CA 08974', '779-37-7992', 2, 'Receptionist'),
('Michelle Jones', '19346 Kristine Junction Apt. 108, Brownfort, NJ 70232', '361-52-9601', 2, 'Housekeeping'),
('Scott Coleman', 'PSC 9916, Box 6731, APO AP 66224', '267-50-0570', 2, 'Chef'),
('Angela Bell', '328 Gonzales Spur Apt. 504, East Emily, ID 30284', '009-98-1566', 2, 'Security'),
('Mary Ross', '3154 Richard Way, Jamesmouth, MN 35633', '574-44-4614', 3, 'Maintenance'),
('Andrew Lopez', '26624 Jane Neck Suite 717, South Kristen, PA 80396', '134-23-5662', 3, 'Receptionist'),
('James Reed', '1733 Crane Plains Suite 965, Port Justin, MA 48316', '583-82-9850', 3, 'Housekeeping'),
('Connie Rasmussen', '77340 Andrew Mountains Apt. 300, Raymondport, PR 21350', '656-81-2814', 3, 'Chef'),
('Marie Anderson', '3111 Jensen Shore, Port Karenport, PR 96693', '354-18-8895', 3, 'Security'),
('Lucas Cummings', '97133 Troy Village, Port William, AK 76000', '143-06-8112', 4, 'Maintenance'),
('Stephen Torres', '36224 Kathleen Villages, Lake Jessicashire, NE 31170', '169-90-4923', 4, 'Receptionist'),
('Matthew Hill', '18626 Marcus Place Apt. 866, Ricardohaven, OK 03108', '349-60-2816', 4, 'Housekeeping'),
('Brendan Williams', '87037 Stephen View Apt. 694, Greermouth, TN 73787', '590-52-2391', 4, 'Chef'),
('Natalie Whitney', '21046 Gonzalez Crest, Joyfort, AZ 19357', '271-10-0689', 4, 'Security'),
('Kevin Miller', '5545 Davis Field, South Isabellachester, MH 11838', '354-70-1633', 5, 'Maintenance'),
('Jeffrey Maxwell', '824 Lewis Forest Suite 634, Lake Anthonytown, LA 43561', '834-70-2524', 5, 'Receptionist'),
('Catherine Mckee', '1119 Grace Ranch Suite 183, Richardton, OR 03923', '102-42-1216', 5, 'Housekeeping'),
('Malik Lawson', 'USCGC Mcconnell, FPO AP 51279', '330-96-8240', 5, 'Chef'),
('Jeremy Jones', '9588 Brenda Pass, Shepardview, MA 42344', '726-16-7995', 5, 'Security'),
('April Estrada', '00969 Kathleen Divide, New Taraview, GA 46612', '570-20-6547', 6, 'Maintenance'),
('Steven Mayer', '842 Karen Ridges, West Austinside, IL 42348', '523-39-9186', 6, 'Receptionist'),
('John Chapman', 'USS Simmons, FPO AA 55525', '820-89-5078', 6, 'Housekeeping'),
('Mark Walton', '4838 Mark Club Apt. 112, East Paul, MN 21916', '043-75-8300', 6, 'Chef'),
('Darren White', '526 Andrea Throughway Apt. 930, Joshuaton, NE 47059', '177-78-6473', 6, 'Security'),
('Angel Sandoval', '45058 Mendoza Shoals, North Brandiburgh, FL 35877', '632-63-6544', 7, 'Maintenance'),
('Amanda Mclaughlin', '621 Julie Crescent, Gallagherview, WA 50516', '109-19-6973', 7, 'Receptionist'),
('Jessica Mora', '471 Carney Trail Apt. 383, West Garyview, PW 04419', '665-17-4680', 7, 'Housekeeping'),
('Daniel Johnson', '8298 Martin Valley Suite 335, Patrickmouth, GA 54619', '846-47-1954', 7, 'Chef'),
('Jason Garcia', '3514 Jones Crescent Suite 051, Port Andrew, ME 61709', '112-53-0135', 7, 'Security'),
('Hannah Pugh', '437 Scott Points, Camposhaven, VT 65971', '434-94-4032', 8, 'Maintenance'),
('Rick Thomas', '9825 Debra Shoal, South Tiffanyland, MA 99464', '673-69-5086', 8, 'Receptionist'),
('Paul Peterson', '6228 Bryant Mills Suite 588, Paulaberg, OK 75372', '003-86-9209', 8, 'Housekeeping'),
('Susan Thomas', '944 Zimmerman Knolls Suite 591, New Michael, OK 56609', '803-69-9066', 8, 'Chef'),
('David Johnson', '35106 Taylor Lodge, Sydneyberg, SD 81122', '317-43-7994', 8, 'Security'),
('Brittany Hodge', '603 Beverly Lodge, North Carrie, IN 62584', '864-61-8966', 9, 'Maintenance'),
('Amber Adams', '9105 James Meadow Apt. 349, Barryside, IA 93783', '556-76-7737', 9, 'Receptionist'),
('Roger Garcia', 'Unit 3221 Box 9691, DPO AA 85446', '137-45-7598', 9, 'Housekeeping'),
('Derrick Hamilton', '42940 Jason Forge Suite 180, Josephview, AL 16214', '366-78-7397', 9, 'Chef'),
('Robert Hayes', '084 Drake Causeway, Lake Kevinville, ME 58854', '027-96-1048', 9, 'Security'),
('Jamie White', '8295 Donald Parkway, Holmesfurt, PR 76827', '447-97-6952', 10, 'Maintenance'),
('Jennifer Frank', '5670 Eric Light Suite 052, Port Jon, OH 80564', '050-20-9204', 10, 'Receptionist'),
('Jennifer King', '68632 Sanders Run, Garciamouth, CA 12176', '824-27-6187', 10, 'Housekeeping'),
('Eric Vargas', '959 Wilson Ports Suite 438, Lake Sueville, NE 91653', '207-70-6895', 10, 'Chef'),
('Manuel Contreras', '1654 Christopher Ferry, Aliport, CO 38425', '563-51-6691', 10, 'Security'),
('Karen Clark', '523 Rivas Corner Suite 276, Williamsburgh, NM 49914', '272-01-6992', 11, 'Maintenance'),
('Andrew Bradford', '534 Jesus Road, North Scott, MD 89621', '334-17-4835', 11, 'Receptionist'),
('Michael Smith', '36533 Hayes Islands Suite 821, New Donnaborough, FL 21182', '109-15-3665', 11, 'Housekeeping'),
('Stacey Simmons', 'PSC 4643, Box 4814, APO AE 40225', '034-64-2166', 11, 'Chef'),
('Kathryn Conley', '374 Williams Wells Apt. 785, Port Kevin, SD 43148', '435-23-6803', 11, 'Security'),
('Erika Cortez', '763 Martinez Ranch, Richardsmouth, VA 70575', '767-51-0742', 12, 'Maintenance'),
('Gerald Richardson', 'USS Thomas, FPO AE 61113', '314-84-5322', 12, 'Receptionist'),
('Julie Jimenez', '1298 Smith Ranch Suite 699, Brownton, KY 24549', '064-35-0485', 12, 'Housekeeping'),
('Robert Dixon', '4800 Sharon Orchard, Karenton, OH 18129', '885-09-5213', 12, 'Chef'),
('Robert Kim', '04455 Hull Causeway, East Matthewtown, RI 97426', '327-64-4068', 12, 'Security'),
('Kelly Sanchez', '31325 Carney Parkways, South Donald, MH 45124', '210-79-7347', 13, 'Maintenance'),
('William Gonzalez', '5612 Daniel Plaza, South Bettyview, MP 64659', '123-93-7557', 13, 'Receptionist'),
('Andrew Lee', '613 Crystal Field, Carolville, OK 90066', '519-99-7944', 13, 'Housekeeping'),
('Valerie Brown', '30274 Rita Drive, Vaughnville, AL 46876', '020-55-2059', 13, 'Chef'),
('Michael Schaefer', '382 Rachel Pines Apt. 111, Lake Jeffreytown, NH 03326', '070-88-3237', 13, 'Security'),
('Allen Walker', '05411 Davis Prairie Suite 389, Perezburgh, MI 69276', '506-72-8788', 14, 'Maintenance'),
('Mark Heath', '3250 Houston Union Suite 054, Jasonborough, WA 49904', '130-12-5201', 14, 'Receptionist'),
('David Chavez', 'Unit 3031 Box 9855, DPO AE 05324', '657-79-6193', 14, 'Housekeeping'),
('Kelly Stafford', '108 Finley Ramp, Alexiston, SD 19115', '434-63-3891', 14, 'Chef'),
('Sandra Rodriguez', '5599 Sergio Underpass, Port Robin, ID 58457', '762-66-9584', 14, 'Security'),
('Elizabeth Bradley', '997 Tony Station Apt. 406, Tannerland, CT 79960', '887-71-7138', 15, 'Maintenance'),
('Christopher Mcguire', '0062 Caitlin Cape, New Jessica, KY 73956', '691-53-9944', 15, 'Receptionist'),
('Samantha Watkins', '573 Baker Parkways, South Jasminefort, FM 95341', '761-05-7498', 15, 'Housekeeping'),
('Ashley Fisher', '371 Howe Village Suite 911, Murphyland, AS 28460', '748-83-8946', 15, 'Chef'),
('Benjamin Bailey', '50022 Barnett Forges, Pattersonfort, DE 46923', '651-60-6544', 15, 'Security'),
('Joshua Leonard', '434 Robbins Alley, Allenfort, NE 04259', '441-83-8968', 16, 'Maintenance'),
('Eric Wright', '39834 Ross Shores Suite 522, North Ginastad, WY 42941', '180-63-6578', 16, 'Receptionist'),
('Garrett Waters', '9093 Cannon Mountains, South Brittany, KY 21709', '779-09-9092', 16, 'Housekeeping'),
('Kimberly Wolfe', '729 Long River, Port Melinda, VI 85039', '339-76-5792', 16, 'Chef'),
('Shannon Brown MD', '1840 Nelson Port, Port Monicamouth, DE 28702', '578-61-3152', 16, 'Security'),
('Jennifer Rivas', 'Unit 5633 Box 7213, DPO AP 93106', '842-06-4495', 17, 'Maintenance'),
('Christine Chase', 'Unit 8665 Box 4002, DPO AP 61602', '132-67-5647', 17, 'Receptionist'),
('Tammy Watson', '32203 Jason Fords, Andrewsview, VA 43656', '554-45-5536', 17, 'Housekeeping'),
('Jason Edwards', '6049 Jessica Via Apt. 940, West Anthony, UT 49220', '415-90-9830', 17, 'Chef'),
('Eric Mejia', '619 Smith Light Apt. 968, West Michael, PR 31011', '506-36-2748', 17, 'Security'),
('Nicholas Garza', '74506 Richard Ridges Suite 000, East Jesse, AS 20718', '758-94-5033', 18, 'Maintenance'),
('Kayla Morales', '2345 Sharon Crescent Apt. 543, Reyesview, TX 71327', '549-70-8984', 18, 'Receptionist'),
('Russell Schroeder', '24308 Gregory Keys, Velazquezport, WA 29062', '464-37-8777', 18, 'Housekeeping'),
('James Stephens', '786 Robert Loaf, Markberg, AR 78939', '374-62-0395', 18, 'Chef'),
('Nicholas Richards', '75465 Jacqueline Lakes Suite 524, South Mary, GU 21937', '121-27-6694', 18, 'Security'),
('Shane Hogan', '12570 Matthew Club Apt. 143, South Kenneth, AS 20167', '385-90-5649', 19, 'Maintenance'),
('Meredith Weber', 'Unit 1332 Box 1152, DPO AE 08925', '249-54-0642', 19, 'Receptionist'),
('Matthew Dennis', '75754 Alexander Station Suite 725, Port Vincent, MO 10660', '101-90-4133', 19, 'Housekeeping'),
('Mark Walters', '11960 Hull Way, Port Lisa, ME 63799', '689-74-3379', 19, 'Chef'),
('Edward Turner', '604 Jennifer Forks, Port Cindy, DE 02860', '818-73-7991', 19, 'Security'),
('Roger Harris', '4514 Hawkins Garden Apt. 983, East Emily, TX 41347', '487-79-5924', 20, 'Maintenance'),
('Shawn Arias', 'PSC 3600, Box 1597, APO AE 15667', '664-49-6167', 20, 'Receptionist'),
('James Castro', '81456 Evans Light Suite 340, New Daniel, ID 62740', '065-14-3710', 20, 'Housekeeping'),
('Sherri Ramirez', '704 Saunders Centers, North Colleen, WA 06553', '761-03-8304', 20, 'Chef'),
('Adriana Odom', '4392 Riddle Mills Suite 258, Morganstad, GA 28258', '861-53-9315', 20, 'Security'),
('Patricia Steele', '030 Shepard Row Apt. 255, North Michael, MI 52876', '783-72-1417', 21, 'Maintenance'),
('Dr. Daniel Lee III', '3313 Crystal Harbor, Hoodside, GA 68351', '658-50-3938', 21, 'Receptionist'),
('Angel Eaton', '64426 Garcia Rapid Apt. 600, Charlesstad, NH 27975', '606-74-4115', 21, 'Housekeeping'),
('Bryan Vasquez', '064 Wolf Radial, Maddoxport, VA 30768', '491-13-8220', 21, 'Chef'),
('Amy Higgins', '460 Campbell Station, Cameronview, PA 36193', '323-08-6495', 21, 'Security'),
('Donna Sandoval', '234 Lee Bypass Suite 445, East Charlesstad, VT 86532', '014-99-4113', 22, 'Maintenance'),
('Dr. Pamela Davis', '02939 Hall View, New Richard, GU 05494', '199-62-3932', 22, 'Receptionist'),
('Mark Wright', '738 Gabriel Ford, New Timothy, LA 79454', '526-43-3060', 22, 'Housekeeping'),
('Rodney Smith', '401 Nicole Island, South Shelia, MP 66288', '527-56-6674', 22, 'Chef'),
('Kayla Williams', '9310 John Lights, Kimfurt, MA 22549', '446-18-9961', 22, 'Security'),
('Christopher Moore', 'PSC 7126, Box 1875, APO AP 26863', '363-88-1383', 23, 'Maintenance'),
('Erik Le', 'PSC 4730, Box 2019, APO AP 65684', '130-44-2672', 23, 'Receptionist'),
('Cody Brown', '6545 Andrew Roads, East Carolyn, NY 49404', '866-17-1694', 23, 'Housekeeping'),
('Jacqueline Diaz', '17137 Bridges Estates Apt. 719, North Dustin, SC 24030', '225-34-7386', 23, 'Chef'),
('Yolanda Farrell', '6555 Smith Cape Apt. 001, Isaacmouth, DC 85151', '030-36-7893', 23, 'Security'),
('Michael Wright', '477 Brown River Suite 846, Allisonshire, MA 84891', '445-87-5307', 24, 'Maintenance'),
('Christina Patrick', '462 Richard Drives Apt. 426, Jenniferview, ND 99051', '602-55-7988', 24, 'Receptionist'),
('Dr. Jennifer Smith MD', '065 Elizabeth Stravenue Apt. 967, Smithhaven, OK 69382', '827-34-0088', 24, 'Housekeeping'),
('William Phelps', '9055 Jessica Islands, East Kayla, MN 26797', '398-32-3439', 24, 'Chef'),
('Alan Medina', 'PSC 3010, Box 1427, APO AP 72559', '420-37-8857', 24, 'Security'),
('Derek Campbell', 'PSC 2524, Box 1497, APO AP 71551', '478-02-5446', 25, 'Maintenance'),
('Patrick Brady', '0117 Casey Roads Apt. 268, North Jeremy, WI 07866', '681-59-8088', 25, 'Receptionist'),
('Richard Soto', '239 Stefanie Squares, Nicoleview, MD 01109', '754-74-6426', 25, 'Housekeeping'),
('Victor Hoffman', '475 John Street, North Meganshire, NH 29577', '510-05-0381', 25, 'Chef'),
('Tina Meyer', '8152 Gene Brooks Apt. 914, Port Sandy, FM 84792', '853-70-9299', 25, 'Security'),
('Casey Taylor', '4651 Beard Glen, South Jacqueline, MO 85258', '493-87-9639', 26, 'Maintenance'),
('James Terrell', '9043 Jill Lights, Morrisberg, ID 35774', '588-01-0038', 26, 'Receptionist'),
('Eddie Chang', 'PSC 7176, Box 4818, APO AE 77865', '546-04-3255', 26, 'Housekeeping'),
('Christopher Fox', '6431 Elliott Lock Apt. 383, Jessicaton, KS 03772', '643-93-6257', 26, 'Chef'),
('Jeremy Cowan', '683 Perry Squares Apt. 178, Port Suemouth, GA 67255', '249-29-6867', 26, 'Security'),
('Jose Moon', 'PSC 8754, Box 0275, APO AP 01684', '399-83-5057', 27, 'Maintenance'),
('Charles Brown', '27848 Garrett Lights, Port Lukeport, VA 80688', '272-57-2877', 27, 'Receptionist'),
('Melissa Wade', '8920 Daniels Turnpike, Trevorshire, DE 96031', '211-23-6880', 27, 'Housekeeping'),
('Heather Brown', '637 Mary Course Apt. 452, Lake Matthewstad, PR 71572', '664-34-3560', 27, 'Chef'),
('Judy Campbell', '8475 Sara Extension Apt. 039, Robinsonview, NJ 68203', '081-06-6664', 27, 'Security'),
('Kyle Miller', '55159 Danny Hollow Suite 734, East Benjaminmouth, OH 20219', '414-06-8327', 28, 'Maintenance'),
('Melanie Gray', '98929 Garrett Station Suite 936, Floresside, NV 35635', '602-42-0713', 28, 'Receptionist'),
('Bianca Hernandez', '82838 Griffin Club Suite 285, Debrashire, IA 80140', '096-83-8639', 28, 'Housekeeping'),
('Tina Clark', '7078 Klein Locks, Bradtown, KS 68704', '180-96-2318', 28, 'Chef'),
('Jennifer Brown', '61528 Stephens Forge Suite 844, Port Jennifermouth, IN 37467', '710-56-2320', 28, 'Security'),
('Dwayne Young', '378 Timothy Plains Apt. 972, Port Stephen, VT 80365', '375-83-2288', 29, 'Maintenance'),
('Christie Contreras', '8860 Reynolds Manors Suite 849, Port Keithberg, ME 45750', '347-90-8304', 29, 'Receptionist'),
('Jeremy Mcconnell', '953 Roberts Creek, Lake Juanton, MA 27350', '162-91-0429', 29, 'Housekeeping'),
('Katherine Garner', '0686 Torres Point Apt. 511, New Shannonton, GA 99426', '394-59-5105', 29, 'Chef'),
('Jacob Flynn', '74632 Travis Extension, Christopherport, ME 90222', '222-58-7268', 29, 'Security'),
('Kristin Powell', '42755 Lee Mount, North Courtneyland, NM 22852', '870-78-3979', 30, 'Maintenance'),
('Dr. Michael Hicks', '811 Andrew Burg Suite 938, Kellerberg, CO 41399', '396-68-9907', 30, 'Receptionist'),
('William Buckley', '953 West Passage, Andrewfort, WV 97714', '729-46-6229', 30, 'Housekeeping'),
('Debra Rasmussen', '6247 Campbell Ramp Suite 268, New Gregory, HI 53784', '399-48-5647', 30, 'Chef'),
('Danny Perry', '848 Selena Turnpike, South Gina, NH 17557', '061-90-1641', 30, 'Security'),
('Lisa Hicks', 'USNV Torres, FPO AA 90453', '537-99-6585', 31, 'Maintenance'),
('Christopher Collier', '24508 Rodriguez Row, Parkerfurt, LA 47851', '256-78-7246', 31, 'Receptionist'),
('Courtney Hayden', '15943 Kathleen Shore, East Williamstad, PA 76746', '485-31-7543', 31, 'Housekeeping'),
('Melanie Smith', '9126 Christopher Mission Apt. 111, Sherryfort, IA 88804', '679-15-6648', 31, 'Chef'),
('Joel Burns', '0215 Allen Run Apt. 444, East Juliamouth, OH 04149', '618-31-3401', 31, 'Security'),
('Teresa Christensen', '55395 Johnson Drive Suite 389, South Amandafurt, ME 50711', '847-36-1855', 32, 'Maintenance'),
('James Ray', '83679 Tyler Mission, New Colefort, KY 96282', '059-69-5356', 32, 'Receptionist'),
('Manuel Green', 'Unit 6426 Box 6504, DPO AA 04684', '606-17-2004', 32, 'Housekeeping'),
('Richard Mitchell', '8809 Christine Mews, South Alexa, KS 80135', '724-30-3802', 32, 'Chef'),
('Miss Amy Wade', '45841 Arellano Route Suite 567, South Donnamouth, SC 86020', '353-41-4338', 32, 'Security'),
('Nicholas Garcia DDS', '9005 Patrick Shoal Apt. 598, North Michellestad, WY 84679', '206-47-2652', 33, 'Maintenance'),
('Deborah Thompson', '0584 Eric Stream, Brittanyland, MA 22313', '268-44-1372', 33, 'Receptionist'),
('Lisa Robinson', '496 Burke Cliffs, South John, VA 30041', '584-20-1521', 33, 'Housekeeping'),
('Karla Gonzalez', 'PSC 2407, Box 0101, APO AA 24634', '008-85-9673', 33, 'Chef'),
('Kristen Murphy', '498 Kelley Stream Apt. 054, Port Shannon, NJ 78455', '595-87-7411', 33, 'Security'),
('David Jones', '83210 Corey Heights, Lauraton, NH 92432', '409-07-2197', 34, 'Maintenance'),
('Andrew Hodges', '0785 Kirby Trace Suite 301, North Jenniferside, WV 65843', '282-93-1402', 34, 'Receptionist'),
('Angela Nielsen', '2039 Melissa Way, Lake Amanda, MI 80927', '786-46-8953', 34, 'Housekeeping'),
('Jenna Harris', '36826 Rosales Lights, West Michaelside, CT 68189', '273-16-9714', 34, 'Chef'),
('Stephanie Quinn', '425 Kimberly Plaza, Port Suzanne, VT 48529', '441-71-3057', 34, 'Security'),
('Joshua Lawrence', '653 Vincent Pine Suite 914, East Rachelmouth, CO 18429', '095-31-4544', 35, 'Maintenance'),
('Melanie Robinson', '970 Patterson Forge, Mariastad, TX 30809', '125-80-9008', 35, 'Receptionist'),
('Aaron Roman', 'Unit 3608 Box 4668, DPO AP 31482', '459-57-5146', 35, 'Housekeeping'),
('Ashley Berry', '539 Joseph Valley Suite 149, West Donna, MH 48098', '608-85-6109', 35, 'Chef'),
('Kyle Fowler', '565 John Wells Suite 192, Smithhaven, UT 46361', '559-33-0972', 35, 'Security'),
('Kimberly Rubio', '202 Gonzalez Forges Suite 858, Thompsonhaven, ID 01163', '291-93-0874', 36, 'Maintenance'),
('Daniel Stephens', '84475 Becker Manor, New Ryan, IN 65594', '260-42-8722', 36, 'Receptionist'),
('Andrew Dawson', '861 Amanda Valley Suite 110, Hudsonshire, GA 24272', '855-35-8032', 36, 'Housekeeping'),
('John Sims', 'PSC 5474, Box 8066, APO AE 53971', '771-03-0435', 36, 'Chef'),
('Robin Barnett', '0938 Heather Haven Suite 591, Coxberg, AZ 30589', '157-71-3730', 36, 'Security'),
('Larry Barnes', '4801 Tucker Hill Apt. 017, Lake Alejandraland, HI 91528', '214-53-8602', 37, 'Maintenance'),
('Michael Jones', '61601 Allison Village, North Shawnchester, GA 16120', '848-42-4007', 37, 'Receptionist'),
('Barbara Oneill', '14171 Seth Inlet, Lake Brian, MA 28381', '817-61-4246', 37, 'Housekeeping'),
('Kathryn Henry', '73554 Hebert Path Suite 558, Gilbertburgh, WI 21519', '780-63-1362', 37, 'Chef'),
('Michael Everett', '864 Alexandra Drive, New Francisco, AL 34196', '099-27-7479', 37, 'Security'),
('Lindsey Bowen', '57007 Connor Ways, Lake Amandashire, IN 12704', '837-02-1145', 38, 'Maintenance'),
('Michael Wise', '27887 Boyer Hollow, Whiteheadborough, CO 90194', '369-67-1936', 38, 'Receptionist'),
('Rachel Duncan', '899 Patrick Corner Suite 813, North Samanthaberg, PA 90703', '150-28-0353', 38, 'Housekeeping'),
('Jason Ramos', '590 Kristin Gardens, Gibsonmouth, MO 25275', '485-79-4645', 38, 'Chef'),
('James Green', '0747 Jennifer Alley Apt. 909, Port Staceymouth, CA 42200', '610-86-2246', 38, 'Security'),
('Victoria Smith', '305 Knight Trail Suite 621, West Jacob, SC 59021', '251-56-0825', 39, 'Maintenance'),
('Daryl Murphy', '924 Craig Road Suite 308, New Brianmouth, NY 78807', '360-03-0647', 39, 'Receptionist'),
('Holly Monroe', '220 Joshua Ports Suite 567, Davidton, NV 67214', '496-69-5140', 39, 'Housekeeping'),
('Julie Moreno', '2670 Wade Branch Suite 467, New Shelby, ND 06483', '821-60-8823', 39, 'Chef'),
('Breanna Lopez', '97914 Carrie Pass, Mcclainchester, MD 46714', '032-04-4757', 39, 'Security'),
('Brooke Jones', '9252 Williams Well Suite 526, South Patricia, TN 27333', '846-75-7204', 40, 'Maintenance'),
('Jamie Moyer', '483 Brock Summit Suite 795, East Justin, MO 15478', '878-10-2732', 40, 'Receptionist'),
('Brandy Woodward', '810 Hale Turnpike Suite 582, Ariasmouth, NC 64468', '217-30-8364', 40, 'Housekeeping'),
('Michele Rosales', '0326 Lauren Station Apt. 270, Andreafurt, AK 77573', '362-79-3129', 40, 'Chef'),
('Heather Gardner', '4723 Abbott Alley Apt. 631, West Krystal, WY 39747', '603-39-6324', 40, 'Security');

insert into manager(employee_id, hotel_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10),
(11, 11),
(12, 12),
(13, 13),
(14, 14),
(15, 15),
(16, 16),
(17, 17),
(18, 18),
(19, 19),
(20, 20),
(21, 21),
(22, 22),
(23, 23),
(24, 24),
(25, 25),
(26, 26),
(27, 27),
(28, 28),
(29, 29),
(30, 30),
(31, 31),
(32, 32),
(33, 33),
(34, 34),
(35, 35),
(36, 36),
(37, 37),
(38, 38),
(39, 39),
(40, 40);

INSERT INTO Room (hotel_id, price, amenities, capacity, view, is_extendable, problems) VALUES
(1, 115.73, 'WiFi, TV', 'Double', 'Sea', False, 'Leaky faucet'),
(1, 56.54, 'Air Conditioning, WiFi, Mini Bar', 'Single', 'Sea', True, 'Leaky faucet'),
(1, 102.16, 'Hot Tub, Balcony', 'Family', 'Mountain', True, NULL),
(1, 239.16, 'Mini Bar, Balcony', 'Family', 'Sea', False, 'Stained carpet'),
(1, 197.26, 'Mini Bar, Air Conditioning', 'Suite', 'Mountain', True, 'Leaky faucet'),
(1, 201.6, 'TV', 'Suite', 'Mountain', True, 'Noisy neighbors'),
(1, 195.69, 'Air Conditioning', 'Suite', 'Mountain', True, 'Leaky faucet'),
(1, 101.47, 'Air Conditioning', 'Single', 'Sea', False, 'Noisy neighbors'),
(2, 164.34, 'Mini Bar', 'Suite', 'Mountain', False, NULL),
(2, 148.93, 'Hot Tub', 'Single', 'Mountain', False, 'Broken AC'),
(2, 130.49, 'Hot Tub, TV', 'Single', 'Mountain', False, 'Leaky faucet'),
(2, 215.64, 'TV', 'Suite', 'Mountain', False, 'Noisy neighbors'),
(2, 87.79, 'Mini Bar, TV, Balcony', 'Suite', 'Sea', False, 'Noisy neighbors'),
(2, 241.95, 'Hot Tub, WiFi, Balcony', 'Suite', 'Sea', True, NULL),
(2, 225.1, 'TV', 'Family', 'Sea', False, 'Stained carpet'),
(2, 163.01, 'Balcony', 'Double', 'Sea', True, 'Stained carpet'),
(3, 193.04, 'TV, Air Conditioning', 'Double', 'Mountain', True, 'Broken AC'),
(3, 200.34, 'Balcony, Air Conditioning, TV', 'Single', 'Mountain', True, 'Noisy neighbors'),
(3, 167.51, 'TV, WiFi, Air Conditioning', 'Single', 'Mountain', False, 'Noisy neighbors'),
(3, 118.08, 'Balcony, Hot Tub', 'Double', 'Mountain', True, 'Stained carpet'),
(3, 85.34, 'Balcony', 'Family', 'Mountain', True, 'Leaky faucet'),
(3, 101.53, 'WiFi, TV', 'Family', 'Mountain', False, 'Stained carpet'),
(3, 70.6, 'Hot Tub, TV', 'Single', 'Sea', False, 'Stained carpet'),
(3, 246.04, 'WiFi, Balcony', 'Suite', 'Sea', True, 'Broken AC'),
(4, 83.9, 'Balcony', 'Single', 'Mountain', False, 'Broken AC'),
(4, 225.16, 'Air Conditioning, WiFi', 'Single', 'Mountain', True, 'Leaky faucet'),
(4, 95.18, 'WiFi, TV', 'Double', 'Mountain', False, 'Noisy neighbors'),
(4, 129.83, 'Mini Bar, Air Conditioning', 'Double', 'Mountain', True, 'Noisy neighbors'),
(4, 94.03, 'Hot Tub, Balcony', 'Family', 'Mountain', True, 'Leaky faucet'),
(4, 180.01, 'Hot Tub', 'Single', 'Sea', True, 'Leaky faucet'),
(4, 120.97, 'Mini Bar, Air Conditioning', 'Family', 'Sea', True, NULL),
(4, 239.25, 'Mini Bar, Balcony', 'Family', 'Sea', False, NULL),
(5, 187.93, 'Mini Bar, Hot Tub, TV', 'Double', 'Mountain', True, 'Leaky faucet'),
(5, 97.68, 'Mini Bar, Hot Tub', 'Suite', 'Mountain', False, 'Stained carpet'),
(5, 151.14, 'Mini Bar', 'Single', 'Mountain', False, 'Noisy neighbors'),
(5, 99.19, 'Hot Tub, Mini Bar, TV', 'Suite', 'Mountain', False, 'Stained carpet'),
(5, 211.42, 'Mini Bar', 'Double', 'Sea', True, 'Leaky faucet'),
(5, 184.66, 'Balcony, Hot Tub, Mini Bar', 'Suite', 'Sea', True, 'Broken AC'),
(5, 203.04, 'Air Conditioning, Mini Bar, Balcony', 'Family', 'Sea', True, 'Stained carpet'),
(5, 195.95, 'Air Conditioning, Hot Tub', 'Double', 'Mountain', True, 'Leaky faucet'),
(6, 160.62, 'Mini Bar, TV', 'Single', 'Mountain', False, 'Noisy neighbors'),
(6, 209.57, 'Mini Bar', 'Suite', 'Mountain', True, NULL),
(6, 133.47, 'Balcony, Hot Tub', 'Suite', 'Sea', False, 'Noisy neighbors'),
(6, 96.13, 'Balcony, WiFi', 'Suite', 'Sea', True, 'Broken AC'),
(6, 214.2, 'Mini Bar, Air Conditioning', 'Family', 'Sea', False, 'Stained carpet'),
(6, 225.73, 'TV, Hot Tub', 'Family', 'Mountain', False, 'Noisy neighbors'),
(6, 152.43, 'Mini Bar, WiFi', 'Double', 'Mountain', True, NULL),
(6, 94.39, 'Hot Tub, Mini Bar', 'Family', 'Mountain', True, NULL),
(7, 70.33, 'WiFi, Mini Bar, Hot Tub', 'Suite', 'Mountain', True, 'Stained carpet'),
(7, 109.03, 'Hot Tub, TV, Air Conditioning', 'Suite', 'Sea', False, 'Stained carpet'),
(7, 87.53, 'Balcony, TV, Mini Bar', 'Suite', 'Sea', False, NULL),
(7, 94.59, 'Air Conditioning', 'Single', 'Mountain', False, NULL),
(7, 71.8, 'Mini Bar', 'Suite', 'Mountain', True, NULL),
(7, 186.26, 'TV, WiFi, Hot Tub', 'Family', 'Sea', False, 'Leaky faucet'),
(7, 207.11, 'Balcony', 'Suite', 'Mountain', True, 'Stained carpet'),
(7, 217.19, 'TV, Air Conditioning', 'Family', 'Sea', False, 'Noisy neighbors'),
(8, 79.83, 'Air Conditioning', 'Family', 'Mountain', True, 'Noisy neighbors'),
(8, 96.26, 'Mini Bar', 'Single', 'Sea', False, 'Broken AC'),
(8, 76.02, 'Mini Bar, WiFi, TV', 'Family', 'Mountain', True, 'Stained carpet'),
(8, 231.56, 'Balcony', 'Double', 'Sea', False, 'Noisy neighbors'),
(8, 167.59, 'WiFi', 'Family', 'Mountain', True, 'Broken AC'),
(8, 121.14, 'Air Conditioning', 'Single', 'Mountain', False, NULL),
(8, 95.29, 'WiFi', 'Suite', 'Sea', True, 'Leaky faucet'),
(8, 109.89, 'WiFi, Hot Tub', 'Double', 'Sea', False, 'Noisy neighbors'),
(9, 218.35, 'WiFi', 'Suite', 'Mountain', False, 'Broken AC'),
(9, 111.49, 'Hot Tub', 'Suite', 'Mountain', True, 'Stained carpet'),
(9, 81.57, 'WiFi, Balcony, Hot Tub', 'Single', 'Sea', True, 'Stained carpet'),
(9, 233.09, 'Mini Bar, Air Conditioning', 'Single', 'Sea', False, 'Leaky faucet'),
(9, 66.56, 'Hot Tub', 'Double', 'Sea', True, 'Stained carpet'),
(9, 92.26, 'Air Conditioning, Balcony, Mini Bar', 'Suite', 'Sea', True, 'Noisy neighbors'),
(9, 160.81, 'Balcony', 'Double', 'Mountain', False, 'Stained carpet'),
(9, 172.67, 'TV, Hot Tub, WiFi', 'Single', 'Mountain', True, 'Noisy neighbors'),
(10, 115.33, 'WiFi, TV', 'Suite', 'Sea', True, 'Stained carpet'),
(10, 52.0, 'Balcony', 'Family', 'Mountain', True, 'Noisy neighbors'),
(10, 248.96, 'Mini Bar, WiFi, Balcony', 'Single', 'Mountain', False, 'Stained carpet'),
(10, 83.38, 'Hot Tub', 'Suite', 'Sea', True, 'Stained carpet'),
(10, 245.22, 'WiFi', 'Double', 'Mountain', False, 'Broken AC'),
(10, 90.77, 'TV, Air Conditioning', 'Single', 'Sea', False, 'Stained carpet'),
(10, 243.4, 'Mini Bar, Air Conditioning, WiFi', 'Family', 'Mountain', False, 'Leaky faucet'),
(10, 102.65, 'Balcony, Hot Tub', 'Suite', 'Mountain', True, 'Noisy neighbors'),
(11, 247.08, 'TV, Balcony, Air Conditioning', 'Suite', 'Mountain', False, 'Broken AC'),
(11, 61.19, 'Air Conditioning', 'Family', 'Sea', False, NULL),
(11, 153.85, 'Balcony, Air Conditioning', 'Single', 'Sea', False, 'Stained carpet'),
(11, 126.19, 'WiFi, Hot Tub, Air Conditioning', 'Single', 'Mountain', True, 'Stained carpet'),
(11, 217.12, 'Air Conditioning, Hot Tub, WiFi', 'Double', 'Mountain', True, 'Broken AC'),
(11, 224.68, 'Hot Tub', 'Single', 'Mountain', True, 'Noisy neighbors'),
(11, 79.6, 'WiFi', 'Single', 'Sea', False, 'Stained carpet'),
(11, 228.36, 'Hot Tub, Balcony, WiFi', 'Family', 'Sea', False, 'Broken AC'),
(12, 173.45, 'WiFi', 'Suite', 'Mountain', True, NULL),
(12, 191.23, 'Air Conditioning, Mini Bar', 'Single', 'Sea', True, 'Stained carpet'),
(12, 72.34, 'Mini Bar, WiFi', 'Suite', 'Sea', False, NULL),
(12, 122.14, 'Mini Bar', 'Single', 'Sea', False, NULL),
(12, 84.76, 'WiFi', 'Single', 'Mountain', False, NULL),
(12, 170.6, 'Mini Bar, WiFi, TV', 'Double', 'Mountain', False, 'Broken AC'),
(12, 119.14, 'Air Conditioning, Mini Bar, Hot Tub', 'Family', 'Mountain', False, 'Broken AC'),
(12, 163.05, 'Mini Bar', 'Single', 'Sea', False, 'Broken AC'),
(13, 152.62, 'Mini Bar, Air Conditioning, Hot Tub', 'Single', 'Mountain', True, 'Leaky faucet'),
(13, 154.5, 'Air Conditioning', 'Suite', 'Mountain', False, 'Broken AC'),
(13, 103.35, 'WiFi', 'Suite', 'Mountain', True, 'Noisy neighbors'),
(13, 74.39, 'WiFi', 'Family', 'Mountain', False, NULL),
(13, 190.33, 'TV, Air Conditioning, Hot Tub', 'Single', 'Mountain', False, 'Stained carpet'),
(13, 117.98, 'Air Conditioning', 'Single', 'Sea', True, 'Leaky faucet'),
(13, 197.82, 'WiFi, Mini Bar, Air Conditioning', 'Single', 'Mountain', True, 'Leaky faucet'),
(13, 232.02, 'Air Conditioning, TV', 'Suite', 'Sea', True, 'Broken AC'),
(14, 177.66, 'Air Conditioning, Hot Tub', 'Suite', 'Sea', False, 'Noisy neighbors'),
(14, 161.31, 'Air Conditioning, Mini Bar', 'Family', 'Mountain', False, 'Broken AC'),
(14, 68.92, 'Balcony, TV', 'Suite', 'Sea', False, 'Noisy neighbors'),
(14, 115.17, 'Air Conditioning', 'Family', 'Mountain', False, 'Leaky faucet'),
(14, 187.29, 'Air Conditioning, Balcony, TV', 'Family', 'Sea', False, 'Noisy neighbors'),
(14, 183.63, 'Mini Bar, Air Conditioning, Hot Tub', 'Family', 'Mountain', True, 'Noisy neighbors'),
(14, 120.06, 'WiFi', 'Double', 'Mountain', True, 'Leaky faucet'),
(14, 216.67, 'Hot Tub', 'Double', 'Sea', True, 'Noisy neighbors'),
(15, 157.83, 'Mini Bar, Air Conditioning, TV', 'Suite', 'Mountain', False, 'Broken AC'),
(15, 102.29, 'TV, WiFi, Balcony', 'Single', 'Sea', True, 'Stained carpet'),
(15, 126.01, 'TV', 'Suite', 'Sea', True, 'Noisy neighbors'),
(15, 204.17, 'Hot Tub, Air Conditioning, Mini Bar', 'Single', 'Sea', False, 'Noisy neighbors'),
(15, 91.69, 'Balcony', 'Suite', 'Sea', True, 'Broken AC'),
(15, 237.07, 'WiFi, Air Conditioning', 'Family', 'Mountain', True, 'Noisy neighbors'),
(15, 139.54, 'Hot Tub, WiFi', 'Suite', 'Sea', True, 'Stained carpet'),
(15, 203.55, 'WiFi', 'Suite', 'Sea', False, NULL),
(16, 248.06, 'Mini Bar, WiFi', 'Double', 'Mountain', True, 'Leaky faucet'),
(16, 168.39, 'Air Conditioning, WiFi', 'Family', 'Sea', False, 'Stained carpet'),
(16, 233.55, 'WiFi, Air Conditioning', 'Double', 'Mountain', False, 'Leaky faucet'),
(16, 66.09, 'Balcony, Air Conditioning', 'Double', 'Sea', True, 'Broken AC'),
(16, 231.25, 'Air Conditioning', 'Suite', 'Mountain', True, 'Stained carpet'),
(16, 208.65, 'Mini Bar, WiFi', 'Family', 'Sea', True, 'Broken AC'),
(16, 121.2, 'Balcony, Mini Bar', 'Double', 'Sea', True, NULL),
(16, 57.41, 'WiFi, Hot Tub, Air Conditioning', 'Family', 'Sea', True, 'Leaky faucet'),
(17, 206.81, 'Hot Tub, TV, Mini Bar', 'Family', 'Sea', True, 'Leaky faucet'),
(17, 160.28, 'Balcony, Air Conditioning, Hot Tub', 'Single', 'Mountain', False, 'Noisy neighbors'),
(17, 171.72, 'Mini Bar, Air Conditioning, TV', 'Double', 'Sea', False, 'Noisy neighbors'),
(17, 165.84, 'Mini Bar, TV', 'Suite', 'Sea', False, 'Leaky faucet'),
(17, 68.22, 'TV, WiFi, Mini Bar', 'Double', 'Mountain', False, NULL),
(17, 169.87, 'TV, Air Conditioning', 'Suite', 'Mountain', False, 'Leaky faucet'),
(17, 140.62, 'Balcony, Air Conditioning', 'Double', 'Mountain', True, 'Noisy neighbors'),
(17, 97.64, 'TV, Balcony, WiFi', 'Suite', 'Mountain', False, 'Stained carpet'),
(18, 148.6, 'Mini Bar, WiFi, Balcony', 'Double', 'Mountain', False, 'Broken AC'),
(18, 149.13, 'TV, Hot Tub, Mini Bar', 'Single', 'Mountain', False, NULL),
(18, 191.28, 'Mini Bar', 'Suite', 'Mountain', True, 'Noisy neighbors'),
(18, 128.03, 'Hot Tub, Air Conditioning, Mini Bar', 'Double', 'Sea', True, NULL),
(18, 178.17, 'WiFi', 'Double', 'Sea', False, 'Stained carpet'),
(18, 117.68, 'WiFi, Balcony, TV', 'Suite', 'Sea', False, 'Noisy neighbors'),
(18, 124.24, 'Mini Bar, Hot Tub', 'Single', 'Sea', False, 'Leaky faucet'),
(18, 94.59, 'WiFi', 'Single', 'Mountain', True, 'Noisy neighbors'),
(19, 170.99, 'Balcony', 'Double', 'Mountain', True, NULL),
(19, 91.28, 'WiFi, TV', 'Double', 'Mountain', False, 'Stained carpet'),
(19, 125.82, 'Hot Tub', 'Family', 'Sea', False, 'Noisy neighbors'),
(19, 205.69, 'WiFi', 'Double', 'Sea', False, 'Noisy neighbors'),
(19, 172.1, 'TV, WiFi', 'Double', 'Sea', False, 'Broken AC'),
(19, 97.64, 'TV, Air Conditioning, Mini Bar', 'Double', 'Mountain', True, 'Broken AC'),
(19, 182.94, 'WiFi', 'Single', 'Sea', False, 'Leaky faucet'),
(19, 215.77, 'WiFi', 'Suite', 'Sea', False, NULL),
(20, 52.06, 'Air Conditioning, Balcony, WiFi', 'Family', 'Mountain', False, 'Noisy neighbors'),
(20, 166.37, 'Hot Tub', 'Single', 'Mountain', False, NULL),
(20, 84.53, 'WiFi, Air Conditioning, Balcony', 'Suite', 'Sea', True, NULL),
(20, 99.71, 'WiFi, TV, Air Conditioning', 'Suite', 'Mountain', False, 'Broken AC'),
(20, 89.54, 'Balcony', 'Single', 'Sea', False, NULL),
(20, 82.23, 'Hot Tub, Mini Bar, WiFi', 'Single', 'Mountain', True, 'Broken AC'),
(20, 91.16, 'WiFi', 'Family', 'Mountain', False, NULL),
(20, 167.54, 'Mini Bar, TV, Hot Tub', 'Suite', 'Sea', True, NULL),
(21, 78.03, 'TV, Balcony, WiFi', 'Single', 'Sea', False, 'Leaky faucet'),
(21, 164.1, 'Mini Bar', 'Family', 'Sea', True, 'Stained carpet'),
(21, 197.32, 'TV, WiFi', 'Double', 'Sea', False, NULL),
(21, 71.82, 'Hot Tub', 'Double', 'Sea', False, 'Leaky faucet'),
(21, 130.78, 'Balcony, WiFi, Hot Tub', 'Single', 'Mountain', True, 'Leaky faucet'),
(21, 207.51, 'Air Conditioning', 'Single', 'Mountain', False, 'Stained carpet'),
(21, 69.75, 'WiFi, Mini Bar, Air Conditioning', 'Single', 'Sea', True, 'Stained carpet'),
(21, 134.35, 'Air Conditioning, WiFi', 'Single', 'Mountain', False, 'Broken AC'),
(22, 90.18, 'Balcony, Air Conditioning, WiFi', 'Double', 'Sea', True, 'Noisy neighbors'),
(22, 113.04, 'Balcony', 'Family', 'Mountain', True, 'Stained carpet'),
(22, 89.18, 'Balcony, WiFi', 'Family', 'Sea', True, NULL),
(22, 232.2, 'Air Conditioning', 'Single', 'Mountain', False, NULL),
(22, 60.01, 'TV, WiFi', 'Double', 'Mountain', True, 'Leaky faucet'),
(22, 93.82, 'Air Conditioning, Mini Bar, Balcony', 'Family', 'Mountain', True, 'Stained carpet'),
(22, 135.41, 'Mini Bar, WiFi, TV', 'Suite', 'Sea', False, 'Leaky faucet'),
(22, 114.1, 'Air Conditioning, TV', 'Double', 'Sea', False, 'Broken AC'),
(23, 115.54, 'TV', 'Suite', 'Mountain', False, NULL),
(23, 171.65, 'Air Conditioning, Hot Tub, Mini Bar', 'Double', 'Sea', True, NULL),
(23, 176.63, 'WiFi, Hot Tub', 'Family', 'Mountain', True, 'Broken AC'),
(23, 242.75, 'TV', 'Suite', 'Mountain', True, NULL),
(23, 199.82, 'Hot Tub, TV, Mini Bar', 'Double', 'Sea', True, 'Broken AC'),
(23, 133.93, 'Air Conditioning, TV, Mini Bar', 'Double', 'Mountain', False, 'Stained carpet'),
(23, 189.91, 'Balcony, TV', 'Single', 'Sea', False, 'Stained carpet'),
(23, 206.91, 'TV', 'Double', 'Sea', True, 'Broken AC'),
(24, 193.76, 'Hot Tub, WiFi', 'Family', 'Mountain', False, NULL),
(24, 227.52, 'WiFi, Air Conditioning', 'Single', 'Sea', False, 'Broken AC'),
(24, 169.03, 'WiFi', 'Suite', 'Mountain', False, 'Noisy neighbors'),
(24, 174.42, 'Mini Bar', 'Single', 'Sea', False, 'Broken AC'),
(24, 105.27, 'TV, Hot Tub', 'Double', 'Sea', True, NULL),
(24, 117.38, 'TV, Mini Bar, Balcony', 'Single', 'Sea', True, 'Broken AC'),
(24, 80.71, 'Mini Bar', 'Suite', 'Mountain', False, 'Stained carpet'),
(24, 124.96, 'Hot Tub', 'Single', 'Mountain', True, 'Broken AC'),
(25, 97.78, 'Air Conditioning, WiFi, Hot Tub', 'Family', 'Mountain', False, 'Broken AC'),
(25, 231.93, 'WiFi, Balcony, Hot Tub', 'Single', 'Sea', True, 'Stained carpet'),
(25, 84.4, 'TV', 'Family', 'Mountain', False, 'Stained carpet'),
(25, 232.41, 'Balcony', 'Single', 'Sea', True, 'Broken AC'),
(25, 51.27, 'TV, Hot Tub', 'Double', 'Sea', True, 'Leaky faucet'),
(25, 166.81, 'TV', 'Single', 'Sea', False, 'Broken AC'),
(25, 132.23, 'Air Conditioning', 'Suite', 'Mountain', True, 'Stained carpet'),
(25, 98.37, 'Balcony, Hot Tub', 'Single', 'Mountain', True, NULL),
(26, 190.25, 'TV, WiFi', 'Suite', 'Sea', True, 'Noisy neighbors'),
(26, 115.37, 'Balcony, TV, Air Conditioning', 'Family', 'Sea', False, 'Broken AC'),
(26, 129.3, 'TV', 'Double', 'Mountain', False, 'Leaky faucet'),
(26, 142.2, 'WiFi', 'Family', 'Sea', True, 'Noisy neighbors'),
(26, 142.5, 'WiFi', 'Double', 'Mountain', True, 'Leaky faucet'),
(26, 164.96, 'TV, WiFi, Hot Tub', 'Suite', 'Sea', True, NULL),
(26, 239.89, 'Air Conditioning, Mini Bar', 'Family', 'Mountain', True, 'Stained carpet'),
(26, 138.64, 'Air Conditioning, Mini Bar', 'Double', 'Mountain', False, NULL),
(27, 226.89, 'Air Conditioning', 'Suite', 'Mountain', False, 'Stained carpet'),
(27, 67.08, 'WiFi', 'Suite', 'Mountain', False, 'Stained carpet'),
(27, 187.32, 'Balcony, Hot Tub', 'Single', 'Sea', False, 'Noisy neighbors'),
(27, 160.68, 'Hot Tub, Balcony, TV', 'Family', 'Mountain', False, 'Leaky faucet'),
(27, 209.59, 'Balcony', 'Double', 'Mountain', True, 'Leaky faucet'),
(27, 238.14, 'TV, Air Conditioning', 'Double', 'Sea', False, NULL),
(27, 247.52, 'WiFi, Hot Tub, Balcony', 'Suite', 'Sea', True, 'Stained carpet'),
(27, 225.31, 'WiFi, TV, Balcony', 'Double', 'Mountain', False, 'Leaky faucet'),
(28, 89.0, 'Balcony, WiFi, Hot Tub', 'Double', 'Mountain', False, 'Broken AC'),
(28, 136.69, 'Air Conditioning, Hot Tub, WiFi', 'Family', 'Mountain', True, 'Stained carpet'),
(28, 230.14, 'WiFi, Balcony, Air Conditioning', 'Family', 'Sea', False, NULL),
(28, 66.73, 'TV', 'Single', 'Sea', False, 'Leaky faucet'),
(28, 143.22, 'Air Conditioning, Mini Bar', 'Double', 'Sea', False, 'Leaky faucet'),
(28, 215.52, 'Hot Tub, Air Conditioning', 'Family', 'Sea', True, NULL),
(28, 139.18, 'Hot Tub', 'Suite', 'Mountain', True, 'Stained carpet'),
(28, 157.36, 'WiFi, Hot Tub', 'Suite', 'Sea', False, 'Stained carpet'),
(29, 243.59, 'Balcony', 'Single', 'Mountain', False, 'Stained carpet'),
(29, 189.19, 'Mini Bar, TV, Balcony', 'Double', 'Sea', False, 'Stained carpet'),
(29, 108.22, 'Hot Tub, TV', 'Double', 'Mountain', False, 'Stained carpet'),
(29, 95.32, 'Balcony, Mini Bar', 'Double', 'Sea', False, 'Leaky faucet'),
(29, 123.26, 'Hot Tub, Mini Bar, TV', 'Single', 'Sea', True, 'Stained carpet'),
(29, 214.95, 'Hot Tub, Balcony, WiFi', 'Family', 'Sea', True, NULL),
(29, 234.22, 'TV, Mini Bar, WiFi', 'Single', 'Mountain', False, 'Leaky faucet'),
(29, 195.75, 'Balcony, Air Conditioning, Hot Tub', 'Family', 'Sea', False, 'Noisy neighbors'),
(30, 216.03, 'WiFi', 'Double', 'Sea', True, 'Stained carpet'),
(30, 53.31, 'Balcony, WiFi, TV', 'Suite', 'Mountain', True, 'Leaky faucet'),
(30, 196.75, 'TV, WiFi, Air Conditioning', 'Family', 'Sea', False, 'Leaky faucet'),
(30, 244.37, 'TV', 'Family', 'Sea', False, 'Leaky faucet'),
(30, 160.7, 'Hot Tub, Balcony, WiFi', 'Family', 'Sea', False, 'Stained carpet'),
(30, 91.36, 'Hot Tub, TV', 'Double', 'Sea', True, 'Noisy neighbors'),
(30, 218.97, 'Hot Tub, Balcony, TV', 'Double', 'Sea', True, 'Broken AC'),
(30, 215.1, 'Air Conditioning', 'Single', 'Sea', True, 'Leaky faucet'),
(31, 58.57, 'Balcony, TV', 'Double', 'Mountain', False, 'Broken AC'),
(31, 214.73, 'Hot Tub, Air Conditioning, WiFi', 'Double', 'Sea', False, 'Leaky faucet'),
(31, 74.08, 'Hot Tub, Balcony', 'Single', 'Mountain', True, 'Noisy neighbors'),
(31, 71.48, 'WiFi, Hot Tub', 'Double', 'Mountain', True, NULL),
(31, 217.39, 'Air Conditioning, Hot Tub', 'Family', 'Mountain', True, 'Noisy neighbors'),
(31, 117.47, 'TV, WiFi', 'Double', 'Mountain', True, 'Stained carpet'),
(31, 247.14, 'WiFi, Mini Bar', 'Single', 'Sea', True, 'Noisy neighbors'),
(31, 113.33, 'TV, Air Conditioning, Mini Bar', 'Double', 'Sea', False, 'Leaky faucet'),
(32, 193.1, 'Hot Tub', 'Family', 'Mountain', True, 'Stained carpet'),
(32, 152.84, 'WiFi, Air Conditioning', 'Family', 'Sea', True, 'Noisy neighbors'),
(32, 167.46, 'Mini Bar', 'Single', 'Sea', True, 'Leaky faucet'),
(32, 204.15, 'Mini Bar, Balcony, WiFi', 'Family', 'Sea', True, 'Broken AC'),
(32, 78.07, 'Air Conditioning', 'Family', 'Sea', False, 'Noisy neighbors'),
(32, 162.5, 'WiFi, Air Conditioning, Hot Tub', 'Single', 'Sea', False, 'Leaky faucet'),
(32, 63.03, 'Balcony, TV', 'Single', 'Mountain', False, 'Stained carpet'),
(32, 239.55, 'Mini Bar', 'Single', 'Mountain', False, 'Leaky faucet'),
(33, 97.31, 'Air Conditioning', 'Double', 'Mountain', True, 'Broken AC'),
(33, 160.45, 'TV', 'Family', 'Mountain', True, NULL),
(33, 224.13, 'TV, Air Conditioning', 'Suite', 'Sea', True, 'Broken AC'),
(33, 244.18, 'Hot Tub', 'Family', 'Mountain', True, 'Noisy neighbors'),
(33, 165.44, 'Hot Tub, TV', 'Double', 'Mountain', True, 'Leaky faucet'),
(33, 69.74, 'TV', 'Family', 'Sea', True, 'Broken AC'),
(33, 51.55, 'Air Conditioning', 'Family', 'Sea', False, 'Broken AC'),
(33, 176.85, 'WiFi, Air Conditioning', 'Double', 'Mountain', False, NULL),
(34, 157.52, 'Air Conditioning', 'Double', 'Mountain', True, NULL),
(34, 131.26, 'Balcony', 'Single', 'Mountain', True, 'Broken AC'),
(34, 91.02, 'WiFi, Air Conditioning, Balcony', 'Family', 'Sea', False, 'Stained carpet'),
(34, 210.21, 'Balcony, Air Conditioning, TV', 'Single', 'Sea', False, 'Stained carpet'),
(34, 71.53, 'Mini Bar', 'Single', 'Mountain', False, 'Stained carpet'),
(34, 55.88, 'Air Conditioning, TV, Balcony', 'Family', 'Mountain', True, 'Stained carpet'),
(34, 54.26, 'Balcony', 'Family', 'Sea', True, 'Noisy neighbors'),
(34, 188.98, 'Air Conditioning, Hot Tub, Mini Bar', 'Double', 'Mountain', True, 'Broken AC'),
(35, 121.2, 'Mini Bar, WiFi', 'Family', 'Mountain', True, 'Broken AC'),
(35, 208.63, 'Hot Tub, WiFi, Mini Bar', 'Single', 'Sea', False, 'Broken AC'),
(35, 74.91, 'Air Conditioning', 'Single', 'Mountain', True, 'Noisy neighbors'),
(35, 184.22, 'Balcony, Air Conditioning, WiFi', 'Single', 'Mountain', True, 'Leaky faucet'),
(35, 59.23, 'TV, Balcony', 'Single', 'Sea', False, 'Broken AC'),
(35, 109.7, 'Balcony, WiFi', 'Family', 'Mountain', False, 'Leaky faucet'),
(35, 247.82, 'WiFi, TV', 'Double', 'Mountain', False, 'Noisy neighbors'),
(35, 226.3, 'Mini Bar', 'Family', 'Mountain', True, NULL),
(36, 151.98, 'Air Conditioning, TV', 'Family', 'Sea', False, NULL),
(36, 122.18, 'Hot Tub', 'Suite', 'Mountain', True, 'Stained carpet'),
(36, 144.23, 'Balcony', 'Single', 'Sea', True, 'Broken AC'),
(36, 57.79, 'Air Conditioning, TV, Balcony', 'Single', 'Sea', True, NULL),
(36, 70.72, 'Air Conditioning', 'Double', 'Mountain', False, 'Noisy neighbors'),
(36, 234.46, 'WiFi, Balcony, TV', 'Single', 'Mountain', True, 'Noisy neighbors'),
(36, 121.7, 'Mini Bar, Balcony', 'Single', 'Sea', True, 'Stained carpet'),
(36, 153.04, 'TV, Air Conditioning, Balcony', 'Single', 'Mountain', False, 'Leaky faucet'),
(37, 56.85, 'Hot Tub, Air Conditioning', 'Double', 'Sea', True, 'Noisy neighbors'),
(37, 93.93, 'Mini Bar, WiFi, Balcony', 'Family', 'Mountain', False, NULL),
(37, 115.43, 'Balcony, Air Conditioning, Hot Tub', 'Family', 'Sea', False, NULL),
(37, 127.55, 'TV, Air Conditioning, WiFi', 'Double', 'Sea', True, NULL),
(37, 79.35, 'Hot Tub, WiFi, TV', 'Single', 'Mountain', True, 'Noisy neighbors'),
(37, 115.73, 'WiFi, Balcony', 'Double', 'Mountain', False, 'Leaky faucet'),
(37, 237.06, 'WiFi, Balcony, Mini Bar', 'Double', 'Mountain', False, 'Noisy neighbors'),
(37, 148.46, 'Air Conditioning, WiFi, Mini Bar', 'Single', 'Sea', False, 'Broken AC'),
(38, 100.61, 'Hot Tub', 'Suite', 'Mountain', False, 'Broken AC'),
(38, 172.03, 'WiFi', 'Single', 'Sea', True, 'Stained carpet'),
(38, 105.5, 'Mini Bar, TV', 'Suite', 'Mountain', False, NULL),
(38, 52.49, 'Balcony, Hot Tub', 'Family', 'Sea', False, 'Stained carpet'),
(38, 122.71, 'TV, Air Conditioning', 'Family', 'Sea', False, 'Stained carpet'),
(38, 153.12, 'Mini Bar, Balcony, TV', 'Family', 'Sea', False, 'Leaky faucet'),
(38, 234.17, 'TV', 'Double', 'Sea', True, NULL),
(38, 171.11, 'Mini Bar', 'Single', 'Sea', False, 'Leaky faucet'),
(39, 150.73, 'Hot Tub, WiFi, Balcony', 'Double', 'Sea', True, 'Leaky faucet'),
(39, 167.57, 'Hot Tub', 'Double', 'Sea', True, 'Stained carpet'),
(39, 85.91, 'Hot Tub, Mini Bar, Balcony', 'Single', 'Mountain', True, 'Broken AC'),
(39, 247.86, 'Mini Bar, WiFi, Air Conditioning', 'Family', 'Sea', True, 'Stained carpet'),
(39, 157.97, 'TV, Balcony', 'Single', 'Sea', False, 'Broken AC'),
(39, 128.78, 'Air Conditioning', 'Suite', 'Mountain', True, 'Leaky faucet'),
(39, 167.23, 'Hot Tub, WiFi', 'Suite', 'Mountain', False, 'Noisy neighbors'),
(39, 166.47, 'TV, Balcony', 'Single', 'Sea', False, 'Leaky faucet'),
(40, 241.95, 'WiFi, Hot Tub, Mini Bar', 'Family', 'Sea', False, 'Noisy neighbors'),
(40, 203.36, 'WiFi, TV', 'Double', 'Sea', True, 'Leaky faucet'),
(40, 164.06, 'Balcony, TV, WiFi', 'Family', 'Mountain', False, 'Noisy neighbors'),
(40, 118.79, 'Hot Tub, Mini Bar', 'Double', 'Mountain', True, 'Noisy neighbors'),
(40, 194.05, 'Balcony, Air Conditioning, Mini Bar', 'Double', 'Mountain', True, 'Leaky faucet'),
(40, 141.75, 'Balcony, Mini Bar', 'Suite', 'Mountain', False, 'Broken AC'),
(40, 124.78, 'Mini Bar, TV', 'Double', 'Sea', False, 'Leaky faucet'),
(40, 206.92, 'TV, Balcony', 'Family', 'Sea', True, 'Noisy neighbors');