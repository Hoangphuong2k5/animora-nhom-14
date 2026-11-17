/*
    ANIMORA DATABASE - PHIÊN BẢN TINH GIẢN ver1.5 (MỨC 1)
    SQL Server 2022 / SSMS 21

    Gộp sạch toàn bộ cấu trúc từ ver1_0, ver1_1, ver1_2, ver1_5 và dữ liệu khởi tạo.
    Giữ nguyên 100% tên bảng, tên cột, constraint, index, trigger, stored procedure và dữ liệu seed.
    Chạy trên một database trống (tự tạo/sử dụng AnimoraDB).
*/

USE master;
GO

IF DB_ID(N'AnimoraDB') IS NULL
BEGIN
    CREATE DATABASE AnimoraDB;
END;
GO

USE AnimoraDB;
GO

SET NOCOUNT ON;
GO

/* =========================================================
   PHÂN HỆ 1 - TÀI KHOẢN VÀ PHÂN QUYỀN
   ========================================================= */

CREATE TABLE dbo.Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Roles_CreatedAt DEFAULT SYSDATETIME()
);

CREATE TABLE dbo.Permissions (
    PermissionID INT IDENTITY(1,1) PRIMARY KEY,
    PermissionCode NVARCHAR(100) NOT NULL UNIQUE,
    PermissionName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL
);

CREATE TABLE dbo.RolePermissions (
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_RolePermissions_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleID, PermissionID),
    CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID),
    CONSTRAINT FK_RolePermissions_Permissions FOREIGN KEY (PermissionID) REFERENCES dbo.Permissions(PermissionID)
);

CREATE TABLE dbo.Users (
    UserID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RoleID INT NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(20) NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    AccountStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Users_AccountStatus DEFAULT N'Active',
    IsEmailVerified BIT NOT NULL CONSTRAINT DF_Users_IsEmailVerified DEFAULT 0,
    LastLoginAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID),
    CONSTRAINT CK_Users_AccountStatus CHECK (AccountStatus IN (N'Active', N'Inactive', N'Locked', N'Pending'))
);

CREATE TABLE dbo.CustomerProfiles (
    CustomerID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID BIGINT NOT NULL UNIQUE,
    FullName NVARCHAR(150) NOT NULL,
    DateOfBirth DATE NULL,
    Gender NVARCHAR(20) NULL,
    Address NVARCHAR(500) NULL,
    AvatarUrl NVARCHAR(1000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_CustomerProfiles_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_CustomerProfiles_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_CustomerProfiles_Gender CHECK (Gender IS NULL OR Gender IN (N'Male', N'Female', N'Other'))
);

CREATE TABLE dbo.CustomerAddresses (
    CustomerAddressID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerID BIGINT NOT NULL,
    AddressLabel NVARCHAR(50) NULL,
    RecipientName NVARCHAR(150) NOT NULL,
    RecipientPhoneNumber NVARCHAR(20) NOT NULL,
    AddressLine NVARCHAR(500) NOT NULL,
    Ward NVARCHAR(150) NULL,
    District NVARCHAR(150) NULL,
    Province NVARCHAR(150) NULL,
    IsDefault BIT NOT NULL CONSTRAINT DF_CustomerAddresses_IsDefault DEFAULT 0,
    IsActive BIT NOT NULL CONSTRAINT DF_CustomerAddresses_IsActive DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_CustomerAddresses_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_CustomerAddresses_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID)
);

CREATE TABLE dbo.EmployeeProfiles (
    EmployeeID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID BIGINT NOT NULL UNIQUE,
    FullName NVARCHAR(150) NOT NULL,
    EmployeeType NVARCHAR(30) NOT NULL,
    DateOfBirth DATE NULL,
    HireDate DATE NULL,
    EmploymentType NVARCHAR(30) NULL,
    Address NVARCHAR(500) NULL,
    EmergencyContactName NVARCHAR(150) NULL,
    EmergencyContactPhone NVARCHAR(20) NULL,
    Specialization NVARCHAR(200) NULL,
    Biography NVARCHAR(2000) NULL,
    AvatarUrl NVARCHAR(1000) NULL,
    YearsOfExperience INT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_EmployeeProfiles_IsActive DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_EmployeeProfiles_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_EmployeeProfiles_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_EmployeeProfiles_EmployeeType CHECK (EmployeeType IN (N'Doctor', N'CareStaff', N'Other')),
    CONSTRAINT CK_EmployeeProfiles_EmploymentType CHECK (EmploymentType IS NULL OR EmploymentType IN (N'FullTime', N'PartTime')),
    CONSTRAINT CK_EmployeeProfiles_Experience CHECK (YearsOfExperience IS NULL OR YearsOfExperience BETWEEN 0 AND 60),
    CONSTRAINT CK_EmployeeProfiles_DoctorFullTime CHECK (EmployeeType <> N'Doctor' OR ISNULL(EmploymentType, N'') = N'FullTime')
);

CREATE TABLE dbo.EmployeeCertificates (
    CertificateID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    CertificateName NVARCHAR(200) NOT NULL,
    CertificateNumber NVARCHAR(100) NULL,
    IssuingOrganization NVARCHAR(200) NULL,
    IssuedDate DATE NULL,
    ExpiryDate DATE NULL,
    CertificateUrl NVARCHAR(1000) NULL,
    ApprovalStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_EmployeeCertificates_ApprovalStatus DEFAULT N'Pending',
    SubmittedAt DATETIME2(0) NOT NULL CONSTRAINT DF_EmployeeCertificates_SubmittedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_EmployeeCertificates_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT CK_EmployeeCertificates_ApprovalStatus CHECK (ApprovalStatus IN (N'Pending', N'Approved', N'Rejected', N'Expired')),
    CONSTRAINT CK_EmployeeCertificates_Dates CHECK (ExpiryDate IS NULL OR IssuedDate IS NULL OR ExpiryDate >= IssuedDate)
);

CREATE TABLE dbo.EmployeeCertificateApprovals (
    ApprovalID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CertificateID BIGINT NOT NULL,
    ReviewedByUserID BIGINT NOT NULL,
    ApprovalStatus NVARCHAR(30) NOT NULL,
    ReviewNotes NVARCHAR(1000) NULL,
    ReviewedAt DATETIME2(0) NOT NULL CONSTRAINT DF_EmployeeCertificateApprovals_ReviewedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_EmployeeCertificateApprovals_Certificates FOREIGN KEY (CertificateID) REFERENCES dbo.EmployeeCertificates(CertificateID),
    CONSTRAINT FK_EmployeeCertificateApprovals_Users FOREIGN KEY (ReviewedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_EmployeeCertificateApprovals_Status CHECK (ApprovalStatus IN (N'Approved', N'Rejected'))
);

CREATE TABLE dbo.SupplierProfiles (
    SupplierID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID BIGINT NOT NULL UNIQUE,
    SupplierName NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(150) NULL,
    PhoneNumber NVARCHAR(20) NULL,
    Email NVARCHAR(255) NULL,
    Address NVARCHAR(500) NULL,
    TaxCode NVARCHAR(50) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_SupplierProfiles_IsActive DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SupplierProfiles_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_SupplierProfiles_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.RescueStationProfiles (
    RescueStationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID BIGINT NOT NULL UNIQUE,
    StationName NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(150) NULL,
    PhoneNumber NVARCHAR(20) NULL,
    Email NVARCHAR(255) NULL,
    Address NVARCHAR(500) NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_RescueStationProfiles_IsActive DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_RescueStationProfiles_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_RescueStationProfiles_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.PasswordResetTokens (
    PasswordResetTokenID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID BIGINT NOT NULL,
    TokenHash NVARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt DATETIME2(0) NOT NULL,
    UsedAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PasswordResetTokens_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.UserSessions (
    UserSessionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID BIGINT NOT NULL,
    RefreshTokenHash NVARCHAR(500) NOT NULL UNIQUE,
    DeviceInfo NVARCHAR(300) NULL,
    IpAddress NVARCHAR(45) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_UserSessions_CreatedAt DEFAULT SYSDATETIME(),
    LastActiveAt DATETIME2(0) NULL,
    ExpiresAt DATETIME2(0) NOT NULL,
    RevokedAt DATETIME2(0) NULL,
    RevokeReason NVARCHAR(30) NULL,
    CONSTRAINT FK_UserSessions_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_UserSessions_Expiry CHECK (ExpiresAt > CreatedAt),
    CONSTRAINT CK_UserSessions_RevokeReason CHECK (
        RevokeReason IS NULL OR RevokeReason IN (N'Logout', N'AdminLock', N'PasswordReset', N'Expired', N'Other')),
    CONSTRAINT CK_UserSessions_Revoked CHECK (
        (RevokedAt IS NULL AND RevokeReason IS NULL) OR (RevokedAt IS NOT NULL AND RevokeReason IS NOT NULL))
);

CREATE INDEX IX_Users_RoleID ON dbo.Users(RoleID);
CREATE INDEX IX_EmployeeProfiles_EmployeeType ON dbo.EmployeeProfiles(EmployeeType);
CREATE INDEX IX_CustomerAddresses_CustomerID ON dbo.CustomerAddresses(CustomerID) WHERE IsActive = 1;
CREATE UNIQUE INDEX UX_CustomerAddresses_DefaultPerCustomer ON dbo.CustomerAddresses(CustomerID) WHERE IsDefault = 1 AND IsActive = 1;
CREATE INDEX IX_UserSessions_User_Active ON dbo.UserSessions(UserID, ExpiresAt) WHERE RevokedAt IS NULL;
GO

/* =========================================================
   PHÂN HỆ 2 - KHÁCH HÀNG VÀ THÚ CƯNG
   ========================================================= */

CREATE TABLE dbo.PetSpecies (
    SpeciesID INT IDENTITY(1,1) PRIMARY KEY,
    SpeciesName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL
);

CREATE TABLE dbo.PetBreeds (
    BreedID INT IDENTITY(1,1) PRIMARY KEY,
    SpeciesID INT NOT NULL,
    BreedName NVARCHAR(120) NOT NULL,
    Description NVARCHAR(500) NULL,
    CONSTRAINT FK_PetBreeds_PetSpecies FOREIGN KEY (SpeciesID) REFERENCES dbo.PetSpecies(SpeciesID),
    CONSTRAINT UQ_PetBreeds_Species_Breed UNIQUE (SpeciesID, BreedName)
);

CREATE TABLE dbo.Pets (
    PetID BIGINT IDENTITY(1,1) PRIMARY KEY,
    SpeciesID INT NOT NULL,
    BreedID INT NULL,
    PetName NVARCHAR(120) NOT NULL,
    BirthDate DATE NULL,
    Gender NVARCHAR(20) NULL,
    CurrentOwnerType NVARCHAR(30) NOT NULL,
    CustomerID BIGINT NULL,
    RescueStationID BIGINT NULL,
    Color NVARCHAR(80) NULL,
    WeightKg DECIMAL(6,2) NULL,
    MicrochipNumber NVARCHAR(100) NULL,
    GeneralNotes NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Pets_IsActive DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Pets_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Pets_PetSpecies FOREIGN KEY (SpeciesID) REFERENCES dbo.PetSpecies(SpeciesID),
    CONSTRAINT FK_Pets_PetBreeds FOREIGN KEY (BreedID) REFERENCES dbo.PetBreeds(BreedID),
    CONSTRAINT FK_Pets_CustomerProfiles FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_Pets_RescueStationProfiles FOREIGN KEY (RescueStationID) REFERENCES dbo.RescueStationProfiles(RescueStationID),
    CONSTRAINT CK_Pets_Gender CHECK (Gender IS NULL OR Gender IN (N'Male', N'Female', N'Unknown')),
    CONSTRAINT CK_Pets_Owner CHECK (
        (CurrentOwnerType = N'Customer' AND CustomerID IS NOT NULL AND RescueStationID IS NULL)
        OR (CurrentOwnerType = N'RescueStation' AND RescueStationID IS NOT NULL AND CustomerID IS NULL)
    ),
    CONSTRAINT CK_Pets_Weight CHECK (WeightKg IS NULL OR WeightKg > 0)
);

CREATE TABLE dbo.PetImages (
    PetImageID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PetID BIGINT NOT NULL,
    ImageUrl NVARCHAR(1000) NOT NULL,
    IsPrimary BIT NOT NULL CONSTRAINT DF_PetImages_IsPrimary DEFAULT 0,
    UploadedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PetImages_UploadedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PetImages_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID)
);

CREATE TABLE dbo.PetOwnershipHistory (
    OwnershipHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PetID BIGINT NOT NULL,
    PreviousOwnerType NVARCHAR(30) NULL,
    PreviousCustomerID BIGINT NULL,
    PreviousRescueStationID BIGINT NULL,
    NewOwnerType NVARCHAR(30) NOT NULL,
    NewCustomerID BIGINT NULL,
    NewRescueStationID BIGINT NULL,
    AdoptionApplicationID BIGINT NULL,
    TransferReason NVARCHAR(500) NULL,
    TransferredAt DATETIME2(0) NOT NULL CONSTRAINT DF_PetOwnershipHistory_TransferredAt DEFAULT SYSDATETIME(),
    RecordedByUserID BIGINT NULL,
    CONSTRAINT FK_PetOwnershipHistory_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID),
    CONSTRAINT FK_PetOwnershipHistory_PreviousCustomer FOREIGN KEY (PreviousCustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_PetOwnershipHistory_PreviousStation FOREIGN KEY (PreviousRescueStationID) REFERENCES dbo.RescueStationProfiles(RescueStationID),
    CONSTRAINT FK_PetOwnershipHistory_NewCustomer FOREIGN KEY (NewCustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_PetOwnershipHistory_NewStation FOREIGN KEY (NewRescueStationID) REFERENCES dbo.RescueStationProfiles(RescueStationID),
    CONSTRAINT FK_PetOwnershipHistory_RecordedBy FOREIGN KEY (RecordedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_PetOwnershipHistory_PreviousOwner CHECK (
        (PreviousOwnerType IS NULL AND PreviousCustomerID IS NULL AND PreviousRescueStationID IS NULL)
        OR (PreviousOwnerType = N'Customer' AND PreviousCustomerID IS NOT NULL AND PreviousRescueStationID IS NULL)
        OR (PreviousOwnerType = N'RescueStation' AND PreviousRescueStationID IS NOT NULL AND PreviousCustomerID IS NULL)
    ),
    CONSTRAINT CK_PetOwnershipHistory_NewOwner CHECK (
        (NewOwnerType = N'Customer' AND NewCustomerID IS NOT NULL AND NewRescueStationID IS NULL)
        OR (NewOwnerType = N'RescueStation' AND NewRescueStationID IS NOT NULL AND NewCustomerID IS NULL)
    )
);

CREATE INDEX IX_Pets_CustomerID ON dbo.Pets(CustomerID);
CREATE INDEX IX_Pets_RescueStationID ON dbo.Pets(RescueStationID);
CREATE UNIQUE INDEX UX_Pets_MicrochipNumber ON dbo.Pets(MicrochipNumber) WHERE MicrochipNumber IS NOT NULL;
CREATE INDEX IX_PetImages_PetID ON dbo.PetImages(PetID);
CREATE UNIQUE INDEX UX_PetImages_PrimaryPerPet ON dbo.PetImages(PetID) WHERE IsPrimary = 1;
CREATE INDEX IX_PetOwnershipHistory_PetID_TransferredAt ON dbo.PetOwnershipHistory(PetID, TransferredAt DESC);
GO

/* =========================================================
   PHÂN HỆ 3 - HỒ SƠ Y TẾ
   ========================================================= */

CREATE TABLE dbo.Diagnoses (
    DiagnosisID INT IDENTITY(1,1) PRIMARY KEY,
    DiagnosisName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    SeverityLevel NVARCHAR(30) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Diagnoses_IsActive DEFAULT 1,
    CONSTRAINT CK_Diagnoses_Severity CHECK (SeverityLevel IS NULL OR SeverityLevel IN (N'Mild', N'Moderate', N'Severe', N'Critical'))
);

CREATE TABLE dbo.MedicalRecords (
    MedicalRecordID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PetID BIGINT NOT NULL,
    AppointmentID BIGINT NULL,
    DoctorEmployeeID BIGINT NOT NULL,
    RecordDate DATETIME2(0) NOT NULL CONSTRAINT DF_MedicalRecords_RecordDate DEFAULT SYSDATETIME(),
    Symptoms NVARCHAR(MAX) NULL,
    ExaminationNotes NVARCHAR(MAX) NULL,
    TreatmentPlan NVARCHAR(MAX) NULL,
    SeverityClass NVARCHAR(10) NULL,
    FollowUpDate DATE NULL,
    RecordStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_MedicalRecords_RecordStatus DEFAULT N'Completed',
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_MedicalRecords_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_MedicalRecords_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID),
    CONSTRAINT FK_MedicalRecords_Doctor FOREIGN KEY (DoctorEmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT CK_MedicalRecords_Status CHECK (RecordStatus IN (N'Draft', N'Completed', N'Amended')),
    CONSTRAINT CK_MedicalRecords_SeverityClass CHECK (SeverityClass IS NULL OR SeverityClass IN (N'Mild', N'Severe'))
);

CREATE TABLE dbo.MedicalRecordHistory (
    MedicalRecordHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    MedicalRecordID BIGINT NOT NULL,
    EditedByUserID BIGINT NOT NULL,
    ChangeSummary NVARCHAR(1000) NOT NULL,
    OldValues NVARCHAR(MAX) NULL,
    NewValues NVARCHAR(MAX) NULL,
    EditedAt DATETIME2(0) NOT NULL CONSTRAINT DF_MedicalRecordHistory_EditedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_MedicalRecordHistory_MedicalRecords FOREIGN KEY (MedicalRecordID) REFERENCES dbo.MedicalRecords(MedicalRecordID),
    CONSTRAINT FK_MedicalRecordHistory_Users FOREIGN KEY (EditedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.MedicalRecordAttachments (
    AttachmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    MedicalRecordID BIGINT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileUrl NVARCHAR(1000) NOT NULL,
    FileType NVARCHAR(100) NULL,
    UploadedAt DATETIME2(0) NOT NULL CONSTRAINT DF_MedicalRecordAttachments_UploadedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_MedicalRecordAttachments_MedicalRecords FOREIGN KEY (MedicalRecordID) REFERENCES dbo.MedicalRecords(MedicalRecordID)
);

CREATE TABLE dbo.MedicalRecordDiagnoses (
    MedicalRecordID BIGINT NOT NULL,
    DiagnosisID INT NOT NULL,
    DiagnosisNotes NVARCHAR(1000) NULL,
    CONSTRAINT PK_MedicalRecordDiagnoses PRIMARY KEY (MedicalRecordID, DiagnosisID),
    CONSTRAINT FK_MedicalRecordDiagnoses_MedicalRecords FOREIGN KEY (MedicalRecordID) REFERENCES dbo.MedicalRecords(MedicalRecordID),
    CONSTRAINT FK_MedicalRecordDiagnoses_Diagnoses FOREIGN KEY (DiagnosisID) REFERENCES dbo.Diagnoses(DiagnosisID)
);

CREATE TABLE dbo.VaccinationRecords (
    VaccinationRecordID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PetID BIGINT NOT NULL,
    MedicalRecordID BIGINT NULL,
    VaccineName NVARCHAR(200) NOT NULL,
    VaccinatedAt DATE NOT NULL,
    NextDueDate DATE NULL,
    BatchNumber NVARCHAR(100) NULL,
    Notes NVARCHAR(1000) NULL,
    CONSTRAINT FK_VaccinationRecords_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID),
    CONSTRAINT FK_VaccinationRecords_MedicalRecords FOREIGN KEY (MedicalRecordID) REFERENCES dbo.MedicalRecords(MedicalRecordID)
);

CREATE TABLE dbo.DewormingRecords (
    DewormingRecordID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PetID BIGINT NOT NULL,
    MedicalRecordID BIGINT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    DewormedAt DATE NOT NULL,
    NextDueDate DATE NULL,
    Dosage NVARCHAR(100) NULL,
    Notes NVARCHAR(1000) NULL,
    CONSTRAINT FK_DewormingRecords_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID),
    CONSTRAINT FK_DewormingRecords_MedicalRecords FOREIGN KEY (MedicalRecordID) REFERENCES dbo.MedicalRecords(MedicalRecordID)
);

CREATE INDEX IX_MedicalRecords_PetID_RecordDate ON dbo.MedicalRecords(PetID, RecordDate DESC);
CREATE INDEX IX_MedicalRecords_DoctorEmployeeID ON dbo.MedicalRecords(DoctorEmployeeID);
CREATE INDEX IX_MedicalRecordAttachments_MedicalRecordID ON dbo.MedicalRecordAttachments(MedicalRecordID);
CREATE INDEX IX_VaccinationRecords_PetID_VaccinatedAt ON dbo.VaccinationRecords(PetID, VaccinatedAt DESC);
CREATE INDEX IX_DewormingRecords_PetID_DewormedAt ON dbo.DewormingRecords(PetID, DewormedAt DESC);
GO

/* =========================================================
   PHÂN HỆ 4 - DỊCH VỤ VÀ LỊCH HẸN
   ========================================================= */

CREATE TABLE dbo.ServiceCategories (
    ServiceCategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(150) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ServiceCategories_IsActive DEFAULT 1
);

CREATE TABLE dbo.Services (
    ServiceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ServiceCategoryID INT NOT NULL,
    ServiceName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NULL,
    BasePrice DECIMAL(18,2) NOT NULL,
    EstimatedDurationMinutes INT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Services_IsActive DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Services_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Services_ServiceCategories FOREIGN KEY (ServiceCategoryID) REFERENCES dbo.ServiceCategories(ServiceCategoryID),
    CONSTRAINT CK_Services_BasePrice CHECK (BasePrice >= 0),
    CONSTRAINT CK_Services_Duration CHECK (EstimatedDurationMinutes IS NULL OR EstimatedDurationMinutes > 0)
);

CREATE TABLE dbo.ServicePaymentMethods (
    ServicePaymentMethodID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ServiceID BIGINT NOT NULL,
    PaymentMethodID INT NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ServicePaymentMethods_IsActive DEFAULT 1,
    CONSTRAINT FK_ServicePaymentMethods_Services FOREIGN KEY (ServiceID) REFERENCES dbo.Services(ServiceID),
    CONSTRAINT UQ_ServicePaymentMethods_Service_Method UNIQUE (ServiceID, PaymentMethodID)
);

CREATE TABLE dbo.EmployeeServices (
    EmployeeServiceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    ServiceID BIGINT NOT NULL,
    AssignedByUserID BIGINT NOT NULL,
    AssignedAt DATETIME2(0) NOT NULL CONSTRAINT DF_EmployeeServices_AssignedAt DEFAULT SYSDATETIME(),
    IsActive BIT NOT NULL CONSTRAINT DF_EmployeeServices_IsActive DEFAULT 1,
    CONSTRAINT FK_EmployeeServices_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_EmployeeServices_Services FOREIGN KEY (ServiceID) REFERENCES dbo.Services(ServiceID),
    CONSTRAINT FK_EmployeeServices_AssignedBy FOREIGN KEY (AssignedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT UQ_EmployeeServices_Employee_Service UNIQUE (EmployeeID, ServiceID)
);

CREATE TABLE dbo.Appointments (
    AppointmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerID BIGINT NOT NULL,
    PetID BIGINT NOT NULL,
    AppointmentCode NVARCHAR(50) NOT NULL UNIQUE,
    AppointmentAt DATETIME2(0) NOT NULL,
    AppointmentEndAt DATETIME2(0) NULL,
    AppointmentStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Appointments_Status DEFAULT N'Pending',
    PaymentTiming NVARCHAR(10) NOT NULL CONSTRAINT DF_Appointments_PaymentTiming DEFAULT N'Postpaid',
    PaymentStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_Appointments_PaymentStatus DEFAULT N'Postpaid_Pending',
    PaymentExpiresAt DATETIME2(0) NULL,
    TotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Appointments_TotalAmount DEFAULT 0,
    CancelledAt DATETIME2(0) NULL,
    CustomerNote NVARCHAR(1000) NULL,
    InternalNote NVARCHAR(1000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Appointments_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Appointments_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_Appointments_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID),
    CONSTRAINT CK_Appointments_Status CHECK (AppointmentStatus IN (N'Pending', N'Confirmed', N'InProgress', N'Completed', N'Cancelled', N'Rejected', N'NoShow')),
    CONSTRAINT CK_Appointments_Payment CHECK (
        (PaymentTiming = N'Prepaid'  AND PaymentStatus IN (N'Prepaid_Pending', N'Prepaid_Paid', N'Refunded'))
        OR (PaymentTiming = N'Postpaid' AND PaymentStatus IN (N'Postpaid_Pending', N'Paid'))
    ),
    CONSTRAINT CK_Appointments_TotalAmount CHECK (TotalAmount >= 0),
    CONSTRAINT CK_Appointments_EndAfterStart CHECK (AppointmentEndAt IS NULL OR AppointmentEndAt > AppointmentAt)
);

ALTER TABLE dbo.MedicalRecords
ADD CONSTRAINT FK_MedicalRecords_Appointments FOREIGN KEY (AppointmentID) REFERENCES dbo.Appointments(AppointmentID);

CREATE TABLE dbo.AppointmentServices (
    AppointmentServiceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AppointmentID BIGINT NOT NULL,
    ServiceID BIGINT NOT NULL,
    Quantity INT NOT NULL CONSTRAINT DF_AppointmentServices_Quantity DEFAULT 1,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Notes NVARCHAR(1000) NULL,
    CONSTRAINT FK_AppointmentServices_Appointments FOREIGN KEY (AppointmentID) REFERENCES dbo.Appointments(AppointmentID),
    CONSTRAINT FK_AppointmentServices_Services FOREIGN KEY (ServiceID) REFERENCES dbo.Services(ServiceID),
    CONSTRAINT CK_AppointmentServices_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_AppointmentServices_UnitPrice CHECK (UnitPrice >= 0)
);

CREATE TABLE dbo.AppointmentAssignments (
    AssignmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AppointmentID BIGINT NOT NULL,
    EmployeeID BIGINT NOT NULL,
    AssignedByUserID BIGINT NOT NULL,
    AssignmentRole NVARCHAR(30) NOT NULL,
    AssignedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AppointmentAssignments_AssignedAt DEFAULT SYSDATETIME(),
    AssignmentNote NVARCHAR(500) NULL,
    CONSTRAINT FK_AppointmentAssignments_Appointments FOREIGN KEY (AppointmentID) REFERENCES dbo.Appointments(AppointmentID),
    CONSTRAINT FK_AppointmentAssignments_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_AppointmentAssignments_AssignedBy FOREIGN KEY (AssignedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_AppointmentAssignments_Role CHECK (AssignmentRole IN (N'Doctor', N'CareStaff')),
    CONSTRAINT UQ_AppointmentAssignments UNIQUE (AppointmentID, EmployeeID, AssignmentRole)
);

CREATE TABLE dbo.AppointmentStatusHistory (
    AppointmentStatusHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AppointmentID BIGINT NOT NULL,
    OldStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    ChangedByUserID BIGINT NULL,
    ChangeReason NVARCHAR(1000) NULL,
    ChangedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AppointmentStatusHistory_ChangedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AppointmentStatusHistory_Appointments FOREIGN KEY (AppointmentID) REFERENCES dbo.Appointments(AppointmentID),
    CONSTRAINT FK_AppointmentStatusHistory_Users FOREIGN KEY (ChangedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.AppointmentChangeRequests (
    AppointmentChangeRequestID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AppointmentID BIGINT NOT NULL,
    RequestedByUserID BIGINT NOT NULL,
    RequestType NVARCHAR(30) NOT NULL,
    RequestedAppointmentAt DATETIME2(0) NULL,
    RequestReason NVARCHAR(1000) NULL,
    RequestStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_AppointmentChangeRequests_Status DEFAULT N'Pending',
    ReviewedByUserID BIGINT NULL,
    ReviewedAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AppointmentChangeRequests_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AppointmentChangeRequests_Appointments FOREIGN KEY (AppointmentID) REFERENCES dbo.Appointments(AppointmentID),
    CONSTRAINT FK_AppointmentChangeRequests_RequestedBy FOREIGN KEY (RequestedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_AppointmentChangeRequests_ReviewedBy FOREIGN KEY (ReviewedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_AppointmentChangeRequests_Type CHECK (RequestType IN (N'Reschedule', N'Cancel')),
    CONSTRAINT CK_AppointmentChangeRequests_Status CHECK (RequestStatus IN (N'Pending', N'Approved', N'Rejected')),
    CONSTRAINT CK_AppointmentChangeRequests_RescheduleTime CHECK (RequestType <> N'Reschedule' OR RequestedAppointmentAt IS NOT NULL)
);

CREATE TABLE dbo.ServiceExecutionRecords (
    ServiceExecutionRecordID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AppointmentServiceID BIGINT NOT NULL,
    StartedAt DATETIME2(0) NULL,
    CompletedAt DATETIME2(0) NULL,
    ExecutionStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_ServiceExecutionRecords_Status DEFAULT N'Pending',
    Summary NVARCHAR(2000) NULL,
    ResultConfirmedByUserID BIGINT NULL,
    ResultConfirmedAt DATETIME2(0) NULL,
    CONSTRAINT FK_ServiceExecutionRecords_AppointmentServices FOREIGN KEY (AppointmentServiceID) REFERENCES dbo.AppointmentServices(AppointmentServiceID),
    CONSTRAINT FK_ServiceExecutionRecords_ResultConfirmedBy FOREIGN KEY (ResultConfirmedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_ServiceExecutionRecords_Status CHECK (ExecutionStatus IN (N'Pending', N'InProgress', N'Completed', N'Skipped')),
    CONSTRAINT CK_ServiceExecutionRecords_ResultConfirmation CHECK (
        (ResultConfirmedByUserID IS NULL AND ResultConfirmedAt IS NULL)
        OR (ResultConfirmedByUserID IS NOT NULL AND ResultConfirmedAt IS NOT NULL)
    )
);

CREATE TABLE dbo.ServiceExecutionSteps (
    ServiceExecutionStepID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ServiceID BIGINT NOT NULL,
    StepName NVARCHAR(200) NOT NULL,
    StepDescription NVARCHAR(1000) NULL,
    StepOrder INT NOT NULL,
    IsRequired BIT NOT NULL CONSTRAINT DF_ServiceExecutionSteps_IsRequired DEFAULT 1,
    CONSTRAINT FK_ServiceExecutionSteps_Services FOREIGN KEY (ServiceID) REFERENCES dbo.Services(ServiceID),
    CONSTRAINT UQ_ServiceExecutionSteps_Service_Order UNIQUE (ServiceID, StepOrder)
);

CREATE TABLE dbo.ServiceStepUpdates (
    ServiceStepUpdateID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ServiceExecutionRecordID BIGINT NOT NULL,
    ServiceExecutionStepID BIGINT NOT NULL,
    UpdatedByEmployeeID BIGINT NOT NULL,
    StepStatus NVARCHAR(30) NOT NULL,
    Notes NVARCHAR(1000) NULL,
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ServiceStepUpdates_UpdatedAt DEFAULT SYSDATETIME(),
    ConfirmedByUserID BIGINT NULL,
    ConfirmedAt DATETIME2(0) NULL,
    CONSTRAINT FK_ServiceStepUpdates_ExecutionRecords FOREIGN KEY (ServiceExecutionRecordID) REFERENCES dbo.ServiceExecutionRecords(ServiceExecutionRecordID),
    CONSTRAINT FK_ServiceStepUpdates_ExecutionSteps FOREIGN KEY (ServiceExecutionStepID) REFERENCES dbo.ServiceExecutionSteps(ServiceExecutionStepID),
    CONSTRAINT FK_ServiceStepUpdates_Employees FOREIGN KEY (UpdatedByEmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_ServiceStepUpdates_ConfirmedBy FOREIGN KEY (ConfirmedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_ServiceStepUpdates_Status CHECK (StepStatus IN (N'Pending', N'InProgress', N'Completed', N'Skipped')),
    CONSTRAINT CK_ServiceStepUpdates_Confirmation CHECK (
        (ConfirmedByUserID IS NULL AND ConfirmedAt IS NULL)
        OR (ConfirmedByUserID IS NOT NULL AND ConfirmedAt IS NOT NULL)
    )
);

CREATE TABLE dbo.ServiceSchedules (
    ServiceScheduleID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ServiceID BIGINT NOT NULL,
    DayOfWeek TINYINT NOT NULL,
    StartTime TIME(0) NOT NULL,
    EndTime TIME(0) NOT NULL,
    IsAvailable BIT NOT NULL CONSTRAINT DF_ServiceSchedules_IsAvailable DEFAULT 1,
    CONSTRAINT FK_ServiceSchedules_Services FOREIGN KEY (ServiceID) REFERENCES dbo.Services(ServiceID),
    CONSTRAINT CK_ServiceSchedules_DayOfWeek CHECK (DayOfWeek BETWEEN 1 AND 7),
    CONSTRAINT CK_ServiceSchedules_Time CHECK (EndTime > StartTime)
);

CREATE INDEX IX_EmployeeServices_ServiceID ON dbo.EmployeeServices(ServiceID) WHERE IsActive = 1;
CREATE INDEX IX_Appointments_CustomerID_AppointmentAt ON dbo.Appointments(CustomerID, AppointmentAt);
CREATE INDEX IX_Appointments_PetID ON dbo.Appointments(PetID);
CREATE INDEX IX_Appointments_Pet_Time ON dbo.Appointments(PetID, AppointmentAt, AppointmentEndAt) INCLUDE (AppointmentStatus, PaymentTiming, PaymentStatus, PaymentExpiresAt);
CREATE INDEX IX_Appointments_Status_PaymentExpiry ON dbo.Appointments(AppointmentStatus, PaymentTiming, PaymentStatus, PaymentExpiresAt) WHERE AppointmentStatus = N'Pending' AND PaymentTiming = N'Prepaid' AND PaymentStatus = N'Prepaid_Pending';
CREATE INDEX IX_AppointmentAssignments_EmployeeID ON dbo.AppointmentAssignments(EmployeeID);
GO

/* =========================================================
   PHÂN HỆ 5 - NHÂN SỰ, CA LÀM VÀ NGHỈ PHÉP
   ========================================================= */

CREATE TABLE dbo.WorkShifts (
    WorkShiftID INT IDENTITY(1,1) PRIMARY KEY,
    ShiftName NVARCHAR(100) NOT NULL,
    StartTime TIME(0) NOT NULL,
    EndTime TIME(0) NOT NULL,
    BreakMinutes INT NOT NULL CONSTRAINT DF_WorkShifts_BreakMinutes DEFAULT 0,
    IsOvernight BIT NOT NULL CONSTRAINT DF_WorkShifts_IsOvernight DEFAULT 0,
    IsActive BIT NOT NULL CONSTRAINT DF_WorkShifts_IsActive DEFAULT 1,
    CONSTRAINT CK_WorkShifts_Time CHECK (
        (IsOvernight = 0 AND EndTime > StartTime)
        OR (IsOvernight = 1 AND EndTime < StartTime)
    ),
    CONSTRAINT CK_WorkShifts_Break CHECK (BreakMinutes >= 0)
);

CREATE TABLE dbo.EmployeeWorkSchedules (
    EmployeeWorkScheduleID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    WorkShiftID INT NOT NULL,
    WorkDate DATE NOT NULL,
    ScheduleStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_EmployeeWorkSchedules_Status DEFAULT N'Scheduled',
    CreatedByUserID BIGINT NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_EmployeeWorkSchedules_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_EmployeeWorkSchedules_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_EmployeeWorkSchedules_WorkShifts FOREIGN KEY (WorkShiftID) REFERENCES dbo.WorkShifts(WorkShiftID),
    CONSTRAINT FK_EmployeeWorkSchedules_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_EmployeeWorkSchedules_Status CHECK (ScheduleStatus IN (N'Scheduled', N'Confirmed', N'Cancelled')),
    CONSTRAINT UQ_EmployeeWorkSchedules UNIQUE (EmployeeID, WorkShiftID, WorkDate)
);

CREATE TABLE dbo.LeaveRequests (
    LeaveRequestID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    LeaveType NVARCHAR(30) NOT NULL,
    RequestReason NVARCHAR(1000) NULL,
    RequestStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_LeaveRequests_Status DEFAULT N'Pending',
    SubmittedAt DATETIME2(0) NOT NULL CONSTRAINT DF_LeaveRequests_SubmittedAt DEFAULT SYSDATETIME(),
    CreatedByUserID BIGINT NULL,
    ReviewedByUserID BIGINT NULL,
    ReviewedAt DATETIME2(0) NULL,
    ReviewNote NVARCHAR(1000) NULL,
    ExceedsMonthlyLimitWarning BIT NOT NULL CONSTRAINT DF_LeaveRequests_ExceedsLimit DEFAULT 0,
    CONSTRAINT FK_LeaveRequests_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_LeaveRequests_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_LeaveRequests_ReviewedBy FOREIGN KEY (ReviewedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_LeaveRequests_Type CHECK (LeaveType IN (N'Annual', N'Sick', N'Unpaid', N'Other')),
    CONSTRAINT CK_LeaveRequests_Status CHECK (RequestStatus IN (N'Pending', N'Approved', N'Rejected', N'Cancelled'))
);

CREATE TABLE dbo.RotationalLeaveSchedules (
    RotationalLeaveScheduleID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    LeaveDate DATE NOT NULL,
    WorkShiftID INT NULL,
    LeaveRequestID BIGINT NULL,
    ScheduledByUserID BIGINT NOT NULL,
    ScheduleStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_RotationalLeaveSchedules_Status DEFAULT N'Scheduled',
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_RotationalLeaveSchedules_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_RotationalLeaveSchedules_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_RotationalLeaveSchedules_WorkShifts FOREIGN KEY (WorkShiftID) REFERENCES dbo.WorkShifts(WorkShiftID),
    CONSTRAINT FK_RotationalLeaveSchedules_LeaveRequests FOREIGN KEY (LeaveRequestID) REFERENCES dbo.LeaveRequests(LeaveRequestID),
    CONSTRAINT FK_RotationalLeaveSchedules_ScheduledBy FOREIGN KEY (ScheduledByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_RotationalLeaveSchedules_Status CHECK (ScheduleStatus IN (N'Scheduled', N'Changed', N'Cancelled'))
);

CREATE TABLE dbo.LeaveRequestDays (
    LeaveRequestDayID BIGINT IDENTITY(1,1) PRIMARY KEY,
    LeaveRequestID BIGINT NOT NULL,
    LeaveDate DATE NOT NULL,
    WorkShiftID INT NULL,
    LeaveUnits DECIMAL(4,2) NOT NULL CONSTRAINT DF_LeaveRequestDays_LeaveUnits DEFAULT 1,
    IsOverQuota BIT NOT NULL CONSTRAINT DF_LeaveRequestDays_IsOverQuota DEFAULT 0,
    CONSTRAINT FK_LeaveRequestDays_LeaveRequests FOREIGN KEY (LeaveRequestID) REFERENCES dbo.LeaveRequests(LeaveRequestID),
    CONSTRAINT FK_LeaveRequestDays_WorkShifts FOREIGN KEY (WorkShiftID) REFERENCES dbo.WorkShifts(WorkShiftID),
    CONSTRAINT CK_LeaveRequestDays_Units CHECK (LeaveUnits > 0 AND LeaveUnits <= 1),
    CONSTRAINT CK_LeaveRequestDays_FullDay CHECK (LeaveUnits = 1),
    CONSTRAINT UQ_LeaveRequestDays UNIQUE (LeaveRequestID, LeaveDate, WorkShiftID)
);

CREATE TABLE dbo.LeaveApprovalHistory (
    LeaveApprovalHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    LeaveRequestID BIGINT NOT NULL,
    ActionByUserID BIGINT NOT NULL,
    OldStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    ActionNote NVARCHAR(1000) NULL,
    ActionAt DATETIME2(0) NOT NULL CONSTRAINT DF_LeaveApprovalHistory_ActionAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_LeaveApprovalHistory_LeaveRequests FOREIGN KEY (LeaveRequestID) REFERENCES dbo.LeaveRequests(LeaveRequestID),
    CONSTRAINT FK_LeaveApprovalHistory_Users FOREIGN KEY (ActionByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.ExtraShiftRequests (
    ExtraShiftRequestID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    WorkShiftID INT NOT NULL,
    WorkDate DATE NOT NULL,
    RequestReason NVARCHAR(1000) NULL,
    RequestStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_ExtraShiftRequests_Status DEFAULT N'Pending',
    ReviewedByUserID BIGINT NULL,
    ReviewedAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ExtraShiftRequests_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ExtraShiftRequests_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_ExtraShiftRequests_WorkShifts FOREIGN KEY (WorkShiftID) REFERENCES dbo.WorkShifts(WorkShiftID),
    CONSTRAINT FK_ExtraShiftRequests_ReviewedBy FOREIGN KEY (ReviewedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_ExtraShiftRequests_Status CHECK (RequestStatus IN (N'Pending', N'Approved', N'Rejected', N'Cancelled'))
);

CREATE TABLE dbo.AttendanceRecords (
    AttendanceRecordID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeWorkScheduleID BIGINT NOT NULL,
    CheckInAt DATETIME2(0) NULL,
    CheckOutAt DATETIME2(0) NULL,
    AttendanceStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_AttendanceRecords_Status DEFAULT N'Present',
    Notes NVARCHAR(500) NULL,
    CONSTRAINT FK_AttendanceRecords_Schedules FOREIGN KEY (EmployeeWorkScheduleID) REFERENCES dbo.EmployeeWorkSchedules(EmployeeWorkScheduleID),
    CONSTRAINT UQ_AttendanceRecords_Schedule UNIQUE (EmployeeWorkScheduleID),
    CONSTRAINT CK_AttendanceRecords_Status CHECK (AttendanceStatus IN (N'Present', N'Late', N'Absent', N'Leave', N'HalfDay')),
    CONSTRAINT CK_AttendanceRecords_Time CHECK (CheckOutAt IS NULL OR CheckInAt IS NULL OR CheckOutAt >= CheckInAt)
);

CREATE TABLE dbo.EmployeeMonthlyLeaveBalances (
    EmployeeMonthlyLeaveBalanceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    BalanceYear SMALLINT NOT NULL,
    BalanceMonth TINYINT NOT NULL,
    AllowedLeaveUnits DECIMAL(5,2) NOT NULL CONSTRAINT DF_EmployeeMonthlyLeaveBalances_Allowed DEFAULT 4,
    UsedLeaveUnits DECIMAL(5,2) NOT NULL CONSTRAINT DF_EmployeeMonthlyLeaveBalances_Used DEFAULT 0,
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_EmployeeMonthlyLeaveBalances_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_EmployeeMonthlyLeaveBalances_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT UQ_EmployeeMonthlyLeaveBalances UNIQUE (EmployeeID, BalanceYear, BalanceMonth),
    CONSTRAINT CK_EmployeeMonthlyLeaveBalances_Month CHECK (BalanceMonth BETWEEN 1 AND 12),
    CONSTRAINT CK_EmployeeMonthlyLeaveBalances_Units CHECK (AllowedLeaveUnits >= 0 AND UsedLeaveUnits >= 0)
);

CREATE INDEX IX_EmployeeWorkSchedules_EmployeeID_WorkDate ON dbo.EmployeeWorkSchedules(EmployeeID, WorkDate);
CREATE INDEX IX_LeaveRequests_EmployeeID_SubmittedAt ON dbo.LeaveRequests(EmployeeID, SubmittedAt DESC);
CREATE INDEX IX_LeaveRequestDays_LeaveDate ON dbo.LeaveRequestDays(LeaveDate) INCLUDE (LeaveRequestID, IsOverQuota);
CREATE UNIQUE INDEX UX_RotationalLeaveSchedules_Scheduled ON dbo.RotationalLeaveSchedules(EmployeeID, LeaveDate, WorkShiftID) WHERE ScheduleStatus = N'Scheduled';
CREATE INDEX IX_RotationalLeaveSchedules_LeaveRequestID ON dbo.RotationalLeaveSchedules(LeaveRequestID) WHERE LeaveRequestID IS NOT NULL;
CREATE UNIQUE INDEX UX_ExtraShiftRequests_Live ON dbo.ExtraShiftRequests(EmployeeID, WorkShiftID, WorkDate) WHERE RequestStatus IN (N'Pending', N'Approved');
GO

/* =========================================================
   PHÂN HỆ 6 - CỬA HÀNG, KHO, MUA HÀNG VÀ THANH TOÁN
   ========================================================= */

CREATE TABLE dbo.ProductCategories (
    ProductCategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(150) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ProductCategories_IsActive DEFAULT 1
);

CREATE TABLE dbo.Products (
    ProductID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductCategoryID INT NOT NULL,
    ProductName NVARCHAR(250) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    BrandName NVARCHAR(150) NULL,
    IsPrescriptionOnly BIT NOT NULL CONSTRAINT DF_Products_IsPrescriptionOnly DEFAULT 0,
    ProductStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Products_Status DEFAULT N'Active',
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Products_ProductCategories FOREIGN KEY (ProductCategoryID) REFERENCES dbo.ProductCategories(ProductCategoryID),
    CONSTRAINT CK_Products_Status CHECK (ProductStatus IN (N'Active', N'Inactive', N'Discontinued'))
);

CREATE TABLE dbo.ProductVariants (
    ProductVariantID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductID BIGINT NOT NULL,
    SKU NVARCHAR(100) NOT NULL UNIQUE,
    VariantName NVARCHAR(200) NOT NULL,
    VariantAttributes NVARCHAR(1000) NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    CostPrice DECIMAL(18,2) NULL,
    StockQuantity INT NOT NULL CONSTRAINT DF_ProductVariants_Stock DEFAULT 0,
    ReservedQuantity INT NOT NULL CONSTRAINT DF_ProductVariants_ReservedQuantity DEFAULT 0,
    ReorderLevel INT NOT NULL CONSTRAINT DF_ProductVariants_ReorderLevel DEFAULT 0,
    IsBatchTracked BIT NOT NULL CONSTRAINT DF_ProductVariants_IsBatchTracked DEFAULT 0,
    IsActive BIT NOT NULL CONSTRAINT DF_ProductVariants_IsActive DEFAULT 1,
    CONSTRAINT FK_ProductVariants_Products FOREIGN KEY (ProductID) REFERENCES dbo.Products(ProductID),
    CONSTRAINT CK_ProductVariants_Price CHECK (UnitPrice >= 0 AND (CostPrice IS NULL OR CostPrice >= 0)),
    CONSTRAINT CK_ProductVariants_Stock CHECK (StockQuantity >= 0 AND ReorderLevel >= 0),
    CONSTRAINT CK_ProductVariants_Reserved CHECK (ReservedQuantity >= 0 AND ReservedQuantity <= StockQuantity)
);

CREATE TABLE dbo.ProductImages (
    ProductImageID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductID BIGINT NOT NULL,
    ProductVariantID BIGINT NULL,
    ImageUrl NVARCHAR(1000) NOT NULL,
    IsPrimary BIT NOT NULL CONSTRAINT DF_ProductImages_IsPrimary DEFAULT 0,
    UploadedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ProductImages_UploadedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductID) REFERENCES dbo.Products(ProductID),
    CONSTRAINT FK_ProductImages_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID)
);

CREATE TABLE dbo.SupplierProducts (
    SupplierProductID BIGINT IDENTITY(1,1) PRIMARY KEY,
    SupplierID BIGINT NOT NULL,
    ProductVariantID BIGINT NOT NULL,
    SupplierSKU NVARCHAR(100) NULL,
    SupplierUnitPrice DECIMAL(18,2) NULL,
    IsPreferredSupplier BIT NOT NULL CONSTRAINT DF_SupplierProducts_IsPreferred DEFAULT 0,
    AvailabilityStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_SupplierProducts_AvailabilityStatus DEFAULT N'Available',
    AvailabilityUpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_SupplierProducts_Suppliers FOREIGN KEY (SupplierID) REFERENCES dbo.SupplierProfiles(SupplierID),
    CONSTRAINT FK_SupplierProducts_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT UQ_SupplierProducts UNIQUE (SupplierID, ProductVariantID),
    CONSTRAINT CK_SupplierProducts_Price CHECK (SupplierUnitPrice IS NULL OR SupplierUnitPrice >= 0),
    CONSTRAINT CK_SupplierProducts_AvailabilityStatus CHECK (AvailabilityStatus IN (N'Available', N'LimitedStock', N'OutOfStock', N'Discontinued'))
);

CREATE TABLE dbo.SupplierReconciliations (
    SupplierReconciliationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    SupplierID BIGINT NOT NULL,
    ReconciliationCode NVARCHAR(50) NOT NULL UNIQUE,
    PeriodStart DATE NOT NULL,
    PeriodEnd DATE NOT NULL,
    TotalPayableAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_SupplierReconciliations_Payable DEFAULT 0,
    TotalPaidAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_SupplierReconciliations_Paid DEFAULT 0,
    ReconciliationStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_SupplierReconciliations_Status DEFAULT N'Draft',
    CreatedByUserID BIGINT NOT NULL,
    SupplierConfirmedByUserID BIGINT NULL,
    SupplierConfirmedAt DATETIME2(0) NULL,
    DisputeNote NVARCHAR(1000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SupplierReconciliations_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_SupplierReconciliations_Suppliers FOREIGN KEY (SupplierID) REFERENCES dbo.SupplierProfiles(SupplierID),
    CONSTRAINT FK_SupplierReconciliations_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_SupplierReconciliations_ConfirmedBy FOREIGN KEY (SupplierConfirmedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_SupplierReconciliations_Period CHECK (PeriodEnd >= PeriodStart),
    CONSTRAINT CK_SupplierReconciliations_Amounts CHECK (TotalPayableAmount >= 0 AND TotalPaidAmount >= 0),
    CONSTRAINT CK_SupplierReconciliations_Status CHECK (ReconciliationStatus IN (N'Draft', N'SentToSupplier', N'Confirmed', N'Disputed', N'Settled')),
    CONSTRAINT CK_SupplierReconciliations_Confirmed CHECK (
        (SupplierConfirmedByUserID IS NULL AND SupplierConfirmedAt IS NULL)
        OR (SupplierConfirmedByUserID IS NOT NULL AND SupplierConfirmedAt IS NOT NULL)
    )
);

CREATE TABLE dbo.PurchaseOrders (
    PurchaseOrderID BIGINT IDENTITY(1,1) PRIMARY KEY,
    SupplierID BIGINT NOT NULL,
    PurchaseOrderCode NVARCHAR(50) NOT NULL UNIQUE,
    CreatedByUserID BIGINT NOT NULL,
    PurchaseOrderStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_PurchaseOrders_Status DEFAULT N'Draft',
    OrderedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PurchaseOrders_OrderedAt DEFAULT SYSDATETIME(),
    ExpectedDeliveryAt DATETIME2(0) NULL,
    TotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_PurchaseOrders_Total DEFAULT 0,
    Notes NVARCHAR(1000) NULL,
    SupplierRespondedAt DATETIME2(0) NULL,
    SupplierResponseNote NVARCHAR(1000) NULL,
    HasSupplierAdjustment BIT NOT NULL CONSTRAINT DF_PurchaseOrders_HasAdjustment DEFAULT 0,
    ShippedAt DATETIME2(0) NULL,
    DeliveryReference NVARCHAR(150) NULL,
    PaymentStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_PurchaseOrders_PaymentStatus DEFAULT N'Unpaid',
    PaymentDueDate DATE NULL,
    PayableAmount DECIMAL(18,2) NULL,
    SupplierReconciliationID BIGINT NULL,
    CONSTRAINT FK_PurchaseOrders_Suppliers FOREIGN KEY (SupplierID) REFERENCES dbo.SupplierProfiles(SupplierID),
    CONSTRAINT FK_PurchaseOrders_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_PurchaseOrders_SupplierReconciliations FOREIGN KEY (SupplierReconciliationID) REFERENCES dbo.SupplierReconciliations(SupplierReconciliationID),
    CONSTRAINT CK_PurchaseOrders_Status CHECK (PurchaseOrderStatus IN (
        N'Draft', N'Sent', N'Accepted', N'Rejected', N'Shipping', N'PartiallyReceived', N'Received', N'Cancelled')),
    CONSTRAINT CK_PurchaseOrders_Total CHECK (TotalAmount >= 0),
    CONSTRAINT CK_PurchaseOrders_PaymentStatus CHECK (PaymentStatus IN (N'Unpaid', N'PartiallyPaid', N'Paid', N'Disputed')),
    CONSTRAINT CK_PurchaseOrders_Payable CHECK (PayableAmount IS NULL OR PayableAmount >= 0)
);

CREATE TABLE dbo.PurchaseOrderDetails (
    PurchaseOrderDetailID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PurchaseOrderID BIGINT NOT NULL,
    ProductVariantID BIGINT NOT NULL,
    Quantity INT NOT NULL,
    ConfirmedQuantity INT NULL,
    UnitCost DECIMAL(18,2) NOT NULL,
    LineTotal DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_PurchaseOrderDetails_PurchaseOrders FOREIGN KEY (PurchaseOrderID) REFERENCES dbo.PurchaseOrders(PurchaseOrderID),
    CONSTRAINT FK_PurchaseOrderDetails_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT UQ_PurchaseOrderDetails_Order_Variant UNIQUE (PurchaseOrderID, ProductVariantID),
    CONSTRAINT CK_PurchaseOrderDetails_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_PurchaseOrderDetails_ConfirmedQuantity CHECK (ConfirmedQuantity IS NULL OR ConfirmedQuantity >= 0),
    CONSTRAINT CK_PurchaseOrderDetails_Cost CHECK (UnitCost >= 0 AND LineTotal >= 0),
    CONSTRAINT CK_PurchaseOrderDetails_LineTotal CHECK (LineTotal = Quantity * UnitCost)
);

CREATE TABLE dbo.PurchaseOrderStatusHistory (
    PurchaseOrderStatusHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PurchaseOrderID BIGINT NOT NULL,
    OldStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    ChangedByUserID BIGINT NOT NULL,
    ChangeNote NVARCHAR(1000) NULL,
    ChangedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PurchaseOrderStatusHistory_ChangedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PurchaseOrderStatusHistory_PurchaseOrders FOREIGN KEY (PurchaseOrderID) REFERENCES dbo.PurchaseOrders(PurchaseOrderID),
    CONSTRAINT FK_PurchaseOrderStatusHistory_Users FOREIGN KEY (ChangedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.SupplierPayments (
    SupplierPaymentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PurchaseOrderID BIGINT NOT NULL,
    PaymentCode NVARCHAR(100) NOT NULL UNIQUE,
    Amount DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(30) NOT NULL,
    PaidAt DATETIME2(0) NOT NULL,
    RecordedByUserID BIGINT NOT NULL,
    SupplierConfirmedAt DATETIME2(0) NULL,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SupplierPayments_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_SupplierPayments_PurchaseOrders FOREIGN KEY (PurchaseOrderID) REFERENCES dbo.PurchaseOrders(PurchaseOrderID),
    CONSTRAINT FK_SupplierPayments_RecordedBy FOREIGN KEY (RecordedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_SupplierPayments_Amount CHECK (Amount > 0),
    CONSTRAINT CK_SupplierPayments_Method CHECK (PaymentMethod IN (N'BankTransfer', N'Cash', N'Other'))
);

CREATE TABLE dbo.GoodsReceipts (
    GoodsReceiptID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PurchaseOrderID BIGINT NOT NULL,
    GoodsReceiptCode NVARCHAR(50) NOT NULL UNIQUE,
    ReceivedByUserID BIGINT NOT NULL,
    ReceivedAt DATETIME2(0) NOT NULL CONSTRAINT DF_GoodsReceipts_ReceivedAt DEFAULT SYSDATETIME(),
    ReceiptNote NVARCHAR(1000) NULL,
    CONSTRAINT FK_GoodsReceipts_PurchaseOrders FOREIGN KEY (PurchaseOrderID) REFERENCES dbo.PurchaseOrders(PurchaseOrderID),
    CONSTRAINT FK_GoodsReceipts_Users FOREIGN KEY (ReceivedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.GoodsReceiptDetails (
    GoodsReceiptDetailID BIGINT IDENTITY(1,1) PRIMARY KEY,
    GoodsReceiptID BIGINT NOT NULL,
    PurchaseOrderDetailID BIGINT NOT NULL,
    ReceivedQuantity INT NOT NULL,
    AcceptedQuantity INT NOT NULL,
    RejectedQuantity INT NOT NULL CONSTRAINT DF_GoodsReceiptDetails_Rejected DEFAULT 0,
    BatchNumber NVARCHAR(100) NULL,
    ManufacturedDate DATE NULL,
    ExpiryDate DATE NULL,
    Notes NVARCHAR(500) NULL,
    CONSTRAINT FK_GoodsReceiptDetails_GoodsReceipts FOREIGN KEY (GoodsReceiptID) REFERENCES dbo.GoodsReceipts(GoodsReceiptID),
    CONSTRAINT FK_GoodsReceiptDetails_PurchaseOrderDetails FOREIGN KEY (PurchaseOrderDetailID) REFERENCES dbo.PurchaseOrderDetails(PurchaseOrderDetailID),
    CONSTRAINT CK_GoodsReceiptDetails_Quantities CHECK (
        ReceivedQuantity >= 0 AND AcceptedQuantity >= 0 AND RejectedQuantity >= 0
        AND ReceivedQuantity = AcceptedQuantity + RejectedQuantity
    ),
    CONSTRAINT CK_GoodsReceiptDetails_Dates CHECK (ExpiryDate IS NULL OR ManufacturedDate IS NULL OR ExpiryDate >= ManufacturedDate)
);

CREATE TABLE dbo.InventoryBatches (
    InventoryBatchID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductVariantID BIGINT NOT NULL,
    GoodsReceiptDetailID BIGINT NULL,
    BatchNumber NVARCHAR(100) NOT NULL,
    ManufacturedDate DATE NULL,
    ExpiryDate DATE NULL,
    ReceivedQuantity INT NOT NULL,
    RemainingQuantity INT NOT NULL,
    UnitCost DECIMAL(18,2) NULL,
    BatchStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_InventoryBatches_Status DEFAULT N'Active',
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_InventoryBatches_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_InventoryBatches_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT FK_InventoryBatches_GoodsReceiptDetails FOREIGN KEY (GoodsReceiptDetailID) REFERENCES dbo.GoodsReceiptDetails(GoodsReceiptDetailID),
    CONSTRAINT CK_InventoryBatches_Quantity CHECK (ReceivedQuantity > 0 AND RemainingQuantity >= 0 AND RemainingQuantity <= ReceivedQuantity),
    CONSTRAINT CK_InventoryBatches_Dates CHECK (ExpiryDate IS NULL OR ManufacturedDate IS NULL OR ExpiryDate >= ManufacturedDate),
    CONSTRAINT CK_InventoryBatches_Cost CHECK (UnitCost IS NULL OR UnitCost >= 0),
    CONSTRAINT CK_InventoryBatches_Status CHECK (BatchStatus IN (N'Active', N'Quarantined', N'Expired', N'Depleted')),
    CONSTRAINT UQ_InventoryBatches_Variant_Batch UNIQUE (ProductVariantID, BatchNumber)
);

CREATE TABLE dbo.InventoryTransactions (
    InventoryTransactionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductVariantID BIGINT NOT NULL,
    InventoryBatchID BIGINT NULL,
    TransactionType NVARCHAR(30) NOT NULL,
    QuantityChange INT NOT NULL,
    ReferenceType NVARCHAR(50) NULL,
    ReferenceID BIGINT NULL,
    Notes NVARCHAR(1000) NULL,
    CreatedByUserID BIGINT NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_InventoryTransactions_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_InventoryTransactions_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT FK_InventoryTransactions_InventoryBatches FOREIGN KEY (InventoryBatchID) REFERENCES dbo.InventoryBatches(InventoryBatchID),
    CONSTRAINT FK_InventoryTransactions_Users FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_InventoryTransactions_Type CHECK (TransactionType IN (N'Import', N'Sale', N'Return', N'Adjustment', N'Damage')),
    CONSTRAINT CK_InventoryTransactions_Quantity CHECK (QuantityChange <> 0),
    CONSTRAINT CK_InventoryTransactions_Direction CHECK (
        (TransactionType IN (N'Import', N'Return') AND QuantityChange > 0)
        OR (TransactionType IN (N'Sale', N'Damage') AND QuantityChange < 0)
        OR TransactionType = N'Adjustment'
    )
);

CREATE TABLE dbo.DoctorMedicineStocks (
    DoctorMedicineStockID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    ProductVariantID BIGINT NOT NULL,
    QuantityOnHand INT NOT NULL CONSTRAINT DF_DoctorMedicineStocks_Quantity DEFAULT 0,
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DoctorMedicineStocks_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_DoctorMedicineStocks_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_DoctorMedicineStocks_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT UQ_DoctorMedicineStocks_Doctor_Variant UNIQUE (EmployeeID, ProductVariantID),
    CONSTRAINT CK_DoctorMedicineStocks_Quantity CHECK (QuantityOnHand >= 0)
);

CREATE TABLE dbo.DoctorMedicineAllocations (
    DoctorMedicineAllocationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    GoodsReceiptDetailID BIGINT NOT NULL,
    EmployeeID BIGINT NOT NULL,
    ProductVariantID BIGINT NOT NULL,
    AllocatedQuantity INT NOT NULL,
    AllocatedByUserID BIGINT NOT NULL,
    AllocatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DoctorMedicineAllocations_AllocatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_DoctorMedicineAllocations_ReceiptDetails FOREIGN KEY (GoodsReceiptDetailID) REFERENCES dbo.GoodsReceiptDetails(GoodsReceiptDetailID),
    CONSTRAINT FK_DoctorMedicineAllocations_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_DoctorMedicineAllocations_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT FK_DoctorMedicineAllocations_Users FOREIGN KEY (AllocatedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT UQ_DoctorMedicineAllocations_Receipt_Doctor UNIQUE (GoodsReceiptDetailID, EmployeeID),
    CONSTRAINT CK_DoctorMedicineAllocations_Quantity CHECK (AllocatedQuantity > 0)
);

CREATE TABLE dbo.DoctorMedicineUsageHistory (
    DoctorMedicineUsageID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID BIGINT NOT NULL,
    ProductVariantID BIGINT NOT NULL,
    QuantityUsed INT NOT NULL,
    ReferenceType NVARCHAR(50) NULL,
    ReferenceID BIGINT NULL,
    UsedByUserID BIGINT NOT NULL,
    UsedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DoctorMedicineUsageHistory_UsedAt DEFAULT SYSDATETIME(),
    Notes NVARCHAR(500) NULL,
    CONSTRAINT FK_DoctorMedicineUsageHistory_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_DoctorMedicineUsageHistory_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT FK_DoctorMedicineUsageHistory_Users FOREIGN KEY (UsedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_DoctorMedicineUsageHistory_Quantity CHECK (QuantityUsed > 0)
);

CREATE TABLE dbo.DrugImportProposals (
    DrugImportProposalID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProposalCode NVARCHAR(50) NOT NULL UNIQUE,
    ProposedByUserID BIGINT NOT NULL,
    DrugName NVARCHAR(250) NOT NULL,
    ActiveIngredient NVARCHAR(250) NULL,
    DosageForm NVARCHAR(150) NULL,
    ProposalReason NVARCHAR(2000) NOT NULL,
    SuggestedSupplierID BIGINT NULL,
    ProposalStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_DrugImportProposals_Status DEFAULT N'Pending',
    ReviewedByUserID BIGINT NULL,
    ReviewedAt DATETIME2(0) NULL,
    ReviewNote NVARCHAR(1000) NULL,
    ProductID BIGINT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DrugImportProposals_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_DrugImportProposals_ProposedBy FOREIGN KEY (ProposedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_DrugImportProposals_Suppliers FOREIGN KEY (SuggestedSupplierID) REFERENCES dbo.SupplierProfiles(SupplierID),
    CONSTRAINT FK_DrugImportProposals_ReviewedBy FOREIGN KEY (ReviewedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_DrugImportProposals_Products FOREIGN KEY (ProductID) REFERENCES dbo.Products(ProductID),
    CONSTRAINT CK_DrugImportProposals_Status CHECK (ProposalStatus IN (N'Pending', N'Approved', N'Rejected', N'Imported')),
    CONSTRAINT CK_DrugImportProposals_Reviewed CHECK (ProposalStatus = N'Pending' OR (ReviewedByUserID IS NOT NULL AND ReviewedAt IS NOT NULL)),
    CONSTRAINT CK_DrugImportProposals_Imported CHECK (ProposalStatus <> N'Imported' OR ProductID IS NOT NULL)
);

CREATE TABLE dbo.Vouchers (
    VoucherID BIGINT IDENTITY(1,1) PRIMARY KEY,
    VoucherCode NVARCHAR(50) NOT NULL UNIQUE,
    VoucherName NVARCHAR(150) NOT NULL,
    DiscountType NVARCHAR(20) NOT NULL,
    DiscountValue DECIMAL(18,2) NOT NULL,
    MaximumDiscountAmount DECIMAL(18,2) NULL,
    MinimumOrderAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Vouchers_MinOrder DEFAULT 0,
    StartAt DATETIME2(0) NOT NULL,
    EndAt DATETIME2(0) NOT NULL,
    UsageLimit INT NULL,
    UsedCount INT NOT NULL CONSTRAINT DF_Vouchers_UsedCount DEFAULT 0,
    IsActive BIT NOT NULL CONSTRAINT DF_Vouchers_IsActive DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Vouchers_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT CK_Vouchers_DiscountType CHECK (DiscountType IN (N'Percentage', N'FixedAmount')),
    CONSTRAINT CK_Vouchers_DiscountValue CHECK (DiscountValue > 0),
    CONSTRAINT CK_Vouchers_PercentageRange CHECK (DiscountType <> N'Percentage' OR DiscountValue <= 100),
    CONSTRAINT CK_Vouchers_MaxDiscount CHECK (MaximumDiscountAmount IS NULL OR MaximumDiscountAmount >= 0),
    CONSTRAINT CK_Vouchers_Dates CHECK (EndAt > StartAt),
    CONSTRAINT CK_Vouchers_Usage CHECK ((UsageLimit IS NULL OR UsageLimit >= 0) AND UsedCount >= 0),
    CONSTRAINT CK_Vouchers_UsageCap CHECK (UsageLimit IS NULL OR UsedCount <= UsageLimit),
    CONSTRAINT CK_Vouchers_Minimum CHECK (MinimumOrderAmount >= 0)
);

CREATE TABLE dbo.Orders (
    OrderID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerID BIGINT NOT NULL,
    OrderCode NVARCHAR(50) NOT NULL UNIQUE,
    VoucherID BIGINT NULL,
    ShippingAddress NVARCHAR(500) NOT NULL,
    RecipientName NVARCHAR(150) NOT NULL,
    RecipientPhoneNumber NVARCHAR(20) NOT NULL,
    SubtotalAmount DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_Discount DEFAULT 0,
    ShippingFee DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_ShippingFee DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    OrderStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Orders_Status DEFAULT N'Pending',
    CustomerNote NVARCHAR(1000) NULL,
    DeliveredAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Orders_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_Orders_Vouchers FOREIGN KEY (VoucherID) REFERENCES dbo.Vouchers(VoucherID),
    CONSTRAINT CK_Orders_Status CHECK (OrderStatus IN (
        N'Pending', N'Confirmed', N'Processing', N'Shipping', N'Delivered', N'Cancelled',
        N'ReturnRequested', N'PartiallyReturned', N'Returned')),
    CONSTRAINT CK_Orders_Amounts CHECK (SubtotalAmount >= 0 AND DiscountAmount >= 0 AND ShippingFee >= 0 AND TotalAmount >= 0),
    CONSTRAINT CK_Orders_TotalConsistency CHECK (DiscountAmount <= SubtotalAmount AND TotalAmount = SubtotalAmount - DiscountAmount + ShippingFee)
);

CREATE TABLE dbo.OrderItems (
    OrderItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderID BIGINT NOT NULL,
    ProductVariantID BIGINT NOT NULL,
    ProductNameSnapshot NVARCHAR(250) NOT NULL,
    VariantNameSnapshot NVARCHAR(200) NOT NULL,
    SKU NVARCHAR(100) NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    LineTotal DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID),
    CONSTRAINT FK_OrderItems_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT CK_OrderItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_OrderItems_Prices CHECK (UnitPrice >= 0 AND LineTotal >= 0),
    CONSTRAINT CK_OrderItems_LineTotal CHECK (LineTotal = Quantity * UnitPrice)
);

CREATE TABLE dbo.OrderStatusHistory (
    OrderStatusHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderID BIGINT NOT NULL,
    OldStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    ChangedByUserID BIGINT NULL,
    ChangeNote NVARCHAR(1000) NULL,
    ChangedAt DATETIME2(0) NOT NULL CONSTRAINT DF_OrderStatusHistory_ChangedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_OrderStatusHistory_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID),
    CONSTRAINT FK_OrderStatusHistory_Users FOREIGN KEY (ChangedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.VoucherUsageHistory (
    VoucherUsageHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    VoucherID BIGINT NOT NULL,
    CustomerID BIGINT NOT NULL,
    OrderID BIGINT NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL,
    UsageStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_VoucherUsageHistory_UsageStatus DEFAULT N'Used',
    UsedAt DATETIME2(0) NOT NULL CONSTRAINT DF_VoucherUsageHistory_UsedAt DEFAULT SYSDATETIME(),
    RevertedAt DATETIME2(0) NULL,
    CONSTRAINT FK_VoucherUsageHistory_Vouchers FOREIGN KEY (VoucherID) REFERENCES dbo.Vouchers(VoucherID),
    CONSTRAINT FK_VoucherUsageHistory_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_VoucherUsageHistory_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID),
    CONSTRAINT UQ_VoucherUsageHistory_Order UNIQUE (OrderID),
    CONSTRAINT CK_VoucherUsageHistory_Discount CHECK (DiscountAmount >= 0),
    CONSTRAINT CK_VoucherUsageHistory_Status CHECK (UsageStatus IN (N'Used', N'Reverted')),
    CONSTRAINT CK_VoucherUsageHistory_Reverted CHECK (
        (UsageStatus = N'Used' AND RevertedAt IS NULL)
        OR (UsageStatus = N'Reverted' AND RevertedAt IS NOT NULL)
    )
);

CREATE TABLE dbo.Carts (
    CartID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerID BIGINT NOT NULL,
    CartStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Carts_Status DEFAULT N'Active',
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Carts_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Carts_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT CK_Carts_Status CHECK (CartStatus IN (N'Active', N'Converted', N'Abandoned'))
);

CREATE TABLE dbo.Prescriptions (
    PrescriptionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    MedicalRecordID BIGINT NOT NULL,
    DoctorEmployeeID BIGINT NOT NULL,
    PrescriptionCode NVARCHAR(50) NOT NULL UNIQUE,
    PrescribedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Prescriptions_PrescribedAt DEFAULT SYSDATETIME(),
    SeverityClass NVARCHAR(10) NOT NULL CONSTRAINT DF_Prescriptions_SeverityClass DEFAULT N'Severe',
    PrescriptionStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_Prescriptions_PrescriptionStatus DEFAULT N'Active',
    PreviousPrescriptionID BIGINT NULL,
    RefillAllowed BIT NOT NULL CONSTRAINT DF_Prescriptions_RefillAllowed DEFAULT 0,
    AllowedRefillCount INT NOT NULL CONSTRAINT DF_Prescriptions_AllowedRefillCount DEFAULT 0,
    UsedRefillCount INT NOT NULL CONSTRAINT DF_Prescriptions_UsedRefillCount DEFAULT 0,
    RefillInstructions NVARCHAR(2000) NULL,
    RefillValidUntil DATE NULL,
    PrescriptionNotes NVARCHAR(2000) NULL,
    CONSTRAINT FK_Prescriptions_MedicalRecords FOREIGN KEY (MedicalRecordID) REFERENCES dbo.MedicalRecords(MedicalRecordID),
    CONSTRAINT FK_Prescriptions_Doctors FOREIGN KEY (DoctorEmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT FK_Prescriptions_Previous FOREIGN KEY (PreviousPrescriptionID) REFERENCES dbo.Prescriptions(PrescriptionID),
    CONSTRAINT CK_Prescriptions_RefillCounts CHECK (AllowedRefillCount >= 0 AND UsedRefillCount >= 0 AND UsedRefillCount <= AllowedRefillCount),
    CONSTRAINT CK_Prescriptions_RefillFlag CHECK (RefillAllowed = 1 OR AllowedRefillCount = 0),
    CONSTRAINT CK_Prescriptions_SeverityClass CHECK (SeverityClass IN (N'Mild', N'Severe')),
    CONSTRAINT CK_Prescriptions_SevereNoRefill CHECK (SeverityClass <> N'Severe' OR (RefillAllowed = 0 AND AllowedRefillCount = 0)),
    CONSTRAINT CK_Prescriptions_Status CHECK (PrescriptionStatus IN (N'Active', N'RefillsExhausted', N'Closed'))
);

CREATE TABLE dbo.PrescriptionDetails (
    PrescriptionDetailID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PrescriptionID BIGINT NOT NULL,
    ProductVariantID BIGINT NOT NULL,
    Dosage NVARCHAR(200) NOT NULL,
    Frequency NVARCHAR(200) NULL,
    DurationDays INT NULL,
    Quantity INT NOT NULL,
    UsageInstructions NVARCHAR(2000) NULL,
    CONSTRAINT FK_PrescriptionDetails_Prescriptions FOREIGN KEY (PrescriptionID) REFERENCES dbo.Prescriptions(PrescriptionID),
    CONSTRAINT FK_PrescriptionDetails_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT UQ_PrescriptionDetails_Prescription_Variant UNIQUE (PrescriptionID, ProductVariantID),
    CONSTRAINT CK_PrescriptionDetails_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_PrescriptionDetails_Duration CHECK (DurationDays IS NULL OR DurationDays > 0)
);

CREATE TABLE dbo.PrescriptionRefillHistory (
    PrescriptionRefillHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PrescriptionID BIGINT NOT NULL,
    OrderID BIGINT NOT NULL,
    CustomerID BIGINT NOT NULL,
    PurchaseType NVARCHAR(10) NOT NULL CONSTRAINT DF_PrescriptionRefillHistory_PurchaseType DEFAULT N'Refill',
    RefillStatus NVARCHAR(10) NOT NULL CONSTRAINT DF_PrescriptionRefillHistory_RefillStatus DEFAULT N'Used',
    RefilledAt DATETIME2(0) NOT NULL CONSTRAINT DF_PrescriptionRefillHistory_RefilledAt DEFAULT SYSDATETIME(),
    RevertedAt DATETIME2(0) NULL,
    RefillQuantity INT NOT NULL,
    Notes NVARCHAR(1000) NULL,
    CONSTRAINT FK_PrescriptionRefillHistory_Prescriptions FOREIGN KEY (PrescriptionID) REFERENCES dbo.Prescriptions(PrescriptionID),
    CONSTRAINT FK_PrescriptionRefillHistory_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID),
    CONSTRAINT FK_PrescriptionRefillHistory_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT UQ_PrescriptionRefillHistory_Prescription_Order UNIQUE (PrescriptionID, OrderID),
    CONSTRAINT CK_PrescriptionRefillHistory_Quantity CHECK (RefillQuantity > 0),
    CONSTRAINT CK_PrescriptionRefillHistory_PurchaseType CHECK (PurchaseType IN (N'Initial', N'Refill')),
    CONSTRAINT CK_PrescriptionRefillHistory_Status CHECK (
        (RefillStatus = N'Used' AND RevertedAt IS NULL) OR (RefillStatus = N'Reverted' AND RevertedAt IS NOT NULL)
    )
);

CREATE TABLE dbo.PrescriptionRefillItems (
    PrescriptionRefillItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PrescriptionRefillHistoryID BIGINT NOT NULL,
    PrescriptionDetailID BIGINT NOT NULL,
    OrderItemID BIGINT NOT NULL,
    RefilledQuantity INT NOT NULL,
    CONSTRAINT FK_PrescriptionRefillItems_History FOREIGN KEY (PrescriptionRefillHistoryID) REFERENCES dbo.PrescriptionRefillHistory(PrescriptionRefillHistoryID),
    CONSTRAINT FK_PrescriptionRefillItems_PrescriptionDetails FOREIGN KEY (PrescriptionDetailID) REFERENCES dbo.PrescriptionDetails(PrescriptionDetailID),
    CONSTRAINT FK_PrescriptionRefillItems_OrderItems FOREIGN KEY (OrderItemID) REFERENCES dbo.OrderItems(OrderItemID),
    CONSTRAINT CK_PrescriptionRefillItems_Quantity CHECK (RefilledQuantity > 0),
    CONSTRAINT UQ_PrescriptionRefillItems_History_Detail UNIQUE (PrescriptionRefillHistoryID, PrescriptionDetailID),
    CONSTRAINT UQ_PrescriptionRefillItems_OrderItem UNIQUE (OrderItemID)
);

CREATE TABLE dbo.CartItems (
    CartItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CartID BIGINT NOT NULL,
    ProductVariantID BIGINT NOT NULL,
    PrescriptionDetailID BIGINT NULL,
    Quantity INT NOT NULL,
    AddedAt DATETIME2(0) NOT NULL CONSTRAINT DF_CartItems_AddedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartID) REFERENCES dbo.Carts(CartID),
    CONSTRAINT FK_CartItems_ProductVariants FOREIGN KEY (ProductVariantID) REFERENCES dbo.ProductVariants(ProductVariantID),
    CONSTRAINT FK_CartItems_PrescriptionDetails FOREIGN KEY (PrescriptionDetailID) REFERENCES dbo.PrescriptionDetails(PrescriptionDetailID),
    CONSTRAINT CK_CartItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT UQ_CartItems_Cart_Variant UNIQUE (CartID, ProductVariantID)
);

CREATE TABLE dbo.PaymentMethods (
    PaymentMethodID INT IDENTITY(1,1) PRIMARY KEY,
    MethodCode NVARCHAR(50) NOT NULL UNIQUE,
    MethodName NVARCHAR(100) NOT NULL,
    PaymentMethodType NVARCHAR(30) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_PaymentMethods_IsActive DEFAULT 1,
    CONSTRAINT CK_PaymentMethods_Type CHECK (PaymentMethodType IN (N'Cash', N'BankTransfer', N'OnlineGateway'))
);

ALTER TABLE dbo.ServicePaymentMethods
ADD CONSTRAINT FK_ServicePaymentMethods_PaymentMethods FOREIGN KEY (PaymentMethodID) REFERENCES dbo.PaymentMethods(PaymentMethodID);

CREATE TABLE dbo.Payments (
    PaymentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerID BIGINT NOT NULL,
    AppointmentID BIGINT NULL,
    OrderID BIGINT NULL,
    PaymentMethodID INT NOT NULL,
    PaymentCode NVARCHAR(100) NOT NULL UNIQUE,
    Amount DECIMAL(18,2) NOT NULL,
    PaymentStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Payments_Status DEFAULT N'Pending',
    PaidAt DATETIME2(0) NULL,
    ConfirmedByUserID BIGINT NULL,
    ConfirmedAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Payments_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_Payments_Appointments FOREIGN KEY (AppointmentID) REFERENCES dbo.Appointments(AppointmentID),
    CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID),
    CONSTRAINT FK_Payments_PaymentMethods FOREIGN KEY (PaymentMethodID) REFERENCES dbo.PaymentMethods(PaymentMethodID),
    CONSTRAINT FK_Payments_ConfirmedBy FOREIGN KEY (ConfirmedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_Payments_Target CHECK ((AppointmentID IS NOT NULL AND OrderID IS NULL) OR (AppointmentID IS NULL AND OrderID IS NOT NULL)),
    CONSTRAINT CK_Payments_Amount CHECK (Amount > 0),
    CONSTRAINT CK_Payments_Status CHECK (PaymentStatus IN (N'Pending', N'Paid', N'Failed', N'Cancelled', N'PartiallyRefunded', N'Refunded', N'Duplicate')),
    CONSTRAINT CK_Payments_Confirmation CHECK (
        (ConfirmedByUserID IS NULL AND ConfirmedAt IS NULL)
        OR (ConfirmedByUserID IS NOT NULL AND ConfirmedAt IS NOT NULL)
    )
);

CREATE TABLE dbo.PaymentIdempotencyKeys (
    IdempotencyKey NVARCHAR(150) NOT NULL PRIMARY KEY,
    PaymentID BIGINT NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PaymentIdempotencyKeys_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PaymentIdempotencyKeys_Payments FOREIGN KEY (PaymentID) REFERENCES dbo.Payments(PaymentID)
);

CREATE INDEX IX_Products_ProductCategoryID ON dbo.Products(ProductCategoryID);
CREATE INDEX IX_ProductVariants_ProductID ON dbo.ProductVariants(ProductID);
CREATE UNIQUE INDEX UX_ProductImages_PrimaryPerProduct ON dbo.ProductImages(ProductID) WHERE IsPrimary = 1 AND ProductVariantID IS NULL;
CREATE UNIQUE INDEX UX_ProductImages_PrimaryPerVariant ON dbo.ProductImages(ProductVariantID) WHERE IsPrimary = 1 AND ProductVariantID IS NOT NULL;
CREATE UNIQUE INDEX UX_SupplierProducts_PreferredPerVariant ON dbo.SupplierProducts(ProductVariantID) WHERE IsPreferredSupplier = 1;
CREATE INDEX IX_SupplierReconciliations_Supplier_Period ON dbo.SupplierReconciliations(SupplierID, PeriodStart DESC);
CREATE INDEX IX_PurchaseOrders_Supplier_PaymentStatus ON dbo.PurchaseOrders(SupplierID, PaymentStatus);
CREATE INDEX IX_PurchaseOrders_SupplierReconciliationID ON dbo.PurchaseOrders(SupplierReconciliationID) WHERE SupplierReconciliationID IS NOT NULL;
CREATE INDEX IX_SupplierPayments_PurchaseOrderID ON dbo.SupplierPayments(PurchaseOrderID);
CREATE UNIQUE INDEX UX_InventoryBatches_ReceiptDetail ON dbo.InventoryBatches(GoodsReceiptDetailID) WHERE GoodsReceiptDetailID IS NOT NULL;
CREATE INDEX IX_InventoryBatches_ExpiryDate ON dbo.InventoryBatches(ExpiryDate) INCLUDE (ProductVariantID, RemainingQuantity) WHERE RemainingQuantity > 0 AND ExpiryDate IS NOT NULL;
CREATE INDEX IX_InventoryTransactions_Variant_CreatedAt ON dbo.InventoryTransactions(ProductVariantID, CreatedAt DESC);
CREATE INDEX IX_InventoryTransactions_InventoryBatchID ON dbo.InventoryTransactions(InventoryBatchID) WHERE InventoryBatchID IS NOT NULL;
CREATE INDEX IX_DoctorMedicineStocks_ProductVariant ON dbo.DoctorMedicineStocks(ProductVariantID);
CREATE INDEX IX_DoctorMedicineAllocations_Employee_Date ON dbo.DoctorMedicineAllocations(EmployeeID, AllocatedAt DESC);
CREATE INDEX IX_DoctorMedicineUsageHistory_Employee_Date ON dbo.DoctorMedicineUsageHistory(EmployeeID, UsedAt DESC);
CREATE INDEX IX_DrugImportProposals_Status ON dbo.DrugImportProposals(ProposalStatus, CreatedAt DESC);
CREATE INDEX IX_Orders_CustomerID_CreatedAt ON dbo.Orders(CustomerID, CreatedAt DESC);
CREATE INDEX IX_OrderItems_OrderID ON dbo.OrderItems(OrderID);
CREATE INDEX IX_OrderItems_ProductVariantID ON dbo.OrderItems(ProductVariantID);
CREATE UNIQUE INDEX UX_VoucherUsageHistory_ActiveVoucherCustomer ON dbo.VoucherUsageHistory(VoucherID, CustomerID) WHERE UsageStatus = N'Used';
CREATE UNIQUE INDEX UX_Carts_ActivePerCustomer ON dbo.Carts(CustomerID) WHERE CartStatus = N'Active';
CREATE INDEX IX_CartItems_PrescriptionDetailID ON dbo.CartItems(PrescriptionDetailID) WHERE PrescriptionDetailID IS NOT NULL;
CREATE INDEX IX_Prescriptions_MedicalRecordID ON dbo.Prescriptions(MedicalRecordID);
CREATE UNIQUE INDEX UX_Prescriptions_OneSuccessor ON dbo.Prescriptions(PreviousPrescriptionID) WHERE PreviousPrescriptionID IS NOT NULL;
CREATE INDEX IX_PrescriptionDetails_PrescriptionID ON dbo.PrescriptionDetails(PrescriptionID);
CREATE UNIQUE INDEX UX_PrescriptionRefillHistory_OneInitial ON dbo.PrescriptionRefillHistory(PrescriptionID) WHERE PurchaseType = N'Initial' AND RefillStatus = N'Used';
CREATE INDEX IX_PrescriptionRefillItems_PrescriptionDetailID ON dbo.PrescriptionRefillItems(PrescriptionDetailID);
CREATE INDEX IX_Payments_CustomerID_CreatedAt ON dbo.Payments(CustomerID, CreatedAt DESC);
CREATE INDEX IX_Payments_AppointmentID ON dbo.Payments(AppointmentID) WHERE AppointmentID IS NOT NULL;
CREATE INDEX IX_Payments_OrderID ON dbo.Payments(OrderID) WHERE OrderID IS NOT NULL;
CREATE INDEX IX_Payments_Appointment_Status ON dbo.Payments(AppointmentID, PaymentStatus) INCLUDE (CustomerID, Amount, PaymentMethodID);
CREATE INDEX IX_Payments_Order_Status ON dbo.Payments(OrderID, PaymentStatus) INCLUDE (CustomerID, Amount, PaymentMethodID);
CREATE UNIQUE INDEX UX_Payments_OnePendingPerAppointment ON dbo.Payments(AppointmentID) WHERE AppointmentID IS NOT NULL AND PaymentStatus = N'Pending';
CREATE UNIQUE INDEX UX_Payments_OnePendingPerOrder ON dbo.Payments(OrderID) WHERE OrderID IS NOT NULL AND PaymentStatus = N'Pending';
CREATE UNIQUE INDEX UX_Payments_OneSuccessfulPerAppointment ON dbo.Payments(AppointmentID) WHERE AppointmentID IS NOT NULL AND PaymentStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded');
CREATE UNIQUE INDEX UX_Payments_OneSuccessfulPerOrder ON dbo.Payments(OrderID) WHERE OrderID IS NOT NULL AND PaymentStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded');
GO

/* =========================================================
   PHÂN HỆ 7 - NHẬN NUÔI, ĐỔI TRẢ, HOÀN TIỀN, AI VÀ HỆ THỐNG
   ========================================================= */

CREATE TABLE dbo.AdoptionListings (
    AdoptionListingID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PetID BIGINT NOT NULL,
    RescueStationID BIGINT NOT NULL,
    ListingTitle NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NULL,
    HealthSummary NVARCHAR(2000) NULL,
    Temperament NVARCHAR(500) NULL,
    AdoptionRequirements NVARCHAR(2000) NULL,
    ListingStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_AdoptionListings_Status DEFAULT N'Available',
    PublishedAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AdoptionListings_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AdoptionListings_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID),
    CONSTRAINT FK_AdoptionListings_Stations FOREIGN KEY (RescueStationID) REFERENCES dbo.RescueStationProfiles(RescueStationID),
    CONSTRAINT CK_AdoptionListings_Status CHECK (ListingStatus IN (N'Draft', N'Available', N'Pending', N'Adopted', N'Closed'))
);

CREATE TABLE dbo.AdoptionApplications (
    AdoptionApplicationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AdoptionListingID BIGINT NOT NULL,
    CustomerID BIGINT NOT NULL,
    ApplicationStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_AdoptionApplications_Status DEFAULT N'Pending',
    ApplicantReason NVARCHAR(2000) NULL,
    LivingEnvironment NVARCHAR(2000) NULL,
    ExperienceDescription NVARCHAR(2000) NULL,
    ReviewedByUserID BIGINT NULL,
    ReviewedAt DATETIME2(0) NULL,
    ReviewNote NVARCHAR(2000) NULL,
    HandoverConfirmedByStationAt DATETIME2(0) NULL,
    HandoverConfirmedByCustomerAt DATETIME2(0) NULL,
    HandoverNote NVARCHAR(1000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AdoptionApplications_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AdoptionApplications_Listings FOREIGN KEY (AdoptionListingID) REFERENCES dbo.AdoptionListings(AdoptionListingID),
    CONSTRAINT FK_AdoptionApplications_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_AdoptionApplications_ReviewedBy FOREIGN KEY (ReviewedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_AdoptionApplications_Status CHECK (ApplicationStatus IN (N'Pending', N'UnderReview', N'Approved', N'Rejected', N'Withdrawn', N'Completed')),
    CONSTRAINT CK_AdoptionApplications_HandoverCompleted CHECK (
        ApplicationStatus <> N'Completed'
        OR (HandoverConfirmedByStationAt IS NOT NULL AND HandoverConfirmedByCustomerAt IS NOT NULL)
    )
);

ALTER TABLE dbo.PetOwnershipHistory
ADD CONSTRAINT FK_PetOwnershipHistory_AdoptionApplications FOREIGN KEY (AdoptionApplicationID) REFERENCES dbo.AdoptionApplications(AdoptionApplicationID);

CREATE TABLE dbo.AdoptionApplicationHistory (
    AdoptionApplicationHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AdoptionApplicationID BIGINT NOT NULL,
    ChangedByUserID BIGINT NOT NULL,
    OldStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    ChangeNote NVARCHAR(1000) NULL,
    ChangedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AdoptionApplicationHistory_ChangedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AdoptionApplicationHistory_Applications FOREIGN KEY (AdoptionApplicationID) REFERENCES dbo.AdoptionApplications(AdoptionApplicationID),
    CONSTRAINT FK_AdoptionApplicationHistory_Users FOREIGN KEY (ChangedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.AdoptionSupervisions (
    AdoptionSupervisionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AdoptionApplicationID BIGINT NOT NULL,
    ManagerUserID BIGINT NOT NULL,
    SupervisionDate DATETIME2(0) NOT NULL,
    SupervisionType NVARCHAR(50) NOT NULL,
    SupervisionResult NVARCHAR(30) NULL,
    Notes NVARCHAR(2000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AdoptionSupervisions_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AdoptionSupervisions_Applications FOREIGN KEY (AdoptionApplicationID) REFERENCES dbo.AdoptionApplications(AdoptionApplicationID),
    CONSTRAINT FK_AdoptionSupervisions_Manager FOREIGN KEY (ManagerUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.AdoptionHandoverAppointments (
    AdoptionHandoverAppointmentID BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    AdoptionApplicationID BIGINT NOT NULL,
    PetID BIGINT NOT NULL,
    RescueStationID BIGINT NOT NULL,
    StartAt DATETIME2(0) NOT NULL,
    EndAt DATETIME2(0) NOT NULL,
    ScheduleStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_AdoptionHandoverAppointments_Status DEFAULT N'Scheduled',
    Notes NVARCHAR(1000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AdoptionHandoverAppointments_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_AdoptionHandoverAppointments_Applications FOREIGN KEY (AdoptionApplicationID) REFERENCES dbo.AdoptionApplications(AdoptionApplicationID),
    CONSTRAINT FK_AdoptionHandoverAppointments_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID),
    CONSTRAINT FK_AdoptionHandoverAppointments_Stations FOREIGN KEY (RescueStationID) REFERENCES dbo.RescueStationProfiles(RescueStationID),
    CONSTRAINT CK_AdoptionHandoverAppointments_Time CHECK (EndAt > StartAt),
    CONSTRAINT CK_AdoptionHandoverAppointments_Status CHECK (ScheduleStatus IN (N'Scheduled', N'Confirmed', N'Completed', N'Cancelled'))
);

CREATE TABLE dbo.ReturnRequests (
    ReturnRequestID BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderID BIGINT NOT NULL,
    CustomerID BIGINT NOT NULL,
    ReturnCode NVARCHAR(50) NOT NULL UNIQUE,
    ReturnReason NVARCHAR(50) NOT NULL,
    CustomerDescription NVARCHAR(2000) NULL,
    ReturnStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_ReturnRequests_Status DEFAULT N'Submitted',
    RequestedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ReturnRequests_RequestedAt DEFAULT SYSDATETIME(),
    ReviewedByUserID BIGINT NULL,
    ReviewedAt DATETIME2(0) NULL,
    ReviewNote NVARCHAR(2000) NULL,
    CONSTRAINT FK_ReturnRequests_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID),
    CONSTRAINT FK_ReturnRequests_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_ReturnRequests_ReviewedBy FOREIGN KEY (ReviewedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_ReturnRequests_Reason CHECK (ReturnReason IN (N'Defective', N'WrongItem')),
    CONSTRAINT CK_ReturnRequests_Status CHECK (ReturnStatus IN (N'Submitted', N'UnderReview', N'NeedMoreEvidence', N'Approved', N'Rejected', N'ReturnShipping', N'Received', N'Refunded', N'Closed'))
);

CREATE TABLE dbo.ReturnRequestItems (
    ReturnRequestItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReturnRequestID BIGINT NOT NULL,
    OrderItemID BIGINT NOT NULL,
    ReturnQuantity INT NOT NULL,
    ItemCondition NVARCHAR(1000) NULL,
    CONSTRAINT FK_ReturnRequestItems_ReturnRequests FOREIGN KEY (ReturnRequestID) REFERENCES dbo.ReturnRequests(ReturnRequestID),
    CONSTRAINT FK_ReturnRequestItems_OrderItems FOREIGN KEY (OrderItemID) REFERENCES dbo.OrderItems(OrderItemID),
    CONSTRAINT CK_ReturnRequestItems_Quantity CHECK (ReturnQuantity > 0),
    CONSTRAINT UQ_ReturnRequestItems UNIQUE (ReturnRequestID, OrderItemID)
);

CREATE TABLE dbo.ReturnEvidence (
    ReturnEvidenceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReturnRequestID BIGINT NOT NULL,
    UploadedByUserID BIGINT NOT NULL,
    EvidenceUrl NVARCHAR(1000) NOT NULL,
    EvidenceType NVARCHAR(30) NOT NULL,
    Description NVARCHAR(1000) NULL,
    UploadedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ReturnEvidence_UploadedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ReturnEvidence_ReturnRequests FOREIGN KEY (ReturnRequestID) REFERENCES dbo.ReturnRequests(ReturnRequestID),
    CONSTRAINT FK_ReturnEvidence_Users FOREIGN KEY (UploadedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_ReturnEvidence_Type CHECK (EvidenceType IN (N'Image', N'Video', N'Document'))
);

CREATE TABLE dbo.ReturnShipments (
    ReturnShipmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReturnRequestID BIGINT NOT NULL,
    CarrierName NVARCHAR(150) NULL,
    TrackingNumber NVARCHAR(150) NULL,
    ShipmentStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_ReturnShipments_Status DEFAULT N'Pending',
    ShippedAt DATETIME2(0) NULL,
    ReceivedAt DATETIME2(0) NULL,
    ShippingNote NVARCHAR(1000) NULL,
    CONSTRAINT FK_ReturnShipments_ReturnRequests FOREIGN KEY (ReturnRequestID) REFERENCES dbo.ReturnRequests(ReturnRequestID),
    CONSTRAINT CK_ReturnShipments_Status CHECK (ShipmentStatus IN (N'Pending', N'InTransit', N'Delivered', N'Lost', N'Cancelled'))
);

CREATE TABLE dbo.ReturnStatusHistory (
    ReturnStatusHistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReturnRequestID BIGINT NOT NULL,
    OldStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    ChangedByUserID BIGINT NULL,
    ChangeNote NVARCHAR(1000) NULL,
    ChangedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ReturnStatusHistory_ChangedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ReturnStatusHistory_ReturnRequests FOREIGN KEY (ReturnRequestID) REFERENCES dbo.ReturnRequests(ReturnRequestID),
    CONSTRAINT FK_ReturnStatusHistory_Users FOREIGN KEY (ChangedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.SupplierReturnRequests (
    SupplierReturnRequestID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReturnCode NVARCHAR(50) NOT NULL UNIQUE,
    PurchaseOrderID BIGINT NOT NULL,
    GoodsReceiptID BIGINT NULL,
    ReturnReason NVARCHAR(30) NOT NULL,
    ReturnStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_SupplierReturnRequests_Status DEFAULT N'Pending',
    Resolution NVARCHAR(30) NULL,
    RequestedByUserID BIGINT NOT NULL,
    SupplierResponseNote NVARCHAR(1000) NULL,
    Notes NVARCHAR(1000) NULL,
    RequestedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SupplierReturnRequests_RequestedAt DEFAULT SYSDATETIME(),
    ResolvedAt DATETIME2(0) NULL,
    CONSTRAINT FK_SupplierReturnRequests_PurchaseOrders FOREIGN KEY (PurchaseOrderID) REFERENCES dbo.PurchaseOrders(PurchaseOrderID),
    CONSTRAINT FK_SupplierReturnRequests_GoodsReceipts FOREIGN KEY (GoodsReceiptID) REFERENCES dbo.GoodsReceipts(GoodsReceiptID),
    CONSTRAINT FK_SupplierReturnRequests_RequestedBy FOREIGN KEY (RequestedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_SupplierReturnRequests_Reason CHECK (ReturnReason IN (N'Defective', N'ShortDelivery', N'WrongItem')),
    CONSTRAINT CK_SupplierReturnRequests_Status CHECK (ReturnStatus IN (N'Pending', N'SentToSupplier', N'Accepted', N'Rejected', N'Completed', N'Cancelled')),
    CONSTRAINT CK_SupplierReturnRequests_Resolution CHECK (Resolution IS NULL OR Resolution IN (N'Replacement', N'CreditNote', N'Refund'))
);

CREATE TABLE dbo.SupplierReturnItems (
    SupplierReturnItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
    SupplierReturnRequestID BIGINT NOT NULL,
    GoodsReceiptDetailID BIGINT NOT NULL,
    Quantity INT NOT NULL,
    ItemNote NVARCHAR(500) NULL,
    CONSTRAINT FK_SupplierReturnItems_Requests FOREIGN KEY (SupplierReturnRequestID) REFERENCES dbo.SupplierReturnRequests(SupplierReturnRequestID),
    CONSTRAINT FK_SupplierReturnItems_GoodsReceiptDetails FOREIGN KEY (GoodsReceiptDetailID) REFERENCES dbo.GoodsReceiptDetails(GoodsReceiptDetailID),
    CONSTRAINT CK_SupplierReturnItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT UQ_SupplierReturnItems_Request_Detail UNIQUE (SupplierReturnRequestID, GoodsReceiptDetailID)
);

CREATE TABLE dbo.Refunds (
    RefundID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PaymentID BIGINT NOT NULL,
    ReturnRequestID BIGINT NULL,
    RefundCode NVARCHAR(100) NOT NULL UNIQUE,
    RefundType NVARCHAR(30) NOT NULL CONSTRAINT DF_Refunds_RefundType DEFAULT N'Return',
    RefundAmount DECIMAL(18,2) NOT NULL,
    RefundMethod NVARCHAR(30) NOT NULL,
    RefundStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Refunds_Status DEFAULT N'Pending',
    TransactionReference NVARCHAR(200) NULL,
    ProcessedByUserID BIGINT NULL,
    RequestedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Refunds_RequestedAt DEFAULT SYSDATETIME(),
    ProcessedAt DATETIME2(0) NULL,
    Notes NVARCHAR(1000) NULL,
    CONSTRAINT FK_Refunds_Payments FOREIGN KEY (PaymentID) REFERENCES dbo.Payments(PaymentID),
    CONSTRAINT FK_Refunds_ReturnRequests FOREIGN KEY (ReturnRequestID) REFERENCES dbo.ReturnRequests(ReturnRequestID),
    CONSTRAINT FK_Refunds_ProcessedBy FOREIGN KEY (ProcessedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_Refunds_Amount CHECK (RefundAmount > 0),
    CONSTRAINT CK_Refunds_Method CHECK (RefundMethod IN (N'OriginalPaymentMethod', N'BankTransfer', N'Cash')),
    CONSTRAINT CK_Refunds_Status CHECK (RefundStatus IN (N'Pending', N'Processing', N'Completed', N'Failed', N'Cancelled')),
    CONSTRAINT CK_Refunds_RefundType CHECK (RefundType IN (N'Return', N'AppointmentCancel', N'AppointmentRejected', N'Other')),
    CONSTRAINT CK_Refunds_ReturnLink CHECK ((RefundType = N'Return' AND ReturnRequestID IS NOT NULL) OR (RefundType <> N'Return' AND ReturnRequestID IS NULL))
);

CREATE TABLE dbo.RefundIdempotencyKeys (
    IdempotencyKey NVARCHAR(150) NOT NULL PRIMARY KEY,
    RefundID BIGINT NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_RefundIdempotencyKeys_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_RefundIdempotencyKeys_Refunds FOREIGN KEY (RefundID) REFERENCES dbo.Refunds(RefundID)
);

CREATE TABLE dbo.PaymentTransactions (
    PaymentTransactionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PaymentID BIGINT NOT NULL,
    RefundID BIGINT NULL,
    GatewayName NVARCHAR(100) NULL,
    GatewayTransactionCode NVARCHAR(200) NULL,
    TransactionType NVARCHAR(30) NOT NULL,
    TransactionStatus NVARCHAR(30) NOT NULL,
    TransactionAmount DECIMAL(18,2) NOT NULL,
    IsDuplicatePayment BIT NOT NULL CONSTRAINT DF_PaymentTransactions_IsDuplicatePayment DEFAULT 0,
    RawResponse NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PaymentTransactions_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PaymentTransactions_Payments FOREIGN KEY (PaymentID) REFERENCES dbo.Payments(PaymentID),
    CONSTRAINT FK_PaymentTransactions_Refunds FOREIGN KEY (RefundID) REFERENCES dbo.Refunds(RefundID),
    CONSTRAINT CK_PaymentTransactions_Type CHECK (TransactionType IN (N'Payment', N'Refund', N'Inquiry')),
    CONSTRAINT CK_PaymentTransactions_Status CHECK (TransactionStatus IN (N'Pending', N'Success', N'Failed', N'Cancelled')),
    CONSTRAINT CK_PaymentTransactions_Amount CHECK (TransactionAmount >= 0),
    CONSTRAINT CK_PaymentTransactions_RefundLink CHECK (RefundID IS NULL OR TransactionType = N'Refund')
);

CREATE TABLE dbo.ReminderTypes (
    ReminderTypeID INT IDENTITY(1,1) PRIMARY KEY,
    ReminderTypeName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ReminderTypes_IsActive DEFAULT 1
);

CREATE TABLE dbo.PetReminders (
    PetReminderID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PetID BIGINT NOT NULL,
    CustomerID BIGINT NOT NULL,
    ReminderTypeID INT NOT NULL,
    ReminderTitle NVARCHAR(200) NOT NULL,
    ReminderDescription NVARCHAR(1000) NULL,
    RemindAt DATETIME2(0) NOT NULL,
    ReminderStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_PetReminders_Status DEFAULT N'Pending',
    IsRecurring BIT NOT NULL CONSTRAINT DF_PetReminders_IsRecurring DEFAULT 0,
    RecurrenceRule NVARCHAR(200) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PetReminders_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PetReminders_Pets FOREIGN KEY (PetID) REFERENCES dbo.Pets(PetID),
    CONSTRAINT FK_PetReminders_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_PetReminders_ReminderTypes FOREIGN KEY (ReminderTypeID) REFERENCES dbo.ReminderTypes(ReminderTypeID),
    CONSTRAINT CK_PetReminders_Status CHECK (ReminderStatus IN (N'Pending', N'Sent', N'Completed', N'Cancelled')),
    CONSTRAINT CK_PetReminders_Recurrence CHECK (IsRecurring = 0 OR RecurrenceRule IS NOT NULL)
);

CREATE TABLE dbo.Reviews (
    ReviewID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerID BIGINT NOT NULL,
    AppointmentID BIGINT NOT NULL,
    ServiceID BIGINT NULL,
    EmployeeID BIGINT NULL,
    Rating TINYINT NOT NULL,
    ReviewContent NVARCHAR(2000) NULL,
    ReviewStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Reviews_Status DEFAULT N'Published',
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Reviews_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Reviews_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_Reviews_Appointments FOREIGN KEY (AppointmentID) REFERENCES dbo.Appointments(AppointmentID),
    CONSTRAINT FK_Reviews_Services FOREIGN KEY (ServiceID) REFERENCES dbo.Services(ServiceID),
    CONSTRAINT FK_Reviews_Employees FOREIGN KEY (EmployeeID) REFERENCES dbo.EmployeeProfiles(EmployeeID),
    CONSTRAINT CK_Reviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    CONSTRAINT CK_Reviews_Status CHECK (ReviewStatus IN (N'Published', N'Hidden', N'Removed')),
    CONSTRAINT UQ_Reviews_Customer_Appointment_Target UNIQUE (CustomerID, AppointmentID, ServiceID, EmployeeID)
);

CREATE TABLE dbo.ProductReviews (
    ProductReviewID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductID BIGINT NOT NULL,
    CustomerID BIGINT NOT NULL,
    OrderItemID BIGINT NOT NULL,
    Rating TINYINT NOT NULL,
    Title NVARCHAR(200) NULL,
    ReviewContent NVARCHAR(2000) NULL,
    ReviewStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_ProductReviews_Status DEFAULT N'Published',
    ModeratedByUserID BIGINT NULL,
    ModeratedAt DATETIME2(0) NULL,
    ModerationNote NVARCHAR(500) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ProductReviews_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_ProductReviews_Products FOREIGN KEY (ProductID) REFERENCES dbo.Products(ProductID),
    CONSTRAINT FK_ProductReviews_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_ProductReviews_OrderItems FOREIGN KEY (OrderItemID) REFERENCES dbo.OrderItems(OrderItemID),
    CONSTRAINT FK_ProductReviews_ModeratedBy FOREIGN KEY (ModeratedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_ProductReviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    CONSTRAINT CK_ProductReviews_Status CHECK (ReviewStatus IN (N'Published', N'Hidden', N'Removed', N'Deleted')),
    CONSTRAINT UQ_ProductReviews_OrderItem UNIQUE (OrderItemID)
);

CREATE TABLE dbo.AIConversations (
    AIConversationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerID BIGINT NOT NULL,
    ConversationTitle NVARCHAR(200) NULL,
    ConversationStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_AIConversations_Status DEFAULT N'Active',
    StartedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AIConversations_StartedAt DEFAULT SYSDATETIME(),
    EndedAt DATETIME2(0) NULL,
    CONSTRAINT FK_AIConversations_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT CK_AIConversations_Status CHECK (ConversationStatus IN (N'Active', N'Archived', N'Closed'))
);

CREATE TABLE dbo.AIConversationMessages (
    AIConversationMessageID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AIConversationID BIGINT NOT NULL,
    SenderType NVARCHAR(20) NOT NULL,
    MessageContent NVARCHAR(MAX) NOT NULL,
    SentAt DATETIME2(0) NOT NULL CONSTRAINT DF_AIConversationMessages_SentAt DEFAULT SYSDATETIME(),
    TokenCount INT NULL,
    CONSTRAINT FK_AIConversationMessages_Conversations FOREIGN KEY (AIConversationID) REFERENCES dbo.AIConversations(AIConversationID),
    CONSTRAINT CK_AIConversationMessages_Sender CHECK (SenderType IN (N'Customer', N'Assistant', N'System')),
    CONSTRAINT CK_AIConversationMessages_Tokens CHECK (TokenCount IS NULL OR TokenCount >= 0)
);

CREATE TABLE dbo.AIConfigurations (
    AIConfigurationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ConfigurationKey NVARCHAR(150) NOT NULL UNIQUE,
    ConfigurationValue NVARCHAR(MAX) NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_AIConfigurations_IsActive DEFAULT 1,
    UpdatedByUserID BIGINT NULL,
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AIConfigurations_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AIConfigurations_Users FOREIGN KEY (UpdatedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.AIPromptVersions (
    AIPromptVersionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PromptName NVARCHAR(150) NOT NULL,
    VersionNumber INT NOT NULL,
    PromptContent NVARCHAR(MAX) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_AIPromptVersions_IsActive DEFAULT 0,
    CreatedByUserID BIGINT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AIPromptVersions_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AIPromptVersions_Users FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT UQ_AIPromptVersions_Name_Version UNIQUE (PromptName, VersionNumber),
    CONSTRAINT CK_AIPromptVersions_Version CHECK (VersionNumber > 0)
);

CREATE TABLE dbo.AIKnowledgeDocuments (
    AIKnowledgeDocumentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    DocumentTitle NVARCHAR(250) NOT NULL,
    DocumentType NVARCHAR(50) NULL,
    DocumentContent NVARCHAR(MAX) NULL,
    SourceUrl NVARCHAR(1000) NULL,
    DocumentStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_AIKnowledgeDocuments_Status DEFAULT N'Draft',
    CreatedByUserID BIGINT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AIKnowledgeDocuments_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_AIKnowledgeDocuments_Users FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_AIKnowledgeDocuments_Status CHECK (DocumentStatus IN (N'Draft', N'Published', N'Archived'))
);

CREATE TABLE dbo.AIUsageLogs (
    AIUsageLogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerID BIGINT NULL,
    AIConversationID BIGINT NULL,
    AIModelName NVARCHAR(150) NULL,
    InputTokens INT NULL,
    OutputTokens INT NULL,
    EstimatedCost DECIMAL(18,6) NULL,
    ResponseTimeMilliseconds INT NULL,
    WasEscalatedToDoctor BIT NOT NULL CONSTRAINT DF_AIUsageLogs_Escalated DEFAULT 0,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AIUsageLogs_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AIUsageLogs_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT FK_AIUsageLogs_Conversations FOREIGN KEY (AIConversationID) REFERENCES dbo.AIConversations(AIConversationID),
    CONSTRAINT CK_AIUsageLogs_Tokens CHECK ((InputTokens IS NULL OR InputTokens >= 0) AND (OutputTokens IS NULL OR OutputTokens >= 0)),
    CONSTRAINT CK_AIUsageLogs_Cost CHECK (EstimatedCost IS NULL OR EstimatedCost >= 0)
);

CREATE TABLE dbo.AIFeedback (
    AIFeedbackID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AIConversationMessageID BIGINT NOT NULL,
    CustomerID BIGINT NOT NULL,
    Rating TINYINT NOT NULL,
    FeedbackComment NVARCHAR(2000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AIFeedback_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AIFeedback_Messages FOREIGN KEY (AIConversationMessageID) REFERENCES dbo.AIConversationMessages(AIConversationMessageID),
    CONSTRAINT FK_AIFeedback_Customers FOREIGN KEY (CustomerID) REFERENCES dbo.CustomerProfiles(CustomerID),
    CONSTRAINT CK_AIFeedback_Rating CHECK (Rating BETWEEN 1 AND 5),
    CONSTRAINT UQ_AIFeedback_Message_Customer UNIQUE (AIConversationMessageID, CustomerID)
);

CREATE TABLE dbo.NotificationTemplates (
    NotificationTemplateID BIGINT IDENTITY(1,1) PRIMARY KEY,
    TemplateCode NVARCHAR(100) NOT NULL UNIQUE,
    TemplateName NVARCHAR(150) NOT NULL,
    Channel NVARCHAR(30) NOT NULL,
    SubjectTemplate NVARCHAR(300) NULL,
    BodyTemplate NVARCHAR(MAX) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_NotificationTemplates_IsActive DEFAULT 1,
    CONSTRAINT CK_NotificationTemplates_Channel CHECK (Channel IN (N'InApp', N'Email', N'SMS', N'Push'))
);

CREATE TABLE dbo.Notifications (
    NotificationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID BIGINT NOT NULL,
    NotificationTemplateID BIGINT NULL,
    Title NVARCHAR(250) NOT NULL,
    MessageContent NVARCHAR(2000) NOT NULL,
    NotificationType NVARCHAR(50) NULL,
    RelatedEntityType NVARCHAR(100) NULL,
    RelatedEntityID BIGINT NULL,
    IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
    SentAt DATETIME2(0) NOT NULL CONSTRAINT DF_Notifications_SentAt DEFAULT SYSDATETIME(),
    ReadAt DATETIME2(0) NULL,
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Notifications_Templates FOREIGN KEY (NotificationTemplateID) REFERENCES dbo.NotificationTemplates(NotificationTemplateID)
);

CREATE TABLE dbo.SystemSettings (
    SystemSettingID BIGINT IDENTITY(1,1) PRIMARY KEY,
    SettingKey NVARCHAR(150) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX) NULL,
    Description NVARCHAR(1000) NULL,
    UpdatedByUserID BIGINT NULL,
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SystemSettings_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_SystemSettings_Users FOREIGN KEY (UpdatedByUserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.AuditLogs (
    AuditLogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ActorUserID BIGINT NULL,
    Action NVARCHAR(100) NOT NULL,
    EntityName NVARCHAR(150) NOT NULL,
    EntityID NVARCHAR(100) NULL,
    OldValues NVARCHAR(MAX) NULL,
    NewValues NVARCHAR(MAX) NULL,
    Reason NVARCHAR(2000) NULL,
    IsEmergency BIT NOT NULL CONSTRAINT DF_AuditLogs_IsEmergency DEFAULT 0,
    IPAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (ActorUserID) REFERENCES dbo.Users(UserID)
);

CREATE UNIQUE INDEX UX_PetOwnershipHistory_AdoptionApplication ON dbo.PetOwnershipHistory(AdoptionApplicationID) WHERE AdoptionApplicationID IS NOT NULL;
CREATE UNIQUE INDEX UX_AdoptionListings_OpenPet ON dbo.AdoptionListings(PetID) WHERE ListingStatus IN (N'Draft', N'Available', N'Pending');
CREATE INDEX IX_AdoptionListings_PetID ON dbo.AdoptionListings(PetID);
CREATE INDEX IX_AdoptionApplications_CustomerID_CreatedAt ON dbo.AdoptionApplications(CustomerID, CreatedAt DESC);
CREATE UNIQUE INDEX UX_AdoptionApplications_LivePerCustomer ON dbo.AdoptionApplications(AdoptionListingID, CustomerID) WHERE ApplicationStatus IN (N'Pending', N'UnderReview', N'Approved', N'Completed');
CREATE UNIQUE INDEX UX_AdoptionApplications_OneApprovedPerListing ON dbo.AdoptionApplications(AdoptionListingID) WHERE ApplicationStatus IN (N'Approved', N'Completed');
CREATE INDEX IX_AdoptionHandoverAppointments_Pet_Time ON dbo.AdoptionHandoverAppointments(PetID, StartAt, EndAt) INCLUDE (ScheduleStatus, AdoptionHandoverAppointmentID);
CREATE INDEX IX_AdoptionHandoverAppointments_Station_Time ON dbo.AdoptionHandoverAppointments(RescueStationID, StartAt, EndAt) INCLUDE (ScheduleStatus, AdoptionHandoverAppointmentID);
CREATE UNIQUE INDEX UX_AdoptionHandoverAppointments_Application ON dbo.AdoptionHandoverAppointments(AdoptionApplicationID) WHERE ScheduleStatus IN (N'Scheduled', N'Confirmed', N'Completed');
CREATE INDEX IX_ReturnRequests_OrderID_RequestedAt ON dbo.ReturnRequests(OrderID, RequestedAt DESC);
CREATE INDEX IX_SupplierReturnRequests_PurchaseOrderID ON dbo.SupplierReturnRequests(PurchaseOrderID);
CREATE INDEX IX_SupplierReturnItems_GoodsReceiptDetailID ON dbo.SupplierReturnItems(GoodsReceiptDetailID);
CREATE INDEX IX_Refunds_PaymentID ON dbo.Refunds(PaymentID);
CREATE UNIQUE INDEX UX_PaymentTransactions_GatewayCode ON dbo.PaymentTransactions(GatewayName, GatewayTransactionCode, TransactionType) WHERE GatewayTransactionCode IS NOT NULL;
CREATE UNIQUE INDEX UX_PaymentTransactions_OneSuccessfulGatewayRefundPerRefund ON dbo.PaymentTransactions(RefundID) WHERE RefundID IS NOT NULL AND TransactionType = N'Refund' AND TransactionStatus = N'Success';
CREATE INDEX IX_PaymentTransactions_PaymentID ON dbo.PaymentTransactions(PaymentID);
CREATE INDEX IX_PaymentTransactions_RefundID ON dbo.PaymentTransactions(RefundID) WHERE RefundID IS NOT NULL;
CREATE INDEX IX_PetReminders_CustomerID_RemindAt ON dbo.PetReminders(CustomerID, RemindAt);
CREATE INDEX IX_PetReminders_PetID ON dbo.PetReminders(PetID);
CREATE INDEX IX_Reviews_ServiceID ON dbo.Reviews(ServiceID) WHERE ServiceID IS NOT NULL;
CREATE INDEX IX_Reviews_EmployeeID ON dbo.Reviews(EmployeeID) WHERE EmployeeID IS NOT NULL;
CREATE INDEX IX_ProductReviews_Product_Status ON dbo.ProductReviews(ProductID, ReviewStatus, CreatedAt DESC);
CREATE INDEX IX_ProductReviews_CustomerID ON dbo.ProductReviews(CustomerID);
CREATE INDEX IX_AIConversations_CustomerID_StartedAt ON dbo.AIConversations(CustomerID, StartedAt DESC);
CREATE INDEX IX_AIConversationMessages_Conversation_SentAt ON dbo.AIConversationMessages(AIConversationID, SentAt);
CREATE INDEX IX_Notifications_UserID_IsRead_SentAt ON dbo.Notifications(UserID, IsRead, SentAt DESC);
CREATE INDEX IX_AuditLogs_Entity_CreatedAt ON dbo.AuditLogs(EntityName, EntityID, CreatedAt DESC);
CREATE INDEX IX_AuditLogs_ActorUserID_CreatedAt ON dbo.AuditLogs(ActorUserID, CreatedAt DESC) WHERE ActorUserID IS NOT NULL;
GO

/* =========================================================
   PHẦN B - STORED PROCEDURES & TRIGGERS NGHIỆP VỤ
   ========================================================= */

CREATE OR ALTER PROCEDURE dbo.usp_RecalculateLeaveQuotaWarnings
    @EmployeeID BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH RankedLeaveDays AS
    (
        SELECT d.LeaveRequestDayID,
               ROW_NUMBER() OVER (
                   PARTITION BY lr.EmployeeID, YEAR(d.LeaveDate), MONTH(d.LeaveDate)
                   ORDER BY d.LeaveDate, d.LeaveRequestDayID
               ) AS DayNumber
        FROM dbo.LeaveRequestDays d
        INNER JOIN dbo.LeaveRequests lr ON lr.LeaveRequestID = d.LeaveRequestID
        WHERE lr.RequestStatus IN (N'Pending', N'Approved')
          AND (@EmployeeID IS NULL OR lr.EmployeeID = @EmployeeID)
    )
    UPDATE d
       SET IsOverQuota = CASE WHEN r.DayNumber > 4 THEN 1 ELSE 0 END
    FROM dbo.LeaveRequestDays d
    INNER JOIN RankedLeaveDays r ON r.LeaveRequestDayID = d.LeaveRequestDayID
    WHERE d.IsOverQuota <> CASE WHEN r.DayNumber > 4 THEN 1 ELSE 0 END;

    UPDATE lr
       SET ExceedsMonthlyLimitWarning = CASE WHEN EXISTS
           (SELECT 1 FROM dbo.LeaveRequestDays d
            WHERE d.LeaveRequestID = lr.LeaveRequestID AND d.IsOverQuota = 1)
           THEN 1 ELSE 0 END
    FROM dbo.LeaveRequests lr
    WHERE (@EmployeeID IS NULL OR lr.EmployeeID = @EmployeeID);
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_LeaveRequestDays_RecalculateQuota
ON dbo.LeaveRequestDays
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @EmployeeID BIGINT;
    DECLARE employee_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT lr.EmployeeID
        FROM dbo.LeaveRequests lr
        WHERE lr.LeaveRequestID IN (SELECT LeaveRequestID FROM inserted UNION SELECT LeaveRequestID FROM deleted);
    OPEN employee_cursor;
    FETCH NEXT FROM employee_cursor INTO @EmployeeID;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC dbo.usp_RecalculateLeaveQuotaWarnings @EmployeeID = @EmployeeID;
        FETCH NEXT FROM employee_cursor INTO @EmployeeID;
    END;
    CLOSE employee_cursor;
    DEALLOCATE employee_cursor;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_LeaveRequests_RecalculateQuota
ON dbo.LeaveRequests
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(RequestStatus)
    BEGIN
        DECLARE @EmployeeID BIGINT;
        DECLARE employee_cursor CURSOR LOCAL FAST_FORWARD FOR SELECT DISTINCT EmployeeID FROM inserted;
        OPEN employee_cursor;
        FETCH NEXT FROM employee_cursor INTO @EmployeeID;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC dbo.usp_RecalculateLeaveQuotaWarnings @EmployeeID = @EmployeeID;
            FETCH NEXT FROM employee_cursor INTO @EmployeeID;
        END;
        CLOSE employee_cursor;
        DEALLOCATE employee_cursor;
    END;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_AllocateReceivedMedicineToActiveDoctors
    @GoodsReceiptID BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM dbo.GoodsReceipts WHERE GoodsReceiptID = @GoodsReceiptID)
            THROW 50101, N'Không tìm thấy phiếu nhận hàng.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.DoctorMedicineAllocations a
            INNER JOIN dbo.GoodsReceiptDetails gd ON gd.GoodsReceiptDetailID = a.GoodsReceiptDetailID
            WHERE gd.GoodsReceiptID = @GoodsReceiptID
        )
            THROW 50102, N'Phiếu nhận hàng này đã được phân bổ thuốc; không thể phân bổ lặp lại.', 1;

        DECLARE @Doctors TABLE (EmployeeID BIGINT PRIMARY KEY, DoctorOrder INT NOT NULL, DoctorCount INT NOT NULL);
        INSERT INTO @Doctors(EmployeeID, DoctorOrder, DoctorCount)
        SELECT EmployeeID, ROW_NUMBER() OVER (ORDER BY EmployeeID), COUNT(*) OVER ()
        FROM dbo.EmployeeProfiles
        WHERE EmployeeType = N'Doctor' AND IsActive = 1;

        IF EXISTS (
            SELECT 1
            FROM dbo.GoodsReceiptDetails gd
            INNER JOIN dbo.PurchaseOrderDetails pod ON pod.PurchaseOrderDetailID = gd.PurchaseOrderDetailID
            INNER JOIN dbo.ProductVariants pv ON pv.ProductVariantID = pod.ProductVariantID
            INNER JOIN dbo.Products p ON p.ProductID = pv.ProductID
            INNER JOIN dbo.ProductCategories pc ON pc.ProductCategoryID = p.ProductCategoryID
            WHERE gd.GoodsReceiptID = @GoodsReceiptID AND gd.AcceptedQuantity > 0
              AND pc.CategoryName = N'Thuốc thú y'
        ) AND NOT EXISTS (SELECT 1 FROM @Doctors)
            THROW 50103, N'Không có bác sĩ đang hoạt động để nhận phân bổ thuốc.', 1;

        DECLARE @Allocation TABLE
        (GoodsReceiptDetailID BIGINT, EmployeeID BIGINT, ProductVariantID BIGINT, AllocatedQuantity INT, AllocatedByUserID BIGINT);

        INSERT INTO @Allocation(GoodsReceiptDetailID, EmployeeID, ProductVariantID, AllocatedQuantity, AllocatedByUserID)
        SELECT gd.GoodsReceiptDetailID, d.EmployeeID, pod.ProductVariantID,
               (gd.AcceptedQuantity / d.DoctorCount) +
               CASE WHEN d.DoctorOrder <= (gd.AcceptedQuantity % d.DoctorCount) THEN 1 ELSE 0 END,
               gr.ReceivedByUserID
        FROM dbo.GoodsReceiptDetails gd
        INNER JOIN dbo.PurchaseOrderDetails pod ON pod.PurchaseOrderDetailID = gd.PurchaseOrderDetailID
        INNER JOIN dbo.ProductVariants pv ON pv.ProductVariantID = pod.ProductVariantID
        INNER JOIN dbo.Products p ON p.ProductID = pv.ProductID
        INNER JOIN dbo.ProductCategories pc ON pc.ProductCategoryID = p.ProductCategoryID
        INNER JOIN dbo.GoodsReceipts gr ON gr.GoodsReceiptID = gd.GoodsReceiptID
        CROSS JOIN @Doctors d
        WHERE gd.GoodsReceiptID = @GoodsReceiptID AND gd.AcceptedQuantity > 0
          AND pc.CategoryName = N'Thuốc thú y';

        INSERT INTO dbo.DoctorMedicineAllocations
            (GoodsReceiptDetailID, EmployeeID, ProductVariantID, AllocatedQuantity, AllocatedByUserID)
        SELECT GoodsReceiptDetailID, EmployeeID, ProductVariantID, AllocatedQuantity, AllocatedByUserID
        FROM @Allocation WHERE AllocatedQuantity > 0;

        IF EXISTS (
            SELECT 1
            FROM dbo.GoodsReceiptDetails gd
            INNER JOIN dbo.PurchaseOrderDetails pod ON pod.PurchaseOrderDetailID = gd.PurchaseOrderDetailID
            INNER JOIN dbo.ProductVariants pv0 ON pv0.ProductVariantID = pod.ProductVariantID
            INNER JOIN dbo.Products p0 ON p0.ProductID = pv0.ProductID
            INNER JOIN dbo.ProductCategories pc0 ON pc0.ProductCategoryID = p0.ProductCategoryID
            LEFT JOIN dbo.InventoryBatches ib ON ib.GoodsReceiptDetailID = gd.GoodsReceiptDetailID
            WHERE gd.GoodsReceiptID = @GoodsReceiptID AND gd.AcceptedQuantity > 0
              AND pc0.CategoryName = N'Thuốc thú y'
              AND (ib.InventoryBatchID IS NULL OR ib.RemainingQuantity < gd.AcceptedQuantity)
        )
            THROW 50109, N'Lô thuốc không tồn tại hoặc số lượng lô không đủ để phân bổ.', 1;

        UPDATE ib
           SET RemainingQuantity = ib.RemainingQuantity - gd.AcceptedQuantity,
               BatchStatus = CASE WHEN ib.RemainingQuantity - gd.AcceptedQuantity = 0 THEN N'Depleted' ELSE ib.BatchStatus END
        FROM dbo.InventoryBatches ib
        INNER JOIN dbo.GoodsReceiptDetails gd ON gd.GoodsReceiptDetailID = ib.GoodsReceiptDetailID
        INNER JOIN dbo.PurchaseOrderDetails pod ON pod.PurchaseOrderDetailID = gd.PurchaseOrderDetailID
        INNER JOIN dbo.ProductVariants pv0 ON pv0.ProductVariantID = pod.ProductVariantID
        INNER JOIN dbo.Products p0 ON p0.ProductID = pv0.ProductID
        INNER JOIN dbo.ProductCategories pc0 ON pc0.ProductCategoryID = p0.ProductCategoryID
        WHERE gd.GoodsReceiptID = @GoodsReceiptID AND gd.AcceptedQuantity > 0
          AND pc0.CategoryName = N'Thuốc thú y';

        IF EXISTS (
            SELECT 1
            FROM (SELECT pod.ProductVariantID, SUM(gd.AcceptedQuantity) AS TotalAccepted
                  FROM dbo.GoodsReceiptDetails gd
                  INNER JOIN dbo.PurchaseOrderDetails pod ON pod.PurchaseOrderDetailID = gd.PurchaseOrderDetailID
                  INNER JOIN dbo.ProductVariants pv0 ON pv0.ProductVariantID = pod.ProductVariantID
                  INNER JOIN dbo.Products p0 ON p0.ProductID = pv0.ProductID
                  INNER JOIN dbo.ProductCategories pc0 ON pc0.ProductCategoryID = p0.ProductCategoryID
                  WHERE gd.GoodsReceiptID = @GoodsReceiptID AND gd.AcceptedQuantity > 0
                    AND pc0.CategoryName = N'Thuốc thú y'
                  GROUP BY pod.ProductVariantID) rt
            INNER JOIN dbo.ProductVariants pv WITH (UPDLOCK, HOLDLOCK) ON pv.ProductVariantID = rt.ProductVariantID
            WHERE pv.StockQuantity < rt.TotalAccepted
        )
            THROW 50108, N'Tồn kho chung không đủ để chuyển thuốc sang Hộp thuốc bác sĩ.', 1;

        ;WITH ReceiptTotals AS
        (
            SELECT pod.ProductVariantID, SUM(gd.AcceptedQuantity) AS TotalAccepted
            FROM dbo.GoodsReceiptDetails gd
            INNER JOIN dbo.PurchaseOrderDetails pod ON pod.PurchaseOrderDetailID = gd.PurchaseOrderDetailID
            INNER JOIN dbo.ProductVariants pv0 ON pv0.ProductVariantID = pod.ProductVariantID
            INNER JOIN dbo.Products p0 ON p0.ProductID = pv0.ProductID
            INNER JOIN dbo.ProductCategories pc0 ON pc0.ProductCategoryID = p0.ProductCategoryID
            WHERE gd.GoodsReceiptID = @GoodsReceiptID AND gd.AcceptedQuantity > 0
              AND pc0.CategoryName = N'Thuốc thú y'
            GROUP BY pod.ProductVariantID
        )
        UPDATE pv
           SET StockQuantity = pv.StockQuantity - rt.TotalAccepted
        FROM dbo.ProductVariants pv
        INNER JOIN ReceiptTotals rt ON rt.ProductVariantID = pv.ProductVariantID
        WHERE pv.StockQuantity >= rt.TotalAccepted;

        DECLARE @DoctorTotals TABLE (EmployeeID BIGINT, ProductVariantID BIGINT, TotalAllocated INT, PRIMARY KEY (EmployeeID, ProductVariantID));
        INSERT INTO @DoctorTotals(EmployeeID, ProductVariantID, TotalAllocated)
        SELECT EmployeeID, ProductVariantID, SUM(AllocatedQuantity)
        FROM @Allocation WHERE AllocatedQuantity > 0
        GROUP BY EmployeeID, ProductVariantID;

        UPDATE stock
           SET QuantityOnHand = stock.QuantityOnHand + dt.TotalAllocated, UpdatedAt = SYSDATETIME()
        FROM dbo.DoctorMedicineStocks stock
        INNER JOIN @DoctorTotals dt ON dt.EmployeeID = stock.EmployeeID AND dt.ProductVariantID = stock.ProductVariantID;

        INSERT INTO dbo.DoctorMedicineStocks(EmployeeID, ProductVariantID, QuantityOnHand)
        SELECT dt.EmployeeID, dt.ProductVariantID, dt.TotalAllocated
        FROM @DoctorTotals dt
        WHERE NOT EXISTS (SELECT 1 FROM dbo.DoctorMedicineStocks s WHERE s.EmployeeID = dt.EmployeeID AND s.ProductVariantID = dt.ProductVariantID);

        IF EXISTS (
            SELECT gd.GoodsReceiptDetailID
            FROM dbo.GoodsReceiptDetails gd
            INNER JOIN dbo.PurchaseOrderDetails pod ON pod.PurchaseOrderDetailID = gd.PurchaseOrderDetailID
            INNER JOIN dbo.ProductVariants pv0 ON pv0.ProductVariantID = pod.ProductVariantID
            INNER JOIN dbo.Products p0 ON p0.ProductID = pv0.ProductID
            INNER JOIN dbo.ProductCategories pc0 ON pc0.ProductCategoryID = p0.ProductCategoryID
            LEFT JOIN dbo.DoctorMedicineAllocations a ON a.GoodsReceiptDetailID = gd.GoodsReceiptDetailID
            WHERE gd.GoodsReceiptID = @GoodsReceiptID AND gd.AcceptedQuantity > 0
              AND pc0.CategoryName = N'Thuốc thú y'
            GROUP BY gd.GoodsReceiptDetailID, gd.AcceptedQuantity
            HAVING ISNULL(SUM(a.AllocatedQuantity), 0) <> gd.AcceptedQuantity
        )
            THROW 50104, N'Tổng số lượng phân bổ không bằng số lượng thực nhận.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_RecordDoctorMedicineUsage
    @EmployeeID BIGINT,
    @ProductVariantID BIGINT,
    @QuantityUsed INT,
    @UsedByUserID BIGINT,
    @ReferenceType NVARCHAR(50) = NULL,
    @ReferenceID BIGINT = NULL,
    @Notes NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @QuantityUsed <= 0 THROW 50105, N'Số lượng sử dụng phải lớn hơn 0.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.EmployeeProfiles
                   WHERE EmployeeID = @EmployeeID AND UserID = @UsedByUserID
                     AND EmployeeType = N'Doctor' AND IsActive = 1)
        THROW 50106, N'Tài khoản thực hiện không thuộc bác sĩ đang hoạt động được chỉ định.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;
        UPDATE dbo.DoctorMedicineStocks WITH (UPDLOCK, ROWLOCK)
           SET QuantityOnHand = QuantityOnHand - @QuantityUsed, UpdatedAt = SYSDATETIME()
        WHERE EmployeeID = @EmployeeID AND ProductVariantID = @ProductVariantID AND QuantityOnHand >= @QuantityUsed;

        IF @@ROWCOUNT = 0 THROW 50107, N'Hộp thuốc không đủ số lượng để ghi nhận sử dụng.', 1;

        INSERT INTO dbo.DoctorMedicineUsageHistory
            (EmployeeID, ProductVariantID, QuantityUsed, ReferenceType, ReferenceID, UsedByUserID, Notes)
        VALUES
            (@EmployeeID, @ProductVariantID, @QuantityUsed, @ReferenceType, @ReferenceID, @UsedByUserID, @Notes);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_MedicalRecords_DoctorOnly
ON dbo.MedicalRecords
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.EmployeeProfiles e ON e.EmployeeID = i.DoctorEmployeeID WHERE e.EmployeeType <> N'Doctor')
        THROW 50001, N'Only a Doctor can be recorded as the examining doctor of a medical record.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_Prescriptions_DoctorOnly
ON dbo.Prescriptions
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.EmployeeProfiles e ON e.EmployeeID = i.DoctorEmployeeID WHERE e.EmployeeType <> N'Doctor')
        THROW 50002, N'Only a Doctor can issue a prescription.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_AppointmentAssignments_RoleMatchesEmployee
ON dbo.AppointmentAssignments
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.EmployeeProfiles e ON e.EmployeeID = i.EmployeeID WHERE e.EmployeeType <> i.AssignmentRole)
        THROW 50003, N'The assignment role does not match the employee type.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ExtraShiftRequests_PartTimeCareStaff
ON dbo.ExtraShiftRequests
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.EmployeeProfiles e ON e.EmployeeID = i.EmployeeID WHERE e.EmployeeType <> N'CareStaff' OR ISNULL(e.EmploymentType, N'') <> N'PartTime')
        THROW 50005, N'Extra shifts can only be requested by part-time care staff.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_CartItems_PrescriptionRules
ON dbo.CartItems
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN dbo.ProductVariants v ON v.ProductVariantID = i.ProductVariantID
        JOIN dbo.Products p ON p.ProductID = v.ProductID
        WHERE p.IsPrescriptionOnly = 1 AND i.PrescriptionDetailID IS NULL
    )
        THROW 50006, N'A prescription-only product can only be added to the cart from a prescription.', 1;

    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN dbo.PrescriptionDetails d ON d.PrescriptionDetailID = i.PrescriptionDetailID
        WHERE d.ProductVariantID <> i.ProductVariantID
    )
        THROW 50007, N'The cart item does not match the product in the prescription.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_AdoptionHandoverAppointments_PreventOverlap
ON dbo.AdoptionHandoverAppointments
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN dbo.AdoptionApplications aa ON aa.AdoptionApplicationID = i.AdoptionApplicationID
        JOIN dbo.AdoptionListings al ON al.AdoptionListingID = aa.AdoptionListingID
        WHERE i.PetID <> al.PetID
           OR i.RescueStationID <> al.RescueStationID
           OR (i.ScheduleStatus IN (N'Scheduled', N'Confirmed') AND aa.ApplicationStatus <> N'Approved')
           OR (i.ScheduleStatus = N'Completed' AND aa.ApplicationStatus <> N'Completed')
    )
        THROW 51001, N'Lịch bàn giao phải khớp hồ sơ, thú cưng, trạm cứu hộ và trạng thái hồ sơ hợp lệ.', 1;

    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN dbo.AdoptionHandoverAppointments x WITH (UPDLOCK, HOLDLOCK, INDEX(IX_AdoptionHandoverAppointments_Pet_Time))
          ON x.PetID = i.PetID AND x.AdoptionHandoverAppointmentID <> i.AdoptionHandoverAppointmentID
         AND x.ScheduleStatus IN (N'Scheduled', N'Confirmed') AND i.ScheduleStatus IN (N'Scheduled', N'Confirmed')
         AND x.StartAt < i.EndAt AND x.EndAt > i.StartAt
    )
        THROW 51002, N'Thú cưng đã có lịch bàn giao khác bị trùng thời gian.', 1;

    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN dbo.AdoptionHandoverAppointments x WITH (UPDLOCK, HOLDLOCK, INDEX(IX_AdoptionHandoverAppointments_Station_Time))
          ON x.RescueStationID = i.RescueStationID AND x.AdoptionHandoverAppointmentID <> i.AdoptionHandoverAppointmentID
         AND x.ScheduleStatus IN (N'Scheduled', N'Confirmed') AND i.ScheduleStatus IN (N'Scheduled', N'Confirmed')
         AND x.StartAt < i.EndAt AND x.EndAt > i.StartAt
    )
        THROW 51003, N'Trạm cứu hộ đã có lịch bàn giao khác bị trùng thời gian.', 1;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ScheduleAdoptionHandover
    @AdoptionApplicationID BIGINT,
    @StartAt DATETIME2(0),
    @EndAt DATETIME2(0),
    @Notes NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @EndAt <= @StartAt
        THROW 51004, N'Thời gian kết thúc phải sau thời gian bắt đầu.', 1;

    DECLARE @PetID BIGINT, @RescueStationID BIGINT, @ApplicationStatus NVARCHAR(30);

    BEGIN TRY
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        BEGIN TRANSACTION;

        SELECT @PetID = al.PetID, @RescueStationID = al.RescueStationID, @ApplicationStatus = aa.ApplicationStatus
        FROM dbo.AdoptionApplications aa WITH (UPDLOCK, HOLDLOCK)
        JOIN dbo.AdoptionListings al WITH (UPDLOCK, HOLDLOCK) ON al.AdoptionListingID = aa.AdoptionListingID
        WHERE aa.AdoptionApplicationID = @AdoptionApplicationID;

        IF @PetID IS NULL THROW 51005, N'Không tìm thấy hồ sơ nhận nuôi.', 1;
        IF @ApplicationStatus <> N'Approved' THROW 51006, N'Chỉ hồ sơ đã được duyệt mới được đặt lịch bàn giao.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.AdoptionHandoverAppointments WITH (UPDLOCK, HOLDLOCK, INDEX(IX_AdoptionHandoverAppointments_Pet_Time))
            WHERE PetID = @PetID AND ScheduleStatus IN (N'Scheduled', N'Confirmed') AND StartAt < @EndAt AND EndAt > @StartAt
        )
            THROW 51007, N'Thú cưng đã có lịch bàn giao khác bị trùng thời gian.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.AdoptionHandoverAppointments WITH (UPDLOCK, HOLDLOCK, INDEX(IX_AdoptionHandoverAppointments_Station_Time))
            WHERE RescueStationID = @RescueStationID AND ScheduleStatus IN (N'Scheduled', N'Confirmed') AND StartAt < @EndAt AND EndAt > @StartAt
        )
            THROW 51008, N'Trạm cứu hộ đã có lịch bàn giao khác bị trùng thời gian.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.AdoptionHandoverAppointments WITH (UPDLOCK, HOLDLOCK)
            WHERE AdoptionApplicationID = @AdoptionApplicationID AND ScheduleStatus IN (N'Scheduled', N'Confirmed', N'Completed')
        )
            THROW 51009, N'Hồ sơ này đã có lịch bàn giao chưa hủy hoặc đã hoàn tất.', 1;

        INSERT INTO dbo.AdoptionHandoverAppointments
            (AdoptionApplicationID, PetID, RescueStationID, StartAt, EndAt, ScheduleStatus, Notes)
        VALUES
            (@AdoptionApplicationID, @PetID, @RescueStationID, @StartAt, @EndAt, N'Scheduled', @Notes);

        DECLARE @NewScheduleID BIGINT = SCOPE_IDENTITY();
        COMMIT TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

        SELECT * FROM dbo.AdoptionHandoverAppointments WHERE AdoptionHandoverAppointmentID = @NewScheduleID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_CreatePaymentRequest
    @CustomerID BIGINT,
    @PaymentMethodID INT,
    @PaymentCode NVARCHAR(100),
    @Amount DECIMAL(18,2),
    @IdempotencyKey NVARCHAR(150),
    @AppointmentID BIGINT = NULL,
    @OrderID BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF ((@AppointmentID IS NULL AND @OrderID IS NULL) OR (@AppointmentID IS NOT NULL AND @OrderID IS NOT NULL))
        THROW 51101, N'Một Payment phải thuộc đúng một lịch hẹn hoặc một đơn hàng.', 1;
    IF @Amount <= 0 OR NULLIF(LTRIM(RTRIM(@IdempotencyKey)), N'') IS NULL
        THROW 51102, N'Số tiền hoặc IdempotencyKey không hợp lệ.', 1;

    DECLARE @PaymentID BIGINT, @ExistingCustomerID BIGINT, @ExistingAppointmentID BIGINT,
            @ExistingOrderID BIGINT, @ExistingAmount DECIMAL(18,2), @ExistingMethodID INT,
            @ExistingStatus NVARCHAR(30),
            @TargetAppStatus NVARCHAR(30), @TargetPayTiming NVARCHAR(10),
            @TargetPayStatus NVARCHAR(20), @TargetPayExpiresAt DATETIME2(0),
            @TargetOrderStatus NVARCHAR(30);

    BEGIN TRY
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        BEGIN TRANSACTION;

        IF @AppointmentID IS NOT NULL
        BEGIN
            SELECT @TargetAppStatus = AppointmentStatus,
                   @TargetPayTiming = PaymentTiming,
                   @TargetPayStatus = PaymentStatus,
                   @TargetPayExpiresAt = PaymentExpiresAt
            FROM dbo.Appointments WITH (UPDLOCK, HOLDLOCK)
            WHERE AppointmentID = @AppointmentID;

            IF @TargetAppStatus IS NULL
                THROW 51113, N'Không tìm thấy lịch hẹn cần thanh toán.', 1;
            IF @TargetAppStatus IN (N'Cancelled', N'Rejected', N'NoShow')
                THROW 51111, N'Không thể thanh toán cho lịch hẹn đã hủy hoặc bị từ chối.', 1;
            IF @TargetPayTiming = N'Prepaid' AND @TargetPayStatus = N'Prepaid_Pending'
               AND @TargetPayExpiresAt IS NOT NULL AND @TargetPayExpiresAt < SYSDATETIME()
                THROW 51114, N'Thời hạn giữ chỗ thanh toán trả trước của lịch hẹn đã hết.', 1;
            IF @TargetPayStatus IN (N'Prepaid_Paid', N'Paid', N'Refunded')
                THROW 51110, N'Giao dịch này đã được thanh toán hoặc hoàn tiền trước đó.', 1;
        END
        ELSE
        BEGIN
            SELECT @TargetOrderStatus = OrderStatus
            FROM dbo.Orders WITH (UPDLOCK, HOLDLOCK)
            WHERE OrderID = @OrderID;

            IF @TargetOrderStatus IS NULL
                THROW 51113, N'Không tìm thấy đơn hàng cần thanh toán.', 1;
            IF @TargetOrderStatus = N'Cancelled'
                THROW 51111, N'Không thể thanh toán cho đơn hàng đã hủy.', 1;
        END;

        IF EXISTS (
            SELECT 1 FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK)
            WHERE PaymentStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded')
              AND ((@AppointmentID IS NOT NULL AND AppointmentID = @AppointmentID)
                   OR (@OrderID IS NOT NULL AND OrderID = @OrderID))
        )
            THROW 51110, N'Giao dịch này đã được thanh toán trước đó.', 1;

        SELECT @PaymentID = k.PaymentID
        FROM dbo.PaymentIdempotencyKeys k WITH (UPDLOCK, HOLDLOCK)
        WHERE k.IdempotencyKey = @IdempotencyKey;

        IF @PaymentID IS NOT NULL
        BEGIN
            SELECT @ExistingCustomerID = CustomerID, @ExistingAppointmentID = AppointmentID,
                   @ExistingOrderID = OrderID, @ExistingAmount = Amount, @ExistingMethodID = PaymentMethodID,
                   @ExistingStatus = PaymentStatus
            FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK) WHERE PaymentID = @PaymentID;

            IF @ExistingCustomerID <> @CustomerID
               OR ISNULL(@ExistingAppointmentID, -1) <> ISNULL(@AppointmentID, -1)
               OR ISNULL(@ExistingOrderID, -1) <> ISNULL(@OrderID, -1)
               OR @ExistingAmount <> @Amount OR @ExistingMethodID <> @PaymentMethodID
                THROW 51103, N'IdempotencyKey đã được sử dụng cho yêu cầu thanh toán khác.', 1;

            IF @ExistingStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded')
                THROW 51110, N'Giao dịch này đã được thanh toán trước đó.', 1;

            IF @ExistingStatus IN (N'Failed', N'Cancelled', N'Duplicate')
                THROW 51112, N'IdempotencyKey gắn với giao dịch đã thất bại hoặc bị hủy.', 1;
        END
        ELSE
        BEGIN
            SELECT TOP (1) @PaymentID = PaymentID
            FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK)
            WHERE PaymentStatus = N'Pending'
              AND CustomerID = @CustomerID
              AND ((@AppointmentID IS NOT NULL AND AppointmentID = @AppointmentID) OR (@OrderID IS NOT NULL AND OrderID = @OrderID));

            IF @PaymentID IS NOT NULL
            BEGIN
                UPDATE dbo.Payments
                SET PaymentMethodID = @PaymentMethodID,
                    Amount = @Amount,
                    PaymentCode = @PaymentCode
                WHERE PaymentID = @PaymentID AND PaymentStatus = N'Pending';
            END
            ELSE
            BEGIN
                INSERT INTO dbo.Payments(CustomerID, AppointmentID, OrderID, PaymentMethodID, PaymentCode, Amount, PaymentStatus)
                VALUES (@CustomerID, @AppointmentID, @OrderID, @PaymentMethodID, @PaymentCode, @Amount, N'Pending');
                SET @PaymentID = SCOPE_IDENTITY();
            END;

            INSERT INTO dbo.PaymentIdempotencyKeys(IdempotencyKey, PaymentID) VALUES (@IdempotencyKey, @PaymentID);
        END;

        COMMIT TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        SELECT * FROM dbo.Payments WHERE PaymentID = @PaymentID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProcessPaymentGatewayCallback
    @PaymentCode NVARCHAR(100),
    @GatewayName NVARCHAR(100),
    @GatewayTransactionCode NVARCHAR(200),
    @GatewayStatus NVARCHAR(20),
    @TransactionAmount DECIMAL(18,2),
    @RawResponse NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @GatewayStatus NOT IN (N'Success', N'Failed', N'Cancelled')
        THROW 51104, N'Trạng thái callback không hợp lệ.', 1;
    IF NULLIF(LTRIM(RTRIM(@GatewayTransactionCode)), N'') IS NULL OR @TransactionAmount < 0
        THROW 51105, N'Mã giao dịch hoặc số tiền callback không hợp lệ.', 1;

    DECLARE @PaymentID BIGINT, @ExpectedAmount DECIMAL(18,2), @PaymentStatus NVARCHAR(30),
            @AppointmentID BIGINT, @OrderID BIGINT, @MethodType NVARCHAR(30), @ExistingPaymentID BIGINT,
            @IsDuplicate BIT = 0, @TransactionStatus NVARCHAR(30);

    BEGIN TRY
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        BEGIN TRANSACTION;

        SELECT @PaymentID = PaymentID, @ExpectedAmount = Amount, @PaymentStatus = PaymentStatus,
               @AppointmentID = AppointmentID, @OrderID = OrderID
        FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK) WHERE PaymentCode = @PaymentCode;
        IF @PaymentID IS NULL THROW 51106, N'Không tìm thấy PaymentCode.', 1;

        SELECT @MethodType = PaymentMethodType
        FROM dbo.Payments p JOIN dbo.PaymentMethods pm ON pm.PaymentMethodID = p.PaymentMethodID
        WHERE p.PaymentID = @PaymentID;
        IF @MethodType <> N'OnlineGateway' THROW 51107, N'Payment này không sử dụng phương thức OnlineGateway.', 1;
        IF @TransactionAmount <> @ExpectedAmount THROW 51108, N'Số tiền callback không khớp số tiền Payment.', 1;

        SELECT @ExistingPaymentID = PaymentID
        FROM dbo.PaymentTransactions WITH (UPDLOCK, HOLDLOCK)
        WHERE GatewayName = @GatewayName AND GatewayTransactionCode = @GatewayTransactionCode AND TransactionType = N'Payment';

        IF @ExistingPaymentID IS NOT NULL
        BEGIN
            IF @ExistingPaymentID <> @PaymentID THROW 51109, N'Mã giao dịch cổng thanh toán đã được gắn với Payment khác.', 1;
            COMMIT TRANSACTION;
            SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
            SELECT N'AlreadyProcessed' AS ProcessingResult, * FROM dbo.Payments WHERE PaymentID = @PaymentID;
            RETURN;
        END;

        SET @TransactionStatus = @GatewayStatus;
        IF @GatewayStatus = N'Success'
        BEGIN
            IF @PaymentStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded', N'Duplicate', N'Cancelled')
                SET @IsDuplicate = 1;

            IF @IsDuplicate = 0 AND EXISTS (
                SELECT 1 FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK)
                WHERE PaymentID <> @PaymentID AND PaymentStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded')
                  AND ((@AppointmentID IS NOT NULL AND AppointmentID = @AppointmentID) OR (@OrderID IS NOT NULL AND OrderID = @OrderID))
            )
                SET @IsDuplicate = 1;

            INSERT INTO dbo.PaymentTransactions
                (PaymentID, GatewayName, GatewayTransactionCode, TransactionType, TransactionStatus, TransactionAmount, RawResponse, IsDuplicatePayment)
            VALUES
                (@PaymentID, @GatewayName, @GatewayTransactionCode, N'Payment', N'Success', @TransactionAmount, @RawResponse, @IsDuplicate);

            IF @IsDuplicate = 1
            BEGIN
                IF @PaymentStatus NOT IN (N'Paid', N'PartiallyRefunded', N'Refunded')
                    UPDATE dbo.Payments SET PaymentStatus = N'Duplicate' WHERE PaymentID = @PaymentID;
            END
            ELSE
                UPDATE dbo.Payments SET PaymentStatus = N'Paid', PaidAt = SYSDATETIME() WHERE PaymentID = @PaymentID;
        END
        ELSE
        BEGIN
            INSERT INTO dbo.PaymentTransactions
                (PaymentID, GatewayName, GatewayTransactionCode, TransactionType, TransactionStatus, TransactionAmount, RawResponse, IsDuplicatePayment)
            VALUES
                (@PaymentID, @GatewayName, @GatewayTransactionCode, N'Payment', @TransactionStatus, @TransactionAmount, @RawResponse, 0);

            IF @PaymentStatus = N'Pending'
                UPDATE dbo.Payments SET PaymentStatus = CASE WHEN @GatewayStatus = N'Failed' THEN N'Failed' ELSE N'Cancelled' END
                WHERE PaymentID = @PaymentID;
        END;

        COMMIT TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        SELECT CASE WHEN @IsDuplicate = 1 THEN N'DuplicatePaymentNeedsReconciliation' ELSE N'Processed' END AS ProcessingResult,
               p.*, @IsDuplicate AS IsDuplicatePayment
        FROM dbo.Payments p WHERE p.PaymentID = @PaymentID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_CreateRefundRequest
    @PaymentCode NVARCHAR(100),
    @RefundCode NVARCHAR(100),
    @IdempotencyKey NVARCHAR(150),
    @RefundAmount DECIMAL(18,2),
    @RefundMethod NVARCHAR(30),
    @ReturnRequestID BIGINT = NULL,
    @ProcessedByUserID BIGINT = NULL,
    @Notes NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @RefundAmount <= 0 OR NULLIF(LTRIM(RTRIM(@IdempotencyKey)), N'') IS NULL
        THROW 51201, N'Số tiền hoàn hoặc IdempotencyKey không hợp lệ.', 1;

    DECLARE @PaymentID BIGINT, @PaymentAmount DECIMAL(18,2), @PaymentStatus NVARCHAR(30),
            @ExistingRefundID BIGINT, @ReservedRefundAmount DECIMAL(18,2), @ExistingPaymentID BIGINT,
            @ExistingAmount DECIMAL(18,2), @ExistingMethod NVARCHAR(30);

    BEGIN TRY
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        BEGIN TRANSACTION;

        SELECT @ExistingRefundID = RefundID
        FROM dbo.RefundIdempotencyKeys WITH (UPDLOCK, HOLDLOCK)
        WHERE IdempotencyKey = @IdempotencyKey;

        IF @ExistingRefundID IS NOT NULL
        BEGIN
            SELECT @ExistingPaymentID = PaymentID, @ExistingAmount = RefundAmount, @ExistingMethod = RefundMethod
            FROM dbo.Refunds WITH (UPDLOCK, HOLDLOCK) WHERE RefundID = @ExistingRefundID;
            SELECT @PaymentID = PaymentID FROM dbo.Payments WHERE PaymentCode = @PaymentCode;
            IF @PaymentID IS NULL OR @ExistingPaymentID <> @PaymentID OR @ExistingAmount <> @RefundAmount OR @ExistingMethod <> @RefundMethod
                THROW 51202, N'IdempotencyKey đã được sử dụng cho yêu cầu hoàn tiền khác.', 1;
        END
        ELSE
        BEGIN
            SELECT @PaymentID = PaymentID, @PaymentAmount = Amount, @PaymentStatus = PaymentStatus
            FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK) WHERE PaymentCode = @PaymentCode;
            IF @PaymentID IS NULL THROW 51203, N'Không tìm thấy Payment cần hoàn tiền.', 1;
            IF @PaymentStatus NOT IN (N'Paid', N'PartiallyRefunded') THROW 51204, N'Chỉ Payment đã thanh toán mới được tạo yêu cầu hoàn tiền.', 1;

            SELECT @ReservedRefundAmount = ISNULL(SUM(RefundAmount), 0)
            FROM dbo.Refunds WITH (UPDLOCK, HOLDLOCK)
            WHERE PaymentID = @PaymentID AND RefundStatus IN (N'Pending', N'Processing', N'Completed');
            IF @ReservedRefundAmount + @RefundAmount > @PaymentAmount
                THROW 51205, N'Tổng tiền hoàn vượt quá số tiền Payment.', 1;

            INSERT INTO dbo.Refunds(PaymentID, ReturnRequestID, RefundCode, RefundAmount, RefundMethod, RefundStatus, ProcessedByUserID, Notes)
            VALUES (@PaymentID, @ReturnRequestID, @RefundCode, @RefundAmount, @RefundMethod, N'Pending', @ProcessedByUserID, @Notes);
            SET @ExistingRefundID = SCOPE_IDENTITY();
            INSERT INTO dbo.RefundIdempotencyKeys(IdempotencyKey, RefundID) VALUES (@IdempotencyKey, @ExistingRefundID);
        END;

        COMMIT TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        SELECT * FROM dbo.Refunds WHERE RefundID = @ExistingRefundID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProcessRefundGatewayCallback
    @RefundCode NVARCHAR(100),
    @GatewayName NVARCHAR(100),
    @GatewayTransactionCode NVARCHAR(200),
    @GatewayStatus NVARCHAR(20),
    @TransactionAmount DECIMAL(18,2),
    @RawResponse NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @GatewayStatus NOT IN (N'Success', N'Failed', N'Cancelled')
        THROW 51206, N'Trạng thái callback hoàn tiền không hợp lệ.', 1;
    IF NULLIF(LTRIM(RTRIM(@GatewayName)), N'') IS NULL OR NULLIF(LTRIM(RTRIM(@GatewayTransactionCode)), N'') IS NULL OR @TransactionAmount < 0
        THROW 51210, N'Tên cổng, mã giao dịch hoặc số tiền callback hoàn tiền không hợp lệ.', 1;

    DECLARE @RefundID BIGINT, @PaymentID BIGINT, @ExpectedAmount DECIMAL(18,2),
            @ExistingRefundID BIGINT, @NewRefundStatus NVARCHAR(30), @PaymentAmount DECIMAL(18,2),
            @CompletedRefundAmount DECIMAL(18,2);

    BEGIN TRY
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        BEGIN TRANSACTION;

        SELECT @RefundID = RefundID, @PaymentID = PaymentID, @ExpectedAmount = RefundAmount
        FROM dbo.Refunds WITH (UPDLOCK, HOLDLOCK) WHERE RefundCode = @RefundCode;
        IF @RefundID IS NULL THROW 51207, N'Không tìm thấy RefundCode.', 1;
        IF @TransactionAmount <> @ExpectedAmount THROW 51208, N'Số tiền callback hoàn tiền không khớp yêu cầu hoàn.', 1;

        SELECT @ExistingRefundID = RefundID
        FROM dbo.PaymentTransactions WITH (UPDLOCK, HOLDLOCK)
        WHERE GatewayName = @GatewayName AND GatewayTransactionCode = @GatewayTransactionCode AND TransactionType = N'Refund';
        IF @ExistingRefundID IS NOT NULL
        BEGIN
            IF @ExistingRefundID <> @RefundID THROW 51209, N'Mã giao dịch hoàn tiền đã được gắn với Refund khác.', 1;
            COMMIT TRANSACTION;
            SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
            SELECT N'AlreadyProcessed' AS ProcessingResult, * FROM dbo.Refunds WHERE RefundID = @RefundID;
            RETURN;
        END;

        SET @NewRefundStatus = CASE @GatewayStatus WHEN N'Success' THEN N'Completed' WHEN N'Failed' THEN N'Failed' ELSE N'Cancelled' END;
        INSERT INTO dbo.PaymentTransactions
            (PaymentID, GatewayName, GatewayTransactionCode, TransactionType, TransactionStatus, TransactionAmount, RawResponse, RefundID)
        VALUES
            (@PaymentID, @GatewayName, @GatewayTransactionCode, N'Refund', @GatewayStatus, @TransactionAmount, @RawResponse, @RefundID);

        UPDATE dbo.Refunds SET RefundStatus = @NewRefundStatus, ProcessedAt = SYSDATETIME() WHERE RefundID = @RefundID;

        IF @GatewayStatus = N'Success'
        BEGIN
            SELECT @PaymentAmount = Amount FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK) WHERE PaymentID = @PaymentID;
            SELECT @CompletedRefundAmount = ISNULL(SUM(RefundAmount), 0)
            FROM dbo.Refunds WITH (UPDLOCK, HOLDLOCK)
            WHERE PaymentID = @PaymentID AND RefundStatus = N'Completed';
            UPDATE dbo.Payments
            SET PaymentStatus = CASE WHEN @CompletedRefundAmount >= @PaymentAmount THEN N'Refunded' ELSE N'PartiallyRefunded' END
            WHERE PaymentID = @PaymentID;
        END;

        COMMIT TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        SELECT N'Processed' AS ProcessingResult, * FROM dbo.Refunds WHERE RefundID = @RefundID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        THROW;
    END CATCH;
END;
GO

/* =========================================================
   PHẦN C - DỮ LIỆU KHỞI TẠO (SEED)
   ========================================================= */

-- 1. Vai trò người dùng
DECLARE @Roles TABLE (RoleName NVARCHAR(50), Description NVARCHAR(255));
INSERT INTO @Roles VALUES
    (N'Customer',      N'Khách hàng (KH): tự đăng ký, đặt lịch, mua hàng Shop, nhận nuôi, chat AI'),
    (N'Doctor',        N'Bác sĩ thú y (BS): nhân sự full-time, khám bệnh, kê đơn thuốc'),
    (N'CareStaff',     N'Nhân viên chăm sóc thú cưng (NVCS): full-time hoặc part-time'),
    (N'Manager',       N'Quản lý nghiệp vụ chính (QL): tài khoản dùng chung nhiều phiên, do Admin cấp'),
    (N'Admin',         N'Admin hệ thống (AD): tạo tài khoản, quản lý mật khẩu Quản lý, chỉ xem dữ liệu vận hành'),
    (N'Supplier',      N'Nhà cung cấp (SUP): tài khoản do Admin cấp, xử lý đơn nhập hàng và công nợ'),
    (N'RescueStation', N'Trạm cứu hộ (TCH): đối tác liên kết, đăng tin và xét duyệt nhận nuôi');

INSERT INTO dbo.Roles (RoleName, Description)
SELECT r.RoleName, r.Description FROM @Roles r
WHERE NOT EXISTS (SELECT 1 FROM dbo.Roles x WHERE x.RoleName = r.RoleName);

-- 2. Danh sách quyền & ma trận phân quyền
DECLARE @Perm TABLE (PermissionCode NVARCHAR(100), PermissionName NVARCHAR(150), Roles NVARCHAR(100));
INSERT INTO @Perm VALUES
 (N'ACCOUNT.PROFILE_MANAGE',      N'Cập nhật thông tin cá nhân, sổ địa chỉ',               N'KH,BS,NVCS,QL,SUP,TCH,AD'),
 (N'ACCOUNT.PASSWORD_SELF_CHANGE',N'Tự đổi mật khẩu (không áp dụng cho tài khoản Quản lý)', N'KH,BS,NVCS,SUP,TCH,AD'),
 (N'ACCOUNT.USER_VIEW',           N'Xem, tìm kiếm, lọc danh sách user',                    N'AD'),
 (N'ACCOUNT.USER_CREATE',         N'Tạo tài khoản nội bộ và đối tác',                      N'AD'),
 (N'ACCOUNT.USER_LOCK',           N'Khóa / mở khóa tài khoản',                             N'AD'),
 (N'ACCOUNT.MANAGER_PASSWORD_RESET', N'Đổi / cấp lại mật khẩu tài khoản Quản lý',          N'AD'),
 (N'SYSTEM.CONFIGURE',            N'Cấu hình tham số chung hệ thống',                      N'AD'),
 (N'SYSTEM.OPERATIONS_VIEW',      N'Tra cứu dữ liệu vận hành (chỉ xem)',                   N'AD'),
 (N'PET.VIEW',                    N'Xem hồ sơ thú cưng',                                   N'KH,BS,NVCS,QL,AD'),
 (N'PET.MANAGE',                  N'Tạo, cập nhật, lưu trữ hồ sơ thú cưng',                N'BS,QL'),
 (N'HEALTHBOOK.VIEW',             N'Xem sổ sức khỏe',                                      N'KH,BS,QL,AD'),
 (N'HEALTHBOOK.UPDATE',           N'Cập nhật sổ sức khỏe sau khám',                        N'BS'),
 (N'DOCTOR_MEDICINE_STOCK.VIEW',  N'Xem tồn thuốc trên Hộp thuốc bác sĩ',                  N'BS,QL,AD'),
 (N'DOCTOR_MEDICINE_STOCK.USE',   N'Ghi nhận sử dụng thuốc từ Hộp thuốc cá nhân',         N'BS'),
 (N'DOCTOR_MEDICINE.REQUEST',     N'Gửi yêu cầu bổ sung thuốc',                            N'BS'),
 (N'DOCTOR_MEDICINE.DISCONTINUE_REQUEST', N'Gửi yêu cầu ngừng kinh doanh/xóa thuốc khỏi Shop', N'BS'),
 (N'DOCTOR_MEDICINE.ALLOCATION_MANAGE', N'Quản lý phân bổ thuốc cho các bác sĩ',              N'QL'),
 (N'SERVICE.VIEW',                N'Xem danh mục dịch vụ',                                 N'KH,BS,NVCS,QL,AD'),
 (N'SERVICE.MANAGE',              N'Quản lý danh mục dịch vụ và phân công nhân sự',        N'QL'),
 (N'STAFF.DIRECTORY_VIEW',        N'Xem hồ sơ, tìm kiếm Bác sĩ / NVCS',                    N'KH,BS,NVCS,QL,AD'),
 (N'STAFF.PROFILE_MANAGE',        N'Cập nhật hồ sơ chuyên môn, chứng chỉ của mình',        N'BS,NVCS'),
 (N'STAFF.CERT_APPROVE',          N'Phê duyệt / từ chối chứng chỉ nhân sự',                N'QL'),
 (N'STAFF.SCHEDULE_MANAGE',       N'Quản lý thông tin nhân sự và lịch làm việc',           N'QL'),
 (N'STAFF.SCHEDULE_VIEW',         N'Xem lịch làm việc',                                    N'BS,NVCS,QL,AD'),
 (N'LEAVE.REQUEST',               N'Đăng ký nghỉ phép cả ngày',                            N'BS,NVCS'),
 (N'EXTRASHIFT.REQUEST',          N'Đăng ký ca làm thêm (NVCS part-time)',                 N'NVCS'),
 (N'STAFF.REQUEST_APPROVE',       N'Duyệt nghỉ phép và yêu cầu đăng ký ca part-time',       N'QL'),
 (N'STAFF.ABSENCE_VIEW',          N'Theo dõi vắng mặt',                                    N'QL,AD'),
 (N'BOOKING.CREATE',              N'Đặt lịch dịch vụ',                                     N'KH'),
 (N'BOOKING.SELF_MANAGE',         N'Hủy / đổi lịch hẹn của mình',                          N'KH'),
 (N'BOOKING.VIEW',                N'Xem chi tiết và lịch sử lịch hẹn',                     N'KH,BS,NVCS,QL,AD'),
 (N'BOOKING.HANDLE',              N'Xác nhận, thực hiện, hoàn thành lịch hẹn',             N'BS,NVCS'),
 (N'BOOKING.REJECT',              N'Từ chối / điều phối lại lịch hẹn',                     N'BS,QL'),
 (N'BOOKING.OVERSEE',             N'Xác nhận bước dịch vụ, xử lý ngoại lệ lịch hẹn',      N'QL'),
 (N'SPAY.PAY',                    N'Thanh toán dịch vụ',                                   N'KH'),
 (N'SPAY.CONFIRM_COLLECTION',     N'Xác nhận thu tiền dịch vụ trả sau',                    N'QL,BS,NVCS'),
 (N'SPAY.REFUND',                 N'Xử lý hoàn tiền dịch vụ',                              N'QL'),
 (N'SPAY.VIEW',                   N'Xem thanh toán dịch vụ',                               N'KH,QL,AD'),
 (N'REVIEW.CREATE',               N'Đánh giá Bác sĩ và dịch vụ',                           N'KH'),
 (N'REVIEW.VIEW',                 N'Xem đánh giá',                                         N'KH,BS,NVCS,QL,AD'),
 (N'REVIEW.MODERATE',             N'Kiểm duyệt đánh giá',                                  N'QL'),
 (N'AI.CHAT',                     N'Chat hỗ trợ AI',                                       N'KH'),
 (N'MEDICAL.EXAMINE',             N'Khám, chẩn đoán, ghi nhận kết quả lâm sàng',           N'BS'),
 (N'PRESCRIPTION.ISSUE',          N'Kê đơn thuốc',                                         N'BS'),
 (N'PRESCRIPTION.VIEW',           N'Xem đơn thuốc',                                        N'KH,BS,QL,AD'),
 (N'PRESCRIPTION.REFILL',         N'Mua lại thuốc theo đơn',                               N'KH'),
 (N'DRUGPROPOSAL.CREATE',         N'Đề xuất nhập thuốc mới',                               N'BS'),
 (N'DRUGPROPOSAL.REVIEW',         N'Duyệt đề xuất nhập thuốc',                             N'QL'),
 (N'DRUGPROPOSAL.VIEW',           N'Xem đề xuất nhập thuốc',                               N'BS,QL,AD'),
 (N'PRODUCT.VIEW',                N'Xem sản phẩm Shop',                                    N'KH,BS,NVCS,QL,AD'),
 (N'PRODUCT.MANAGE',              N'Quản lý sản phẩm và danh mục Shop',                    N'QL'),
 (N'CART.MANAGE',                 N'Quản lý giỏ hàng',                                     N'KH'),
 (N'ORDER.PLACE',                 N'Đặt hàng và thanh toán đơn Shop',                      N'KH'),
 (N'ORDER.VIEW',                  N'Xem đơn hàng',                                         N'KH,QL,AD'),
 (N'ORDER.PROCESS',               N'Xác nhận và xử lý đơn hàng',                           N'QL'),
 (N'PRODUCTREVIEW.CREATE',        N'Đánh giá, bình luận sản phẩm',                         N'KH'),
 (N'PRODUCTREVIEW.MODERATE',      N'Kiểm duyệt bình luận sản phẩm',                        N'QL'),
 (N'VOUCHER.USE',                 N'Áp dụng voucher',                                      N'KH'),
 (N'VOUCHER.MANAGE',              N'Quản lý voucher và khuyến mãi',                        N'QL'),
 (N'VOUCHER.VIEW',                N'Xem voucher và hiệu quả khuyến mãi',                   N'QL,AD'),
 (N'INVENTORY.MANAGE',            N'Quản lý tồn kho',                                      N'QL'),
 (N'INVENTORY.VIEW',              N'Xem tồn kho',                                          N'QL,AD'),
 (N'SUPPLIER.PROFILE_MANAGE',     N'Cập nhật hồ sơ nhà cung cấp',                          N'SUP'),
 (N'SUPPLIER.CATALOG_MANAGE',     N'Quản lý danh mục hàng cung cấp',                       N'SUP'),
 (N'SUPPLIER.VIEW',               N'Xem hồ sơ và danh mục nhà cung cấp',                   N'QL,AD'),
 (N'PURCHASE.MANAGE',             N'Tạo PO, nhận hàng, yêu cầu trả hàng cho nhà cung cấp', N'QL'),
 (N'PURCHASE.RESPOND',            N'Xử lý PO và giao hàng (nhà cung cấp)',                 N'SUP'),
 (N'PURCHASE.VIEW',               N'Xem đơn nhập hàng',                                    N'QL,SUP,AD'),
 (N'PAYABLE.VIEW',                N'Xem công nợ và đối soát nhà cung cấp',                 N'QL,SUP,AD'),
 (N'ADOPTION.BROWSE',             N'Xem, tìm kiếm thú cưng cần nhận nuôi',                 N'KH'),
 (N'ADOPTION.APPLY',              N'Gửi và theo dõi yêu cầu nhận nuôi',                    N'KH'),
 (N'ADOPTION.HANDOVER_CONFIRM',   N'Xác nhận bàn giao thú cưng',                           N'KH,TCH'),
 (N'ADOPTION.STATION_MANAGE',     N'Quản lý hồ sơ trạm, tin đăng, xét duyệt nhận nuôi',    N'TCH'),
 (N'ADOPTION.OVERSEE',            N'Giám sát nhận nuôi, gỡ tin, tạo hồ sơ pet sau bàn giao', N'QL'),
 (N'ADOPTION.FOLLOWUP',           N'Theo dõi thú cưng sau nhận nuôi',                      N'TCH,QL'),
 (N'ADOPTION.VIEW',               N'Xem dữ liệu nhận nuôi',                                N'AD'),
 (N'SHIPPING.MANAGE',             N'Quản lý vận chuyển đơn hàng',                          N'QL'),
 (N'SHIPPING.VIEW',               N'Xem vận chuyển đơn hàng',                              N'KH,QL,AD'),
 (N'RETURN.CREATE',               N'Gửi yêu cầu đổi trả / hoàn tiền',                      N'KH'),
 (N'RETURN.PROCESS',              N'Duyệt, xử lý đổi trả và hoàn tiền',                    N'QL'),
 (N'RETURN.VIEW',                 N'Xem yêu cầu đổi trả',                                  N'KH,QL,AD'),
 (N'ACCOUNTING.RECONCILE',        N'Đối soát kế toán',                                     N'QL'),
 (N'ACCOUNTING.VIEW',             N'Xem đối soát',                                         N'QL,AD'),
 (N'REPORT.VIEW',                 N'Xem dashboard và báo cáo',                             N'QL,AD'),
 (N'NOTIFICATION.VIEW',           N'Xem thông báo',                                        N'KH,BS,NVCS,QL,AD,SUP,TCH');

INSERT INTO dbo.Permissions (PermissionCode, PermissionName)
SELECT p.PermissionCode, p.PermissionName FROM @Perm p
WHERE NOT EXISTS (SELECT 1 FROM dbo.Permissions x WHERE x.PermissionCode = p.PermissionCode);

DECLARE @RoleMap TABLE (Abbr NVARCHAR(10), RoleName NVARCHAR(50));
INSERT INTO @RoleMap VALUES
    (N'KH', N'Customer'), (N'BS', N'Doctor'), (N'NVCS', N'CareStaff'), (N'QL', N'Manager'),
    (N'AD', N'Admin'), (N'SUP', N'Supplier'), (N'TCH', N'RescueStation');

INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
SELECT DISTINCT r.RoleID, pe.PermissionID
FROM @Perm p
CROSS APPLY STRING_SPLIT(p.Roles, N',') s
JOIN @RoleMap m ON m.Abbr = LTRIM(RTRIM(s.value))
JOIN dbo.Roles r ON r.RoleName = m.RoleName
JOIN dbo.Permissions pe ON pe.PermissionCode = p.PermissionCode
WHERE NOT EXISTS (SELECT 1 FROM dbo.RolePermissions rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = pe.PermissionID);

-- 3. Phương thức thanh toán
DECLARE @Pay TABLE (MethodCode NVARCHAR(50), MethodName NVARCHAR(100), PaymentMethodType NVARCHAR(30));
INSERT INTO @Pay VALUES
    (N'CASH',          N'Tiền mặt tại quầy',                       N'Cash'),
    (N'BANK_TRANSFER', N'Chuyển khoản ngân hàng',                  N'BankTransfer'),
    (N'E_WALLET',      N'Ví điện tử / cổng thanh toán trực tuyến', N'OnlineGateway');

INSERT INTO dbo.PaymentMethods (MethodCode, MethodName, PaymentMethodType)
SELECT p.MethodCode, p.MethodName, p.PaymentMethodType FROM @Pay p
WHERE NOT EXISTS (SELECT 1 FROM dbo.PaymentMethods x WHERE x.MethodCode = p.MethodCode);

-- 4. Ca làm việc
DECLARE @Shift TABLE (ShiftName NVARCHAR(100), StartTime TIME(0), EndTime TIME(0), BreakMinutes INT);
INSERT INTO @Shift VALUES
    (N'Cả ngày (Full-time)', '08:00', '17:00', 60),
    (N'Ca sáng (Part-time)', '08:00', '12:00', 0),
    (N'Ca chiều (Part-time)', '13:00', '17:00', 0);

INSERT INTO dbo.WorkShifts (ShiftName, StartTime, EndTime, BreakMinutes)
SELECT s.ShiftName, s.StartTime, s.EndTime, s.BreakMinutes FROM @Shift s
WHERE NOT EXISTS (SELECT 1 FROM dbo.WorkShifts x WHERE x.ShiftName = s.ShiftName);

-- 5. Loại nhắc lịch
DECLARE @Rem TABLE (ReminderTypeName NVARCHAR(100), Description NVARCHAR(500));
INSERT INTO @Rem VALUES
    (N'Tiêm phòng',              N'Nhắc lịch tiêm phòng cho thú cưng'),
    (N'Tẩy giun',                N'Nhắc lịch tẩy giun định kỳ'),
    (N'Tái khám',                N'Nhắc lịch tái khám theo hẹn của Bác sĩ'),
    (N'Uống thuốc',              N'Nhắc lịch uống thuốc theo đơn thuốc'),
    (N'Chăm sóc sau nhận nuôi',  N'Nhắc chăm sóc và khảo sát sau khi nhận nuôi (Tầng 3)');

INSERT INTO dbo.ReminderTypes (ReminderTypeName, Description)
SELECT r.ReminderTypeName, r.Description FROM @Rem r
WHERE NOT EXISTS (SELECT 1 FROM dbo.ReminderTypes x WHERE x.ReminderTypeName = r.ReminderTypeName);

-- 6. Loài và giống thú cưng
DECLARE @Sp TABLE (SpeciesName NVARCHAR(100), Description NVARCHAR(500));
INSERT INTO @Sp VALUES
    (N'Chó', NULL), (N'Mèo', NULL), (N'Thỏ', NULL), (N'Hamster', NULL), (N'Chim', NULL), (N'Khác', NULL);

INSERT INTO dbo.PetSpecies (SpeciesName, Description)
SELECT s.SpeciesName, s.Description FROM @Sp s
WHERE NOT EXISTS (SELECT 1 FROM dbo.PetSpecies x WHERE x.SpeciesName = s.SpeciesName);

DECLARE @Br TABLE (SpeciesName NVARCHAR(100), BreedName NVARCHAR(120));
INSERT INTO @Br VALUES
    (N'Chó', N'Poodle'), (N'Chó', N'Golden Retriever'), (N'Chó', N'Corgi'), (N'Chó', N'Husky'),
    (N'Chó', N'Pomeranian'), (N'Chó', N'Chihuahua'), (N'Chó', N'Alaska'), (N'Chó', N'Phú Quốc'),
    (N'Chó', N'Chó cỏ / lai'),
    (N'Mèo', N'Anh lông ngắn'), (N'Mèo', N'Ba Tư'), (N'Mèo', N'Munchkin'), (N'Mèo', N'Maine Coon'),
    (N'Mèo', N'Xiêm'), (N'Mèo', N'Mèo ta / lai');

INSERT INTO dbo.PetBreeds (SpeciesID, BreedName)
SELECT sp.SpeciesID, b.BreedName
FROM @Br b
JOIN dbo.PetSpecies sp ON sp.SpeciesName = b.SpeciesName
WHERE NOT EXISTS (SELECT 1 FROM dbo.PetBreeds x WHERE x.SpeciesID = sp.SpeciesID AND x.BreedName = b.BreedName);

-- 7. Danh mục dịch vụ và sản phẩm
DECLARE @SC TABLE (CategoryName NVARCHAR(150), Description NVARCHAR(500));
INSERT INTO @SC VALUES
    (N'Khám và điều trị',        N'Dịch vụ khám lâm sàng do Bác sĩ thực hiện'),
    (N'Tiêm phòng và tẩy giun',  N'Tiêm phòng, tẩy giun định kỳ'),
    (N'Spa và chải chuốt',       N'Dịch vụ chăm sóc do nhân viên chăm sóc thực hiện'),
    (N'Lưu trú và trông giữ',    N'Dịch vụ lưu trú, trông giữ thú cưng');

INSERT INTO dbo.ServiceCategories (CategoryName, Description)
SELECT c.CategoryName, c.Description FROM @SC c
WHERE NOT EXISTS (SELECT 1 FROM dbo.ServiceCategories x WHERE x.CategoryName = c.CategoryName);

DECLARE @PC TABLE (CategoryName NVARCHAR(150), Description NVARCHAR(500));
INSERT INTO @PC VALUES
    (N'Thức ăn',                      N'Thức ăn cho chó, mèo và thú cưng khác'),
    (N'Phụ kiện',                     N'Vòng cổ, đồ chơi, chuồng, ổ nằm...'),
    (N'Sản phẩm chăm sóc và vệ sinh', N'Sữa tắm, cát vệ sinh, dụng cụ chải lông...'),
    (N'Thuốc thú y',                  N'Thuốc dùng theo đơn của Bác sĩ (có cờ Thuốc kê đơn)'),
    (N'Vitamin và thực phẩm chức năng', N'Bổ sung dinh dưỡng, không cần đơn');

INSERT INTO dbo.ProductCategories (CategoryName, Description)
SELECT c.CategoryName, c.Description FROM @PC c
WHERE NOT EXISTS (SELECT 1 FROM dbo.ProductCategories x WHERE x.CategoryName = c.CategoryName);

-- 8. Cấu hình hệ thống
DECLARE @Set TABLE (SettingKey NVARCHAR(150), SettingValue NVARCHAR(MAX), Description NVARCHAR(1000));
INSERT INTO @Set VALUES
    (N'Appointment.PrepaidHoldMinutes',    N'10', N'BKG-01: thời gian giữ khung giờ khi chờ thanh toán trả trước (phút)'),
    (N'Appointment.LateNoShowMinutes',     N'15', N'BKG-07: khách đến trễ quá số phút này được xử lý như No-show'),
    (N'Leave.MonthlyQuotaDays',            N'4',  N'EXP-03/05: số ngày nghỉ tối đa mỗi tháng, reset đầu tháng, không cộng dồn'),
    (N'Inventory.ExpiryWarningDays',       N'30', N'ASSUMPTION - INV-04: cảnh báo lô hàng sắp hết hạn trước số ngày này'),
    (N'Manager.SharedActionLabel',         N'Đã xử lý bởi Quản lý', N'ACC-02: nhãn ghi nhận chung cho mọi thao tác của tài khoản Quản lý dùng chung');

INSERT INTO dbo.SystemSettings (SettingKey, SettingValue, Description)
SELECT s.SettingKey, s.SettingValue, s.Description FROM @Set s
WHERE NOT EXISTS (SELECT 1 FROM dbo.SystemSettings x WHERE x.SettingKey = s.SettingKey);

-- 9. Mẫu thông báo (InApp)
DECLARE @Tpl TABLE (TemplateCode NVARCHAR(100), TemplateName NVARCHAR(150), SubjectTemplate NVARCHAR(300), BodyTemplate NVARCHAR(MAX));
INSERT INTO @Tpl VALUES
 (N'APPOINTMENT_CREATED',   N'Lịch hẹn mới',               N'Có lịch hẹn mới {{AppointmentCode}}',       N'Lịch hẹn {{AppointmentCode}} cho {{PetName}} vào {{AppointmentAt}} đang chờ xác nhận.'),
 (N'APPOINTMENT_CONFIRMED', N'Lịch hẹn được xác nhận',     N'Lịch hẹn {{AppointmentCode}} đã được xác nhận', N'Lịch hẹn của {{PetName}} vào {{AppointmentAt}} đã được xác nhận.'),
 (N'APPOINTMENT_REJECTED',  N'Lịch hẹn bị từ chối',        N'Lịch hẹn {{AppointmentCode}} không thể thực hiện', N'Rất tiếc, lịch hẹn {{AppointmentCode}} không thể thực hiện. Lý do: {{Reason}}. Nếu đã trả trước, bạn sẽ được hoàn 100%.'),
 (N'APPOINTMENT_CANCELLED', N'Lịch hẹn đã hủy',            N'Lịch hẹn {{AppointmentCode}} đã hủy',        N'Lịch hẹn {{AppointmentCode}} đã được hủy.'),
 (N'APPOINTMENT_RESCHEDULED', N'Lịch hẹn được đổi',        N'Lịch hẹn {{AppointmentCode}} đã đổi giờ',    N'Lịch hẹn {{AppointmentCode}} được chuyển sang {{AppointmentAt}}.'),
 (N'APPOINTMENT_COMPLETED', N'Dịch vụ hoàn thành',         N'Dịch vụ cho {{PetName}} đã hoàn thành',      N'Dịch vụ của lịch hẹn {{AppointmentCode}} đã hoàn thành. Bạn có thể đánh giá dịch vụ.'),
 (N'SERVICE_PAYMENT_RECEIVED', N'Đã ghi nhận thanh toán dịch vụ', N'Đã nhận thanh toán {{Amount}}',    N'Hệ thống đã ghi nhận thanh toán {{Amount}} cho lịch hẹn {{AppointmentCode}}.'),
 (N'SERVICE_REFUND_REQUESTED', N'Yêu cầu hoàn tiền dịch vụ', N'Yêu cầu hoàn tiền lịch hẹn {{AppointmentCode}}', N'Có yêu cầu hoàn 100% tiền dịch vụ cho lịch hẹn {{AppointmentCode}} cần xử lý.'),
 (N'REFUND_COMPLETED',      N'Đã hoàn tiền',               N'Bạn đã được hoàn tiền {{Amount}}',           N'Khoản hoàn {{Amount}} đã được xử lý.'),
 (N'PET_REMINDER',          N'Nhắc lịch chăm sóc thú cưng', N'Nhắc lịch cho {{PetName}}',               N'{{ReminderType}} cho {{PetName}} vào {{DueDate}}.'),
 (N'PRESCRIPTION_ISSUED',   N'Đơn thuốc mới',              N'Đơn thuốc {{PrescriptionCode}} đã được phát hành', N'Bác sĩ đã kê đơn thuốc cho {{PetName}}. Vui lòng xem chi tiết trong sổ sức khỏe.'),
 (N'PRESCRIPTION_REFILLS_EXHAUSTED', N'Hết lượt mua lại thuốc', N'Đơn thuốc {{PrescriptionCode}} đã hết lượt mua lại', N'Đơn thuốc đã hết lượt mua lại. Hệ thống không gia hạn từ xa, vui lòng đặt lịch khám mới với Bác sĩ.'),
 (N'ORDER_STATUS_CHANGED',  N'Cập nhật đơn hàng',          N'Đơn hàng {{OrderCode}} {{OrderStatus}}',     N'Đơn hàng {{OrderCode}} đã chuyển sang trạng thái {{OrderStatus}}.'),
 (N'LOW_STOCK_ALERT',       N'Cảnh báo tồn kho thấp',      N'{{ProductName}} sắp hết hàng',               N'Tồn kho của {{ProductName}} còn {{Quantity}}, chạm ngưỡng tối thiểu.'),
 (N'EXPIRY_ALERT',          N'Cảnh báo sắp hết hạn',       N'Lô {{BatchNumber}} của {{ProductName}} sắp hết hạn', N'Lô {{BatchNumber}} hết hạn vào {{ExpiryDate}}, còn {{Quantity}} sản phẩm.'),
 (N'CERT_PENDING_REVIEW',   N'Chứng chỉ chờ duyệt',        N'{{EmployeeName}} gửi chứng chỉ chờ duyệt',   N'Có chứng chỉ mới cần Quản lý xem xét.'),
 (N'CERT_DECIDED',          N'Kết quả duyệt chứng chỉ',    N'Chứng chỉ của bạn đã được xử lý',            N'Chứng chỉ {{CertificateName}}: {{Decision}}. {{Reason}}'),
 (N'STAFF_REQUEST_PENDING', N'Đơn nhân sự chờ duyệt',      N'Có đơn {{RequestType}} chờ duyệt',           N'{{EmployeeName}} gửi đơn {{RequestType}} cho ngày {{WorkDate}}.'),
 (N'STAFF_REQUEST_DECIDED', N'Kết quả duyệt đơn nhân sự',  N'Đơn {{RequestType}} của bạn đã được xử lý',  N'Đơn {{RequestType}} ngày {{WorkDate}}: {{Decision}}. {{Reason}}'),
 (N'ADOPTION_APPLICATION_SUBMITTED', N'Yêu cầu nhận nuôi mới', N'Có yêu cầu nhận nuôi mới cho {{PetName}}', N'Có khách hàng gửi yêu cầu nhận nuôi {{PetName}}, cần xét duyệt.'),
 (N'ADOPTION_APPLICATION_DECIDED', N'Kết quả xét duyệt nhận nuôi', N'Yêu cầu nhận nuôi {{PetName}}: {{Decision}}', N'Trạm cứu hộ đã phản hồi yêu cầu nhận nuôi {{PetName}}: {{Decision}}.'),
 (N'PURCHASE_ORDER_STATUS_CHANGED', N'Cập nhật đơn nhập hàng', N'Đơn nhập {{PurchaseOrderCode}} {{PurchaseOrderStatus}}', N'Đơn nhập hàng {{PurchaseOrderCode}} đã chuyển sang trạng thái {{PurchaseOrderStatus}}.'),
 (N'DRUG_PROPOSAL_DECIDED', N'Kết quả đề xuất nhập thuốc', N'Đề xuất nhập {{DrugName}}: {{Decision}}',     N'Quản lý đã xử lý đề xuất nhập {{DrugName}}: {{Decision}}. {{Reason}}'),
 (N'DRUG_PROPOSAL_IMPORTED', N'Thuốc đề xuất đã có trong Shop', N'{{DrugName}} đã có trong Shop',         N'Thuốc {{DrugName}} bạn đề xuất đã được nhập kho và thêm vào Shop.');

INSERT INTO dbo.NotificationTemplates (TemplateCode, TemplateName, Channel, SubjectTemplate, BodyTemplate)
SELECT t.TemplateCode, t.TemplateName, N'InApp', t.SubjectTemplate, t.BodyTemplate FROM @Tpl t
WHERE NOT EXISTS (SELECT 1 FROM dbo.NotificationTemplates x WHERE x.TemplateCode = t.TemplateCode);
GO

PRINT N'AnimoraDB_Complete_ver1_5_Clean completed.';
GO

