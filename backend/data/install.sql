DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS Requests;
DROP TABLE IF EXISTS IslandData;
DROP TABLE IF EXISTS Resources;
DROP TABLE IF EXISTS Tags;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS Networks;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Images;

CREATE TABLE Images (
    ImageId SERIAL PRIMARY KEY,
    ImagePath varchar(256) UNIQUE NOT NULL,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE
);

CREATE TABLE Users (
    UserId SERIAL PRIMARY KEY,
    Username varchar(20) NOT NULL,
    Email varchar(320) NOT NULL,
    PasswordHash varchar(50) NOT NULL,
    ProfileImageId int,
    SocialPoints int NOT NULL DEFAULT 0,
    CareerPoints int NOT NULL DEFAULT 0,
    PersonalPoints int NOT NULL DEFAULT 0,
    PrivateAccount boolean NOT NULL DEFAULT FALSE,
    Restricted boolean NOT NULL DEFAULT FALSE,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE,
    FOREIGN KEY(ProfileImageId) REFERENCES Images(ImageId)
);

CREATE TABLE Networks (
    NetworkId SERIAL PRIMARY KEY,
    NetworkName varchar(60) NOT NULL,
    PrivateNetwork boolean NOT NULL DEFAULT FALSE,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE
);

CREATE TABLE Posts (
    PostId SERIAL PRIMARY KEY,
    UserId int NOT NULL,
    NetworkId int,
    TextContent varchar(1500) NOT NULL,
    ImageId int,
    Likes int NOT NULL DEFAULT 0,
    ParentId int,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    EditedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE,
    FOREIGN KEY(UserId) REFERENCES Users(UserId),
    FOREIGN KEY(NetworkId) REFERENCES Networks(NetworkId),
    FOREIGN KEY(ImageId) REFERENCES Images(ImageId)
);

CREATE TABLE Tags (
    TagId SERIAL PRIMARY KEY,
    TagName varchar(50) UNIQUE NOT NULL,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE
);

CREATE TABLE Resources (
    ResourceId int PRIMARY KEY,
    ResourceName varchar(50) UNIQUE NOT NULL,
    Category int NOT NULL,
    PointsValue int NOT NULL,
    Shape int NOT NULL,
    ImageId int UNIQUE NOT NULL,
    FOREIGN KEY(ImageId) REFERENCES Images(ImageId)
);

CREATE TABLE IslandData (
    UserId int PRIMARY KEY,
    NumberOfPeople int NOT NULL DEFAULT 0,
    DataPath varchar(256) UNIQUE NOT NULL,
    FOREIGN KEY(UserId) REFERENCES Users(UserId)
);

CREATE TABLE Requests (
    RequestId SERIAL PRIMARY KEY,
    SenderId int NOT NULL,
    TargetUserId int DEFAULT NULL,
    TargetNetworkId int DEFAULT NULL,
    Resolved boolean NOT NULL DEFAULT FALSE,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    ResolvedDate timestamp,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE,
    FOREIGN KEY(SenderId) REFERENCES Users(UserId),
    FOREIGN KEY(TargetUserId) REFERENCES Users(UserId),
    FOREIGN KEY(TargetNetworkId) REFERENCES Networks(NetworkId),
    CHECK ((TargetUserId = NULL AND TargetNetworkId != NULL) OR (TargetUserId != NULL AND TargetNetworkId = NULL))
);

CREATE TABLE Projects (
    ProjectId SERIAL PRIMARY KEY,
    UserId int NOT NULL, 
    ProjectName varchar(50),
    ProjectDescription varchar(1500),
    SocialPoints int DEFAULT 0,
    CareerPoints int DEFAULT 0,
    PersonalPoints int DEFAULT 0,
    OnTime boolean DEFAULT NULL,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DueDate timestamp NOT NULL,
    DeletedDate timestamp,
    FOREIGN KEY(UserId) REFERENCES Users(UserId),
    CHECK (SocialPoints > 0 OR CareerPoints > 0 OR PersonalPoints > 0),
    CHECK (DueDate - CreatedDate > 0)
);