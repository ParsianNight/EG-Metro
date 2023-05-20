DROP TABLE IF EXISTS se_project.users;
DROP TABLE IF EXISTS se_project.sessions;
DROP TABLE IF EXISTS se_project.roles;
DROP TABLE IF EXISTS se_project.rides;
DROP TABLE IF EXISTS se_project.transactions;
DROP TABLE IF EXISTS se_project.refund_requests;
DROP TABLE IF EXISTS se_project.senior_requests;
DROP TABLE IF EXISTS se_project.stations;
DROP TABLE IF EXISTS se_project.routes;
DROP TABLE IF EXISTS se_project.stationRoutes;
DROP TABLE IF EXISTS se_project.tickets;
DROP TABLE IF EXISTS se_project.subscription;
DROP TABLE IF EXISTS se_project.zones;
DROP SCHEMA IF EXISTS se_project CASCADE;

CREATE SCHEMA IF NOT EXISTS se_project;


CREATE TABLE IF NOT EXISTS se_project.users
(
    id SERIAL NOT NULL,
    firstName text NOT NULL,
    lastName text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    roleId integer NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.zones
(
    id SERIAL NOT NULL,
    zoneType text NOT NULL, -- 9 stations/ 10-16/16
    price INTEGER NOT NULL,
    CONSTRAINT zones_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.subscription
(
    id SERIAL NOT NULL,
    subType text NOT NULL, --annual --month -- quarterly
    zoneId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    noOfTickets INTEGER NOT NULL,
    CONSTRAINT subscription_pkey PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES se_project.users(id),
    FOREIGN KEY (zoneId) REFERENCES se_project.zones(id)
);

CREATE TABLE IF NOT EXISTS se_project.tickets
(
    id SERIAL NOT NULL,
    origin text NOT NULL,
    destination text NOT NULL,
    userId INTEGER NOT NULL,
    subID INTEGER,
    tripDate timestamp NOT NULL,
    FOREIGN KEY (userId) REFERENCES se_project.users(id),
    FOREIGN KEY (subID) REFERENCES se_project.subscription(id),
    CONSTRAINT tickets_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.sessions
(
    id SERIAL NOT NULL,
    userId integer NOT NULL,
    token text NOT NULL,
    expiresAt timestamp NOT NULL,
    CONSTRAINT sessions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.roles
(
    id SERIAL NOT NULL,
    role text NOT NULL,
    CONSTRAINT roles_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.rides
(
    id SERIAL NOT NULL,
    status text NOT NULL,
    origin text NOT NULL, 
    destination text NOT NULL, 
    userId INTEGER NOT NULL,
    rideId integer NOT NULL,
    tripDate timestamp NOT NULL,
    FOREIGN KEY (userId) REFERENCES se_project.users(id),
    FOREIGN KEY (rideId) REFERENCES se_project.tickets(id),
    CONSTRAINT rides_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.transactions
(
    id SERIAL NOT NULL,
    amount INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    purchasedId text NOT NULL, 
    FOREIGN KEY (userId) REFERENCES se_project.users(id),
    CONSTRAINT transactions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.refund_requests
(
    id SERIAL NOT NULL,
    status text NOT NULL,
    userId INTEGER NOT NULL, 
    refundAmount INTEGER NOT NULL,
    ticketId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES se_project.users(id),
    FOREIGN KEY (ticketId) REFERENCES se_project.tickets(id),
    CONSTRAINT refund_requests_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.senior_requests
(
    id SERIAL NOT NULL,
    status text NOT NULL,
    userId INTEGER NOT NULL, 
    nationalId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES se_project.users(id),
    CONSTRAINT senior_requests_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.stations
(
    id SERIAL NOT NULL,
    stationName text NOT NULL,
    stationType text NOT NULL, -- normal or transfer
    stationPosition text, -- start middle end
    stationStatus text NOT NULL, -- new created or not
    CONSTRAINT stations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS se_project.routes
(
    id SERIAL NOT NULL,
    routeName text NOT NULL,
    fromStationId INTEGER NOT NULL,
    toStationId INTEGER NOT NULL, 
    CONSTRAINT routes_pkey PRIMARY KEY (id),
    FOREIGN KEY (fromStationId) REFERENCES se_project.stations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (toStationId) REFERENCES se_project.stations(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS se_project.stationRoutes
(
    id SERIAL NOT NULL,
    stationId INTEGER NOT NULL,
    routeId INTEGER NOT NULL, 
    CONSTRAINT stationRoutes_pkey PRIMARY KEY (id),
    FOREIGN KEY (stationId) REFERENCES se_project.stations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (routeId) REFERENCES se_project.routes(id) ON DELETE CASCADE ON UPDATE CASCADE
);
