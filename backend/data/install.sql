DROP TABLE IF EXISTS Notifications;
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
    PasswordHash varchar(64) NOT NULL,
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
    NetworkDescription varchar(500) NOT NULL,
    Members int NOT NULL DEFAULT 0,
    PrivateNetwork boolean NOT NULL DEFAULT FALSE,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE,
    CHECK(Members > 0)
);

CREATE TABLE Posts (
    PostId SERIAL PRIMARY KEY,
    UserId int NOT NULL,
    NetworkId int,
    TextContent varchar(1500) NOT NULL,
    ImageId int,
    Likes int NOT NULL DEFAULT 0,
    ParentId int,
    PrivatePost boolean NOT NULL,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    EditedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE,
    FOREIGN KEY(UserId) REFERENCES Users(UserId),
    FOREIGN KEY(NetworkId) REFERENCES Networks(NetworkId),
    FOREIGN KEY(ImageId) REFERENCES Images(ImageId),
    FOREIGN KEY(ParentId) REFERENCES Posts(PostId),
    CHECK(Likes > 0)
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
    Shape int NOT NULL
);

CREATE TABLE IslandData (
    UserId int PRIMARY KEY,
    NumberOfPeople int NOT NULL DEFAULT 0,
    DataPath varchar(256) UNIQUE NOT NULL,
    InventoryData JSONB DEFAULT
    '{
        "Item0": 0, "Item1": 0, "Item2": 0, "Item3": 0, "Item4": 0, "Item5": 0, "Item6": 0, "Item7": 0, 
        "Item8": 0, "Item9": 0, "Item10": 0, "Item11": 0, "Item12": 0, "Item13": 0, "Item14": 0, 
        "Item15": 0, "Item16": 0, "Item17": 0, "Item18": 0, "Item19": 0, "Item20": 0, "Item21": 0, 
        "Item22": 0, "Item23": 0, "Item24": 0, "Item25": 0, "Item26": 0, "Item27": 0, "Item28": 0, 
        "Item29": 0, "Item30": 0, "Item31": 0, "Item32": 0, "Item33": 0, "Item34": 0, "Item35": 0, 
        "Item36": 0, "Item37": 0, "Item38": 0, "Item39": 0, "Item40": 0, "Item41": 0, "Item42": 0, 
        "Item43": 0, "Item44": 0, "Item45": 0, "Item46": 0, "Item47": 0, "Item48": 0, "Item49": 0, 
        "Item50": 0, "Item51": 0, "Item52": 0, "Item53": 0, "Item54": 0, "Item55": 0, "Item56": 0, 
        "Item57": 0, "Item58": 0, "Item59": 0, "Item60": 0, "Item61": 0, "Item62": 0, "Item63": 0, 
        "Item64": 0, "Item65": 0, "Item66": 0, "Item67": 0, "Item68": 0, "Item69": 0, "Item70": 0, 
        "Item71": 0, "Item72": 0, "Item73": 0, "Item74": 0, "Item75": 0, "Item76": 0, "Item77": 0, 
        "Item78": 0, "Item79": 0, "Item80": 0, "Item81": 0, "Item82": 0, "Item83": 0, "Item84": 0, 
        "Item85": 0, "Item86": 0, "Item87": 0, "Item88": 0, "Item89": 0, "Item90": 0, "Item91": 0, 
        "Item92": 0, "Item93": 0, "Item94": 0, "Item95": 0, "Item96": 0, "Item97": 0, "Item98": 0, 
        "Item99": 0, "Item100": 0, "Item101": 0, "Item102": 0, "Item103": 0, "Item104": 0, "Item105": 0, 
        "Item106": 0, "Item107": 0, "Item108": 0, "Item109": 0, "Item110": 0, "Item111": 0, "Item112": 0, 
        "Item113": 0, "Item114": 0, "Item115": 0, "Item116": 0, "Item117": 0, "Item118": 0, "Item119": 0, 
        "Item120": 0, "Item121": 0, "Item122": 0, "Item123": 0, "Item124": 0, "Item125": 0, "Item126": 0, 
        "Item127": 0
    }'
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
    UpdateId int UNIQUE DEFAULT NULL,
    OnTime boolean DEFAULT NULL,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DueDate timestamp NOT NULL,
    Deleted boolean NOT NULL DEFAULT FALSE,
    DeletedDate timestamp,
    FOREIGN KEY(UserId) REFERENCES Users(UserId),
    FOREIGN KEY(UpdateId) REFERENCES Projects(ProjectId),
    CHECK (SocialPoints > 0 OR CareerPoints > 0 OR PersonalPoints > 0),
    CHECK (UpdateId > ProjectId),
    CHECK (EXTRACT(EPOCH FROM (DueDate - CreatedDate)) > 0)
);

CREATE TABLE Notifications (
    NotificationId SERIAL PRIMARY KEY,
    UserId int NOT NULL,
    TextContent varchar(70),
    Viewed boolean NOT NULL DEFAULT FALSE,
    CreatedDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletedDate timestamp,
    Deleted boolean NOT NULL DEFAULT FALSE,
    FOREIGN KEY(UserId) REFERENCES Users(UserId)
);

INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (0,'Air',1,0,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (1,'Simple Block',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (2,'Grass Block',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (3,'Sand Block',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (4,'Snow Block',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (5,'Stone Block',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (6,'Water Block',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (7,'Dirt Path',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (8,'Natural Incline',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (9,'Corner-Natural Incline',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (10,'Land Bridge',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (11,'Snow Slat Path',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (12,'Snow Icline',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (13,'Corner-Snow Incline',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (14,'Snow Bridge',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (15,'Sand Slat Path',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (16,'Sandy Incline',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (17,'Corner-Sand Incline',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (18,'Isthmus',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (19,'Gravel Path',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (20,'Log Steps',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (21,'Suspension Bridge',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (22,'Dirt Slat Path',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (23,'Wood Steps',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (24,'Wood Bridge',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (25,'Cobblestone Path',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (26,'Stone Steps',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (27,'Stone Bridge',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (28,'Brick Path',1,3,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (29,'Brick Steps',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (30,'Brick Bridge',1,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (31,'Steel Path',1,3,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (32,'Steel Steps',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (33,'Steel Bridge',1,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (34,'Rocky Path',1,2,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (35,'Rocky Incline',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (36,'Rocky Land Bridge',1,5,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (37,'Oak Tree',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (38,'Deciduous Forest',1,12,2);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (39,'Small Deciduous Forest',1,6,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (40,'Pine Tree',1,4,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (41,'Conifer Forest',1,12,2);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (42,'Small Conifer Forest',1,6,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (43,'Birch Tree',1,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (44,'Birch Forest',1,18,2);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (45,'Small Birch Forest',1,9,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (46,'Palm Tree',1,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (47,'Rainforest',1,18,2);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (48,'Oasis',1,9,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (49,'Garden Flowers',1,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (50,'Rare Flowers',1,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (51,'Wildflowers',1,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (52,'Brush',1,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (53,'Tall Grass',1,3,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (54,'Hydrangea',1,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (55,'Swingset',0,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (56,'Sandbox',0,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (57,'Slides',0,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (58,'Museum',0,32,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (59,'Amusement Park Entrance',0,16,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (60,'Roller Coaster',0,24,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (61,'Roller Coaster mk2',0,32,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (62,'Dropper',0,24,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (63,'Bumper Karts',0,24,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (64,'Pool Corner',0,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (65,'Pool Edge',0,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (66,'Beach Towel',0,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (67,'Umbrella',0,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (68,'Park Entrance',0,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (69,'Ranger Station',0,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (70,'Log Cabin',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (71,'Log Cabin mk2',2,18,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (72,'Hostel',2,24,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (73,'Campsite',2,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (74,'Campsite mk2',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (75,'Townhouse (Brick)',2,16,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (76,'Townhouse (White)',2,16,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (77,'Townhouse (Beige)',2,16,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (78,'Townhouse (Yellow)',2,16,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (79,'Townhouse (Pink)',2,16,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (80,'Suburbs House (Wood)',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (81,'Suburbs House (White)',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (82,'Suburbs House (Red)',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (83,'Suburbs House (Green)',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (84,'Manor',2,64,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (85,'Modern House',2,32,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (86,'Modern Manor',2,128,2);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (87,'Apartment Complex (Brick)',2,64,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (88,'Apartment Complex (Glass)',2,64,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (89,'Apartment Complex (White)',2,64,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (90,'Skyscraper',2,128,2);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (91,'Office Buildings (Brick)',2,96,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (92,'Office Buildings (Glass)',2,96,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (93,'Storefront (Brick)',2,32,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (94,'Storefront (Wood)',2,32,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (95,'Storefront (White)',2,32,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (96,'Awning (White)',2,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (97,'Awning (Periwinkle)',2,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (98,'Awning (Dandelion)',2,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (99,'Awning (Mint)',2,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (100,'Awning (Pink)',2,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (101,'Gibberish Sign',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (102,'Gibberish Sign mk2',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (103,'Train Station',2,64,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (104,'Train Station mk2',2,96,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (105,'Subway Station (Red)',2,32,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (106,'Subway Station (Green)',2,32,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (107,'Subway Station (Blue)',2,32,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (108,'Train Tracks',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (109,'Train Track Corner',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (110,'Train Track Intersection',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (111,'Train Crossroads',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (112,'Sidewalk',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (113,'Corner Sidewalk',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (114,'Street',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (115,'T-Intersection',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (116,'Street Corner',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (117,'4-Way Intersection',2,6,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (118,'Overhead Street Bridge',2,18,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (119,'Traffic Light',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (120,'Traffic Light (2 Way)',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (121,'Parking Lot',2,16,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (122,'Dirt Lot',2,12,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (123,'Parking Garage',2,32,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (124,'Stop Sign',2,8,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (125,'Factory',2,96,1);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (126,'Wind Turbine',2,32,0);
INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape) VALUES (127,'Solar Panel',2,32,0);
