USE [DB_Onboarding]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/****** Object:  Table [dbo].[documentos]    Script Date: 15/11/2023 11:29:27 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[documentos]') AND type in (N'U'))
DROP TABLE [dbo].[documentos]
GO

CREATE TABLE [dbo].[documentos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idsolicitud] [int] NOT NULL,
	[label] [varchar](100) NOT NULL,
	[name] [varchar](100) NOT NULL,
	[required] [int] NOT NULL,
	[originalname] [varchar](100) NOT NULL,
	[extension] [varchar](5) NOT NULL,
	[encoding] [varchar](10) NOT NULL,
	[mimetype] [varchar](50) NOT NULL,
	[buffer] [varbinary](max) NULL,
	[fsize] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[estados]    Script Date: 15/11/2023 11:31:24 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[estados]') AND type in (N'U'))
DROP TABLE [dbo].[estados]
GO

CREATE TABLE [dbo].[estados](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[estados]
           ([descripcion])
     VALUES
           ('En Proceso'),
		   ('Cancelado'),
		   ('Concluido')
GO

/****** Object:  Table [dbo].[estados_docu]    Script Date: 15/11/2023 11:36:34 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[estados_docu]') AND type in (N'U'))
DROP TABLE [dbo].[estados_docu]
GO

CREATE TABLE [dbo].[estados_docu](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[estados_docu]
           ([descripcion])
     VALUES
           ('Pendiente de firma'),
		   ('Firmado')
GO

/****** Object:  Table [dbo].[estados_valid]    Script Date: 15/11/2023 11:40:34 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[estados_valid]') AND type in (N'U'))
DROP TABLE [dbo].[estados_valid]
GO

CREATE TABLE [dbo].[estados_valid](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](30) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[estados_valid]
           ([descripcion])
     VALUES
           ('Pendiente'),
		   ('Sup. Max. Intentos'),
		   ('Forzado'),
		   ('Validado')
GO

/****** Object:  Table [dbo].[firmantes]    Script Date: 15/11/2023 11:43:05 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[firmantes]') AND type in (N'U'))
DROP TABLE [dbo].[firmantes]
GO

CREATE TABLE [dbo].[firmantes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idsolicitud] [int] NOT NULL,
	[sexo] [char](1) NOT NULL,
	[dni] [varchar](15) NOT NULL,
	[email] [varchar](150) NOT NULL,
	[phone] [varchar](25) NOT NULL,
	[validarenaper] [int] NOT NULL,
	[token] [varchar](100) NULL,
	[selfie] [varbinary](max) NULL,
	[frente] [varbinary](max) NULL,
	[dorso] [varbinary](max) NULL,
	[intentos] [int] NOT NULL,
	[fechavalid] [date] NULL,
	[mailid] [varchar](100) NULL,
	[idvalidacionestado] [int] NOT NULL,
	[detalle] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[passrecovery]    Script Date: 15/11/2023 11:44:42 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[passrecovery]') AND type in (N'U'))
DROP TABLE [dbo].[passrecovery]
GO

CREATE TABLE [dbo].[passrecovery](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[iduser] [int] NOT NULL,
	[email] [varchar](150) NOT NULL,
	[token] [varchar](10) NOT NULL,
	[fecha] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[solicitudes]    Script Date: 15/11/2023 11:45:21 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[solicitudes]') AND type in (N'U'))
DROP TABLE [dbo].[solicitudes]
GO

CREATE TABLE [dbo].[solicitudes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nrosolicitud] [varchar](100) NOT NULL,
	[f_ingreso] [date] NOT NULL,
	[f_estado] [date] NULL,
	[idestado] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[users]    Script Date: 15/11/2023 11:46:12 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
DROP TABLE [dbo].[users]
GO

CREATE TABLE [dbo].[users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[email] [varchar](100) NOT NULL,
	[firstname] [varchar](50) NOT NULL,
	[lastname] [varchar](50) NOT NULL,
	[password] [varchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[users]
           ([email]
           ,[firstname]
           ,[lastname]
           ,[password])
     VALUES
           ('hansjal@gmail.com', 'Hans', 'Araujo', '$2b$10$1jqVdHRsC3p7ELH6C5p.ietTO9Stl7Gxu2YynXkj06uLR5kLMIT7q')
GO

/****** Object:  Table [dbo].[userstemp]    Script Date: 15/11/2023 11:48:54 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[userstemp]') AND type in (N'U'))
DROP TABLE [dbo].[userstemp]
GO

CREATE TABLE [dbo].[userstemp](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[email] [varchar](100) NOT NULL,
	[firstname] [varchar](50) NOT NULL,
	[lastname] [varchar](50) NOT NULL,
	[password] [varchar](100) NOT NULL,
	[token] [varchar](10) NOT NULL,
	[fecha] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO