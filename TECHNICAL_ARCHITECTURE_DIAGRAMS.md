# 🔧 Advanced Technical Architecture Diagrams

**Version:** 1.0.0
**Date:** January 2025
**Companion to:** CONFLUENCE_DOCUMENTATION.md

---

## 📋 Table of Contents

1. [Backend Architecture Deep Dive](#backend-architecture-deep-dive)
2. [Frontend Architecture](#frontend-architecture)
3. [Database Architecture](#database-architecture)
4. [AI Services Architecture](#ai-services-architecture)
5. [WebSocket Communication](#websocket-communication)
6. [Request/Response Flow](#requestresponse-flow)
7. [Error Handling Architecture](#error-handling-architecture)
8. [Caching Strategy](#caching-strategy)
9. [Security Implementation](#security-implementation)
10. [Deployment Architecture](#deployment-architecture)

---

## 🖥️ Backend Architecture Deep Dive

### Layered Architecture Overview

```mermaid
graph TB
    subgraph "Presentation Layer"
        API["REST API Endpoints<br/>Express Router"]
        WS["WebSocket Server<br/>WS Library"]
        Docs["Swagger Docs<br/>API Documentation"]
    end

    subgraph "Application Layer"
        Controllers["Controllers<br/>Request Handlers"]
        Middleware["Middleware Stack<br/>Auth, Validation, Error"]
        Services["Business Logic Services<br/>Domain Logic"]
    end

    subgraph "Domain Layer"
        Models["Data Models<br/>Interfaces & Types"]
        Validators["Input Validators<br/>Zod Schemas"]
        Workflows["Workflow Engine<br/>State Machine"]
    end

    subgraph "Infrastructure Layer"
        DB["PostgreSQL Database<br/>Prisma ORM"]
        FS["File System<br/>Uploads, Reports"]
        Cache["In-Memory Cache<br/>Optional Redis"]
        Queue["Task Queue<br/>Bull/Agenda"]
    end

    subgraph "External Integrations"
        AI["AI Services<br/>Python FastAPI"]
        OpenAI["OpenAI API<br/>GPT-4o/GPT-4"]
        Allure["Allure Reports<br/>Test Reports"]
    end

    API --> Middleware
    WS --> Middleware
    Docs --> API

    Middleware --> Controllers
    Controllers --> Services
    Services --> Workflows
    Controllers --> Validators

    Services --> DB
    Services --> FS
    Services --> Cache
    Services --> Queue

    Services --> AI
    AI --> OpenAI
    Services --> Allure

    style API fill:#4CAF50
    style WS fill:#2196F3
    style Controllers fill:#FF9800
    style Services fill:#9C27B0
    style DB fill:#336791
    style AI fill:#68A063
```

### Middleware Pipeline

```mermaid
sequenceDiagram
    participant Client
    participant CORS as CORS Middleware
    participant RateLimit as Rate Limiter
    participant Helmet as Security Headers
    participant BodyParser as Body Parser
    participant Auth as Auth Middleware
    participant Validator as Input Validator
    participant Controller as Route Handler
    participant Error as Error Handler

    Client->>CORS: HTTP Request
    CORS->>RateLimit: Check Origin
    RateLimit->>Helmet: Check Rate Limit
    Helmet->>BodyParser: Add Security Headers
    BodyParser->>Auth: Parse Body
    Auth->>Validator: Verify JWT
    Validator->>Controller: Validate Schema
    Controller->>Controller: Execute Business Logic

    alt Success
        Controller-->>Client: HTTP Response
    else Error
        Controller->>Error: Pass Error
        Error-->>Client: Error Response
    end
```

### Controller-Service-Repository Pattern

```mermaid
graph LR
    subgraph "Controller Layer"
        AuthController["Auth Controller<br/>/api/auth/*"]
        ScriptController["Script Controller<br/>/api/scripts/*"]
        TestRunController["Test Run Controller<br/>/api/test-runs/*"]
        AIController["AI Controller<br/>/api/ai-*"]
    end

    subgraph "Service Layer"
        AuthService["Auth Service<br/>User Management"]
        ScriptService["Script Service<br/>CRUD Operations"]
        ExecutionService["Execution Service<br/>Test Runner"]
        AIService["AI Service<br/>AI Integration"]
        TestDataService["Test Data Service<br/>Data Generation"]
    end

    subgraph "Repository Layer"
        UserRepository["User Repository<br/>Prisma Queries"]
        ScriptRepository["Script Repository<br/>Prisma Queries"]
        TestRunRepository["Test Run Repository<br/>Prisma Queries"]
    end

    AuthController --> AuthService
    ScriptController --> ScriptService
    TestRunController --> ExecutionService
    AIController --> AIService

    AuthService --> UserRepository
    ScriptService --> ScriptRepository
    ExecutionService --> ScriptRepository
    ExecutionService --> TestRunRepository
    AIService --> TestDataService

    UserRepository --> DB[(("PostgreSQL"))]
    ScriptRepository --> DB
    TestRunRepository --> DB

    style AuthController fill:#E91E63
    style ScriptController fill:#9C27B0
    style TestRunController fill:#2196F3
    style AIController fill:#4CAF50
```

---

## 🎨 Frontend Architecture

### React Component Hierarchy

```mermaid
graph TD
    App[App.tsx]

    App --> Router["React Router<br/>BrowserRouter"]
    Router --> Login["Login Page"]
    Router --> Dashboard["Dashboard Layout"]

    Dashboard --> Sidebar["Sidebar Navigation"]
    Dashboard --> TopBar["Top Bar"]
    Dashboard --> Content["Main Content Area"]

    Sidebar --> NavItems["Navigation Items<br/>Overview, Scripts, Runs,<br/>Test Data, API Testing,<br/>DB Testing, Reports, Analytics"]

    Content --> Overview["Overview View"]
    Content --> Scripts["Scripts View"]
    Content --> TestRuns["Test Runs View"]
    Content --> TestDataManager["Test Data Manager"]
    Content --> ApiTesting["API Testing"]
    Content --> DatabaseTesting["Database Testing"]
    Content --> AllureReports["Allure Reports"]
    Content --> Analytics["Analytics Dashboard"]

    Scripts --> ScriptEnhancement["Script Enhancement Modal"]
    Scripts --> ImportScript["Import Script Modal"]
    Scripts --> ExecuteModal["Execute Modal"]

    ScriptEnhancement --> EnhancementOptions["Enhancement Options<br/>Selectors, Waits, Assertions,<br/>Page Objects, Error Handling"]
    ScriptEnhancement --> AIMode["AI Analysis Toggle<br/>ML Enhancement, XPath,<br/>Visual AI"]
    ScriptEnhancement --> TestDataGen["Test Data Generation<br/>Boundary, Positive, Negative,<br/>Security, Equivalence"]

    style App fill:#61DAFB
    style Dashboard fill:#90CAF9
    style ScriptEnhancement fill:#A5D6A7
    style TestDataGen fill:#CE93D8
```

### State Management Architecture

```mermaid
graph LR
    subgraph "Client State (Zustand)"
        AuthStore["Auth Store<br/>user, token, isAuthenticated"]
        ProjectStore["Project Store<br/>selectedProject, projects"]
        UISStore["UI Store<br/>modals, notifications, loading"]
    end

    subgraph "Server State (React Query)"
        QueryCache["Query Cache<br/>scripts, testRuns, projects"]
        MutationCache["Mutation Cache<br/>create, update, delete"]
    end

    subgraph "Local State (useState)"
        ComponentState["Component State<br/>form inputs, UI toggles"]
    end

    subgraph "Data Sources"
        API["REST API"]
        WebSocket["WebSocket"]
    end

    AuthStore --> API
    ProjectStore --> QueryCache
    UISStore --> ComponentState

    QueryCache --> API
    MutationCache --> API

    WebSocket --> UISStore

    ComponentState --> MutationCache
    QueryCache --> ComponentState

    style AuthStore fill:#FF6B6B
    style QueryCache fill:#4ECDC4
    style ComponentState fill:#95E1D3
```

### Data Flow in Frontend

```mermaid
sequenceDiagram
    actor User
    participant Component as React Component
    participant Hook as Custom Hook
    participant Query as React Query
    participant API as Axios
    participant Server as Backend API

    User->>Component: User Action (Click)
    Component->>Hook: Call Hook Function
    Hook->>Query: useMutation / useQuery
    Query->>API: HTTP Request
    API->>Server: Send Request
    Server-->>API: Response
    API-->>Query: Data
    Query-->>Hook: Return Data
    Hook-->>Component: Result
    Component->>Component: Update State
    Component-->>User: UI Update

    Note over Component,Server: Real-time Updates
    Server->>WebSocket: Broadcast Event
    WebSocket->>Query: Invalidate Cache
    Query->>Component: Refetch Data
    Component-->>User: Live Update
```

---

## 🗄️ Database Architecture

### PostgreSQL Schema Details

```mermaid
erDiagram
    User ||--o{ Project : creates
    User ||--o{ Script : owns
    User ||--o{ TestRun : executes
    User ||--o{ RefreshToken : has
    User ||--o{ TestDataFile : uploads
    User ||--o{ ApiRequest : creates
    User ||--o{ TestSuite : manages
    User ||--o{ PipelineState : tracks

    Project ||--o{ Script : contains

    Script ||--o{ TestRun : has
    Script ||--o{ SelfHealingLocator : uses
    Script ||--o{ TestDataFile : references
    Script ||--o{ Variable : defines
    Script ||--o{ Breakpoint : has
    Script ||--o{ PipelineState : tracks
    Script ||--o{ WorkflowHistory : has

    TestRun ||--o{ TestStep : contains
    TestRun ||--o{ AllureReport : generates

    TestDataFile ||--o{ TestDataRow : contains
    TestSuite ||--o{ TestDataFile : contains
```

### Database Indexing Strategy

```mermaid
graph TB
    subgraph "Primary Indexes"
        PK["Primary Keys<br/>id columns on all tables"]
    end

    subgraph "Foreign Key Indexes"
        FK["Foreign Key Columns<br/>userId, scriptId, projectId,<br/>suiteId, testRunId"]
    end

    subgraph "Unique Constraints"
        UK["Unique Columns<br/>email (User),<br/>name + projectId (Script)"]
    end

    subgraph "Query Performance Indexes"
        QPI["Frequently Queried Columns<br/>status (TestRun),<br/>language (Script),<br/>createdAt (all tables)"]
    end

    subgraph "Composite Indexes"
        CI["Multi-Column Indexes<br/>userId + createdAt (TestRun),<br/>scriptId + status (TestRun)"]
    end

    subgraph "Full-Text Search"
        FTS["Full-Text Indexes<br/>name, description (Script)<br/>name (Project)"]
    end

    PK --> DB[(("PostgreSQL Database"))]
    FK --> DB
    UK --> DB
    QPI --> DB
    CI --> DB
    FTS --> DB

    style PK fill:#4CAF50
    style FK fill:#2196F3
    style UK fill:#FF9800
    style QPI fill:#9C27B0
    style CI fill:#E91E63
    style FTS fill:#00BCD4
```

### Query Optimization Strategy

```mermaid
graph LR
    Query[SQL Query] --> Parser[Query Parser]
    Parser --> Analyzer[Query Analyzer<br/>EXPLAIN ANALYZE]
    Analyzer --> Planner[Query Planner<br/>Uses Indexes]

    Planner --> Strategy{Execution Strategy}
    Strategy -->|Simple Query| Direct[Index Scan]
    Strategy -->|Complex Query| Join[Join Multiple Tables]
    Strategy -->|Aggregation| Aggregate[Group By / Having]

    Direct --> Executor[Query Executor]
    Join --> Executor
    Aggregate --> Executor

    Executor --> Cache[Query Cache<br/>Optional Redis]
    Cache --> Result[Return Result]

    style Query fill:#2196F3
    style Analyzer fill:#FF9800
    style Planner fill:#4CAF50
    style Executor fill:#9C27B0
    style Cache fill:#FF5722
```

---

## 🤖 AI Services Architecture

### AI Analysis Service (Python FastAPI)

```mermaid
graph TB
    subgraph "AI Analysis Service - Port 8000"
        FastAPI["FastAPI Application"]
        Routes["API Routes"]
        ML["ML Processing"]
    end

    subgraph "Endpoints"
        Analyze["POST /analyze<br/>Script analysis"]
        XPath["POST /xpath-analysis<br/>Deep XPath analysis"]
        Visual["POST /visual-ai<br/>Screenshot comparison"]
        Enhance["POST /enhance<br/>Script enhancement"]
    end

    subgraph "Processing Pipeline"
        AST["AST Parser<br/>Babel Parser"]
        LLM["LLM Interface<br/>OpenAI API"]
        CV["Computer Vision<br/>PIL/OpenCV"]
        NLP["NLP Processing<br/>Transformers"]
    end

    subgraph "Data Models"
        ScriptModel["Script Model<br/>Code, AST, Locators"]
        LocatorModel["Locator Model<br/>Strategies, Confidence"]
        DiffModel["Diff Model<br/>Before, After, Changes"]
    end

    FastAPI --> Routes
    Routes --> Analyze
    Routes --> XPath
    Routes --> Visual
    Routes --> Enhance

    Analyze --> AST
    Analyze --> LLM
    XPath --> AST
    XPath --> LLM
    Visual --> CV
    Enhance --> LLM
    Enhance --> NLP

    AST --> ScriptModel
    LLM --> ScriptModel
    LLM --> LocatorModel
    CV --> DiffModel
    NLP --> DiffModel

    style FastAPI fill:#68A063
    style LLM fill:#10A37F
    style AST fill:#F5A623
    style CV fill:#E91E63
```

### Genie Test Data Service

```mermaid
graph TB
    subgraph "Genie API - Port 3000"
        Genie["Genie FastAPI"]
        Generator["Test Data Generator"]
    end

    subgraph "Data Type Endpoints"
        Boundary["POST /boundary/generate<br/>Boundary Values"]
        Positive["POST /positive/generate<br/>Valid Inputs"]
        Negative["POST /negative/generate<br/>Invalid Inputs"]
        Security["POST /security/generate<br/>SQL/XSS Injection"]
        Equivalence["POST /equivalence/generate<br/>Data Categories"]
    end

    subgraph "Generation Pipeline"
        Extract["Field Extractor<br/>GPT-4 Analysis"]
        Infer["Type Inference<br/>Smart Detection"]
        Generate["Data Generator<br/>Faker + GPT-4"]
        Validate["Data Validator<br/>Format Check"]
    end

    subgraph "Data Categories"
        Users["User Data<br/>email, password, name"]
        Ecommerce["E-commerce<br/>products, orders"]
        Finance["Finance<br/>amounts, dates"]
        Content["Content<br/>text, descriptions"]
    end

    Genie --> Boundary
    Genie --> Positive
    Genie --> Negative
    Genie --> Security
    Genie --> Equivalence

    Boundary --> Extract
    Positive --> Extract
    Negative --> Extract
    Security --> Extract
    Equivalence --> Extract

    Extract --> Infer
    Infer --> Generate
    Generate --> Validate

    Generate --> Users
    Generate --> Ecommerce
    Generate --> Finance
    Generate --> Content

    style Genie fill:#68A063
    style Extract fill:#10A37F
    style Generate fill:#4CAF50
```

### OpenAI Integration Flow

```mermaid
sequenceDiagram
    participant Client as Backend/Frontend
    participant AI as AI Service
    participant OpenAI as OpenAI API
    participant Cache as Response Cache

    Client->>AI: Request Analysis
    AI->>Cache: Check Cache

    alt Cache Hit
        Cache-->>AI: Cached Response
        AI-->>Client: Return Result
    else Cache Miss
        AI->>AI: Build Prompt
        AI->>OpenAI: API Request<br/>(GPT-4o/GPT-4)
        OpenAI->>OpenAI: Process Request
        OpenAI-->>AI: AI Response
        AI->>Cache: Store in Cache
        AI-->>Client: Return Result
    end

    Note over AI,OpenAI: Rate Limiting
    AI->>AI: Exponential Backoff
    AI->>OpenAI: Retry with Backoff
```

---

## 🔌 WebSocket Communication

### WebSocket Server Architecture

```mermaid
graph TB
    subgraph "WebSocket Server"
        WSServer["WebSocket Server<br/>Port 3001/ws"]
        AuthWS["WebSocket Auth<br/>Token Validation"]
        RoomManager["Room Manager<br/>Session Isolation"]
        EventEmitter["Event Emitter<br/>Pub/Sub Pattern"]
    end

    subgraph "Client Connections"
        Extension["Chrome Extension<br/>Test Executor"]
        Dashboard["Web Dashboard<br/>Real-time Updates"]
        CI["CI/CD Pipeline<br/>Build Integrations"]
    end

    subgraph "Event Types"
        TestEvents["Test Events<br/>start, progress, complete"]
        LogEvents["Log Events<br/>info, warn, error"]
        HealingEvents["Self-Healing<br/>healed, failed"]
        SystemEvents["System Events<br/>connected, disconnected"]
    end

    subgraph "Message Handlers"
        StartHandler["Start Handler<br/>Initialize Test Run"]
        ProgressHandler["Progress Handler<br/>Update Status"]
        LogHandler["Log Handler<br/>Store Logs"]
        CompleteHandler["Complete Handler<br/>Finalize Results"]
    end

    Extension --> WSServer
    Dashboard --> WSServer
    CI --> WSServer

    WSServer --> AuthWS
    AuthWS --> RoomManager
    RoomManager --> EventEmitter

    EventEmitter --> TestEvents
    EventEmitter --> LogEvents
    EventEmitter --> HealingEvents
    EventEmitter --> SystemEvents

    TestEvents --> StartHandler
    TestEvents --> ProgressHandler
    TestEvents --> CompleteHandler
    LogEvents --> LogHandler
    HealingEvents --> ProgressHandler

    style WSServer fill:#FF6B6B
    style EventEmitter fill:#4ECDC4
    style TestEvents fill:#95E1D3
```

### WebSocket Message Flow

```mermaid
stateDiagram-v2
    [*] --> Connecting: Client Connects
    Connecting --> Authenticating: Send Token
    Authenticating --> Authenticated: Token Valid
    Authenticating --> Rejected: Token Invalid
    Rejected --> [*]

    Authenticated --> Idle: Waiting for Events
    Idle --> TestRunning: Start Test Event
    TestRunning --> TestRunning: Progress Update
    TestRunning --> HealingRequired: Self-Healing Event
    HealingRequired --> TestRunning: Healing Applied
    HealingRequired --> TestFailed: Healing Failed
    TestRunning --> TestCompleted: Test Finished
    TestCompleted --> [*]
    TestFailed --> [*]

    note right of TestRunning
        Real-time Updates
        - Progress: 50%
        - Current Step
        - Logs
    end note

    note right of HealingRequired
        Self-Healing Flow
        - Broken Locator
        - AI Analysis
        - New Locator
        - Confidence Score
    end note
```

---

## 📨 Request/Response Flow

### Complete Request Lifecycle

```mermaid
sequenceDiagram
    actor Client
    participant DNS as DNS Resolver
    participant LB as Load Balancer
    participant Web as Web Server
    participant API as API Server
    participant DB as Database
    participant Cache as Cache Layer
    participant AI as AI Service

    Client->>DNS: DNS Lookup
    DNS-->>Client: IP Address

    Client->>LB: HTTP Request
    LB->>Web: Forward Request

    Web->>API: Proxy Pass

    API->>Cache: Check Cache

    alt Cache Hit
        Cache-->>API: Cached Data
        API-->>Web: Response
        Web-->>Client: HTTP Response
    else Cache Miss
        API->>DB: Query Database
        DB-->>API: Data

        alt Needs AI
            API->>AI: AI Request
            AI-->>API: AI Response
        end

        API->>Cache: Store in Cache
        API-->>Web: Response
        Web-->>Client: HTTP Response
    end
```

### API Response Format Standards

```mermaid
graph LR
    subgraph "Success Response"
        Success{"success": true}
        Data["data: {...}"]
        Message["message: 'Operation successful'"]
        Success --> Data
        Success --> Message
    end

    subgraph "Error Response"
        Error{"success": false}
        ErrorCode["error: 'ERROR_CODE'"]
        ErrorMsg["message: 'Human readable error'"]
        Details["details: {...}<br/>Stack trace, validation errors"]
        Error --> ErrorCode
        Error --> ErrorMsg
        Error --> Details
    end

    subgraph "Paginated Response"
        Paginated{"data: [...]}
        Meta["meta: {<br/>page: 1,<br/>limit: 10,<br/>total: 100,<br/>totalPages: 10<br/>}"]
        Paginated --> Meta
    end

    style Success fill:#4CAF50
    style Error fill:#F44336
    style Paginated fill:#2196F3
```

---

## ⚠️ Error Handling Architecture

### Error Handling Pipeline

```mermaid
graph TB
    Request[Incoming Request] --> Try{Try Block}

    Try --> Controller[Controller Logic]
    Controller --> Service[Service Layer]
    Service --> Database[Database Operation]

    Database --> Success{Success?}
    Success -->|Yes| Response[Send Response]
    Success -->|No| Error[Error Occurred]

    Controller --> ValidationError{Validation<br/>Error?}
    ValidationError -->|Yes| ValidationErr[400 Bad Request]
    ValidationError -->|No| Service

    Service --> AuthError{Auth<br/>Error?}
    AuthError -->|Yes| AuthErr[401/403 Error]
    AuthError -->|No| Database

    Error --> ErrorType{Error Type}
    ErrorType -->|Prisma| DBErr[Database Error]
    ErrorType -->|Network| NetErr[Network Error]
    ErrorType -->|AI| AIErr[AI Service Error]
    ErrorType -->|Unknown| UnknownErr[Unknown Error]

    DBErr --> Log[Log Error]
    NetErr --> Log
    AIErr --> Log
    UnknownErr --> Log

    ValidationErr --> Log
    AuthErr --> Log

    Log --> Winston[Winston Logger]
    Winston --> File[File System<br/>error.log]
    Winston --> Console[Console Output]

    Log --> ErrorResponse[Error Response<br/>Middleware]
    ErrorResponse --> Client[Return to Client]

    style Try fill:#4CAF50
    style Error fill:#F44336
    style Log fill:#FF9800
    style Winston fill:#FFC107
    style Client fill:#2196F3
```

### Error Categories and Handling

```mermaid
graph TB
    subgraph "Client Errors (4xx)"
        BadRequest["400 Bad Request<br/>Invalid Input"]
        Unauthorized["401 Unauthorized<br/>Not Logged In"]
        Forbidden["403 Forbidden<br/>No Permission"]
        NotFound["404 Not Found<br/>Resource Missing"]
        Conflict["409 Conflict<br/>Duplicate Entry"]
        Validation["422 Validation Error<br/>Schema Mismatch"]
    end

    subgraph "Server Errors (5xx)"
        InternalError["500 Internal Error<br/>Unexpected Error"]
        NotAvailable["503 Service Unavailable<br/>AI Service Down"]
        Timeout["504 Gateway Timeout<br/>External API Timeout"]
    end

    subgraph "Custom Errors"
        ScriptError["Script Execution Error<br/>Test Failed"]
        HealingError["Self-Healing Error<br/>Cannot Recover"]
        DataError["Test Data Error<br/>Invalid Data"]
    end

    BadRequest --> Handler[Error Handler]
    Unauthorized --> Handler
    Forbidden --> Handler
    NotFound --> Handler
    Conflict --> Handler
    Validation --> Handler

    InternalError --> Handler
    NotAvailable --> Handler
    Timeout --> Handler

    ScriptError --> Handler
    HealingError --> Handler
    DataError --> Handler

    Handler --> Response[Standardized Response]

    style BadRequest fill:#FF9800
    style Unauthorized fill:#F44336
    style InternalError fill:#9C27B0
    style ScriptError fill:#2196F3
```

---

## 💾 Caching Strategy

### Multi-Layer Caching

```mermaid
graph TB
    Request[Incoming Request] --> L1{L1 Cache<br/>In-Memory}

    L1 -->|Hit| L1Hit[Return from Memory<br/>Map/Object]
    L1 -->|Miss| L2{L2 Cache<br/>Redis Optional}

    L2 -->|Hit| L2Hit[Return from Redis]
    L2 -->|Miss| L3{L3 Cache<br/>Database Query<br/>Plan Cache}

    L3 -->|Hit| L3Hit[Return from PG Cache]
    L3 -->|Miss| DB[Query Database]

    DB --> L3Store[Store in L3]
    L3Store --> L2Store[Store in L2]
    L2Store --> L1Store[Store in L1]

    L1Hit --> Response[Return Response]
    L2Hit --> Response
    L3Hit --> Response

    style L1 fill:#4CAF50
    style L2 fill:#2196F3
    style L3 fill:#FF9800
    style DB fill:#336791
```

### Cache Invalidation Strategy

```mermaid
graph LR
    subgraph "Cache Invalidation Triggers"
        Create["Create Operation<br/>Invalidate List Cache"]
        Update["Update Operation<br/>Invalidate Item Cache"]
        Delete["Delete Operation<br/>Invalidate All Cache"]
        Expire["TTL Expired<br/>Auto Remove"]
    end

    subgraph "Invalidation Patterns"
        CacheAside["Cache Aside<br/>Lazy Loading"]
        WriteThrough["Write Through<br/>Sync Update"]
        WriteBack["Write Back<br/>Async Update"]
    end

    subgraph "Cache Tags"
        UserTag["user:{id}"]
        ScriptTag["script:{id}"]
        ProjectTag["project:{id}"]
        ListTag["scripts:list"]
    end

    Create --> CacheAside
    Update --> WriteThrough
    Delete --> WriteBack

    CacheAside --> UserTag
    CacheAside --> ScriptTag
    CacheAside --> ProjectTag
    WriteThrough --> ListTag
    WriteBack --> ListTag

    style Create fill:#4CAF50
    style Update fill:#FF9800
    style Delete fill:#F44336
    style Expire fill:#2196F3
```

---

## 🔐 Security Implementation

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant JWT as JWT Service
    participant DB as Database
    participant RBAC as RBAC Engine

    User->>Frontend: Login Request
    Frontend->>API: POST /api/auth/login<br/>{email, password}
    API->>DB: Find User by Email
    DB-->>API: User Record

    alt User Found
        API->>API: Compare Password<br/>bcrypt.compare()
        alt Password Match
            API->>JWT: Generate Tokens
            JWT->>JWT: Sign with Secret
            JWT-->>API: Access + Refresh Tokens
            API->>DB: Update Last Login
            API-->>Frontend: Tokens + User Data
            Frontend->>Frontend: Store in localStorage
            Frontend-->>User: Redirect to Dashboard
        else Password Invalid
            API-->>Frontend: 401 Unauthorized
        end
    else User Not Found
        API-->>Frontend: 404 Not Found
    end

    Note over Frontend,RBAC: Protected Request
    Frontend->>API: Request + Authorization Header
    API->>JWT: Verify Token
    JWT-->>API: Decoded Payload
    API->>RBAC: Check Permissions
    RBAC->>RBAC: role + resource check
    RBAC-->>API: Has Access
    API-->>Frontend: Protected Resource
```

### Security Middleware Stack

```mermaid
graph TB
    Request[Incoming Request] --> MW1[Middleware 1<br/>CORS]

    MW1 --> Check1{Origin<br/>Allowed?}
    Check1 -->|No| CORS_Error[403 CORS Error]
    Check1 -->|Yes| MW2[Middleware 2<br/>Rate Limiting]

    MW2 --> Check2{Within<br/>Limits?}
    Check2 -->|No| Rate_Error[429 Too Many Requests]
    Check2 -->|Yes| MW3[Middleware 3<br/>Helmet Security]

    MW3 --> MW4[Middleware 4<br/>Body Parser]

    MW4 --> MW5[Middleware 5<br/>Request Logger]

    MW5 --> MW6[Middleware 6<br/>JWT Authentication]

    MW6 --> Check3{Token<br/>Valid?}
    Check3 -->|No| Auth_Error[401 Unauthorized]
    Check3 -->|Yes| MW7[Middleware 7<br/>Role Check]

    MW7 --> Check4{Has<br/>Permission?}
    Check4 -->|No| Forbid_Error[403 Forbidden]
    Check4 -->|Yes| MW8[Middleware 8<br/>Input Validation]

    MW8 --> Check5{Schema<br/>Valid?}
    Check5 -->|No| Valid_Error[400 Bad Request]
    Check5 -->|Yes| Controller[Route Handler]

    Controller --> Response[Send Response]

    style MW1 fill:#4CAF50
    style MW6 fill:#2196F3
    style MW7 fill:#FF9800
    style MW8 fill:#9C27B0
    style Controller fill:#E91E63
```

---

## 🚀 Deployment Architecture

### Production Deployment

```mermaid
graph TB
    subgraph "Load Balancer Layer"
        Nginx["Nginx Reverse Proxy<br/>SSL Termination<br/>Load Balancing"]
    end

    subgraph "Application Servers"
        Server1["Server 1<br/>Node.js + Frontend<br/>:3001, :5173"]
        Server2["Server 2<br/>Node.js + Frontend<br/>:3001, :5173"]
        Server3["Server 3<br/>Node.js + Frontend<br/>:3001, :5173"]
    end

    subgraph "AI Services"
        AI1["AI Analysis Service 1<br/>:8000"]
        AI2["AI Analysis Service 2<br/>:8000"]
        Genie["Genie API Service<br/>External"]
    end

    subgraph "Data Layer"
        PostgreSQL["PostgreSQL<br/>Primary Database"]
        Replica["PostgreSQL<br/>Read Replica"]
        Redis[(("Redis<br/>Cache & Sessions"))]
    end

    subgraph "File Storage"
        Allure["Allure Reports<br/>File System"]
        Uploads["User Uploads<br/>File System"]
        Backups["Database Backups<br/>S3/MinIO"]
    end

    subgraph "Monitoring"
        PM2["PM2 Process Manager"]
        Winston["Winston Logging"]
        Prometheus["Prometheus Metrics"]
        Grafana["Grafana Dashboard"]
    end

    Nginx --> Server1
    Nginx --> Server2
    Nginx --> Server3

    Server1 --> AI1
    Server2 --> AI2
    Server3 --> Genie

    Server1 --> PostgreSQL
    Server2 --> PostgreSQL
    Server3 --> PostgreSQL

    Server1 --> Redis
    Server2 --> Redis
    Server3 --> Redis

    PostgreSQL --> Replica
    PostgreSQL --> Backups

    Server1 --> Allure
    Server2 --> Uploads
    Server3 --> Allure

    Server1 --> PM2
    Server2 --> PM2
    Server3 --> PM2

    PM2 --> Winston
    Winston --> Prometheus
    Prometheus --> Grafana

    style Nginx fill:#009688
    style PostgreSQL fill:#336791
    style Redis fill:#DC382D
    style PM2 fill:#2B2B2B
```

### Docker Compose Architecture

```mermaid
graph TB
    subgraph "Docker Network"
        Network["Bridge Network<br/>playwright-crx-net"]
    end

    subgraph "Containers"
        Web["Web Container<br/>nginx:alpine<br/>Port 80/443"]
        Backend["Backend Container<br/>Node.js:20<br/>Port 3001"]
        Frontend["Frontend Container<br/>nginx:alpine<br/>Port 5173"]
        DB["PostgreSQL Container<br/>postgres:15<br/>Port 5433"]
        Redis["Redis Container<br/>redis:alpine<br/>Port 6379"]
        AI["AI Service Container<br/>python:3.11<br/>Port 8000"]
    end

    subgraph "Volumes"
        DBVol["postgres_data<br/>Named Volume"]
        RedisVol["redis_data<br/>Named Volume"]
        ReportsVol["allure_reports<br/>Bind Mount"]
        UploadsVol["uploads<br/>Bind Mount"]
    end

    subgraph "Environment"
        EnvFile[".env File<br/>Configuration"]
        SecretFile["docker-compose.secrets.yml<br/>Secrets"]
    end

    EnvFile --> Web
    EnvFile --> Backend
    EnvFile --> Frontend
    EnvFile --> DB
    EnvFile --> Redis
    EnvFile --> AI

    SecretFile --> Backend
    SecretFile --> AI

    Web --> Network
    Backend --> Network
    Frontend --> Network
    DB --> Network
    Redis --> Network
    AI --> Network

    Backend --> DBVol
    Backend --> RedisVol
    Backend --> ReportsVol
    Backend --> UploadsVol

    DB --> DBVol
    Redis --> RedisVol

    style Web fill:#009688
    style Backend fill:#68A063
    style DB fill:#336791
    style Redis fill:#DC382D
```

### CI/CD Pipeline

```mermaid
graph LR
    subgraph "Source Control"
        Git["Git Repository<br/>GitHub/GitLab"]
    end

    subgraph "CI Pipeline"
        Trigger["Push/PR Trigger"]
        Install["Install Dependencies<br/>npm ci"]
        Lint["Lint Code<br/>npm run lint"]
        Test["Run Tests<br/>npm test"]
        Build["Build<br/>npm run build"]
    end

    subgraph "Quality Gates"
        Sonar["SonarQube<br/>Code Quality"]
        Security["Security Scan<br/>Snyk/NPM Audit"]
        Coverage["Coverage Report<br/>Istanbul/nyc"]
    end

    subgraph "CD Pipeline"
        Docker["Build Docker Image"]
        Registry["Push to Registry<br/>Docker Hub/ECR"]
        Deploy["Deploy to Server<br/>kubectl/docker-compose"]
        Health["Health Check<br/>Smoke Tests"]
    end

    subgraph "Monitoring"
        Alert["Deployment Alert<br/>Slack/Email"]
        Rollback["Auto Rollback<br/>On Failure"]
    end

    Git --> Trigger
    Trigger --> Install
    Install --> Lint
    Lint --> Test
    Test --> Sonar
    Test --> Security
    Test --> Coverage

    Sonar --> Build{Pass?}
    Security --> Build
    Coverage --> Build

    Build -->|Yes| Docker
    Build -->|No| Alert

    Docker --> Registry
    Registry --> Deploy
    Deploy --> Health

    Health --> Success{Healthy?}
    Success -->|Yes| Complete["Deployment Complete"]
    Success -->|No| Rollback

    style Test fill:#4CAF50
    style Build fill:#2196F3
    style Deploy fill:#FF9800
    style Rollback fill:#F44336
```

---

## 📊 Monitoring & Observability

### Application Monitoring

```mermaid
graph TB
    subgraph "Application Metrics"
        CPU["CPU Usage"]
        Memory["Memory Usage"]
        Requests["Request Rate"]
        Errors["Error Rate"]
        Latency["Response Time"]
    end

    subgraph "Business Metrics"
        Tests["Tests Executed"]
        Success["Success Rate"]
        Healing["Self-Healing Rate"]
        Users["Active Users"]
        Scripts["Scripts Created"]
    end

    subgraph "Collection Layer"
        Winston["Winston Logging"]
        Prometheus["Prometheus Exporter"]
        Tracer["Distributed Tracing<br/>Jaeger/Zipkin"]
    end

    subgraph "Storage Layer"
        Logs["Log Files<br/>combined.log"]
        Metrics["Time Series DB<br/>Prometheus"]
        Traces["Trace Storage<br/>Elasticsearch"]
    end

    subgraph "Visualization Layer"
        Grafana["Grafana Dashboards"]
        Kibana["Kibana Logs"]
        JaegerUI["Jaeger UI"]
    end

    CPU --> Winston
    Memory --> Winston
    Requests --> Prometheus
    Errors --> Winston
    Latency --> Prometheus

    Tests --> Prometheus
    Success --> Winston
    Healing --> Winston
    Users --> Prometheus
    Scripts --> Winston

    Winston --> Logs
    Prometheus --> Metrics
    Tracer --> Traces

    Logs --> Grafana
    Logs --> Kibana
    Metrics --> Grafana
    Traces --> JaegerUI

    style CPU fill:#F44336
    style Memory fill:#2196F3
    style Requests fill:#4CAF50
    style Errors fill:#FF9800
    style Grafana fill:#FF6384
```

---

## 🔧 Development Workflow

### Development Architecture

```mermaid
graph TB
    subgraph "Local Development"
        DevEnv["Developer Machine<br/>VS Code + Git"]
        NodeDev["Node.js 20<br/>npm run dev"]
        ReactDev["Vite Dev Server<br/>Hot Module Reload"]
        TSX["TSX Watch<br/>Backend Hot Reload"]
    end

    subgraph "Local Services"
        LocalDB["PostgreSQL<br/>Docker Container"]
        LocalAI["AI Services<br/>Optional"]
    end

    subgraph "Development Tools"
        ESLint["ESLint<br/>Code Linting"]
        Prettier["Prettier<br/>Code Formatting"]
        Husky["Husky<br/>Git Hooks"]
        Jest["Jest<br/>Unit Testing"]
    end

    subgraph "Debugging"
        Chrome["Chrome DevTools"]
        VSCodeDebugger["VS Code Debugger"]
        Postman["Postman/Insomnia<br/>API Testing"]
    end

    DevEnv --> NodeDev
    DevEnv --> ReactDev
    DevEnv --> LocalDB

    NodeDev --> TSX
    ReactDev --> HMR["Hot Module Reload"]

    DevEnv --> ESLint
    DevEnv --> Prettier
    DevEnv --> Husky
    DevEnv --> Jest

    DevEnv --> Chrome
    DevEnv --> VSCodeDebugger
    DevEnv --> Postman

    style DevEnv fill:#61DAFB
    style NodeDev fill:#68A063
    style ReactDev fill:#42A5F5
```

---

## 📝 Summary

These detailed technical architecture diagrams cover:

✅ **Backend Architecture** - Layered design with middleware pipeline
✅ **Frontend Architecture** - React component hierarchy and state management
✅ **Database Design** - Schema, indexing, and query optimization
✅ **AI Services** - Python FastAPI services and OpenAI integration
✅ **WebSocket Communication** - Real-time bidirectional messaging
✅ **Request/Response Flow** - Complete request lifecycle
✅ **Error Handling** - Categorized error management
✅ **Caching Strategy** - Multi-layer caching with invalidation
✅ **Security Implementation** - Authentication, authorization, and middleware
✅ **Deployment Architecture** - Production, Docker, and CI/CD pipelines
✅ **Monitoring & Observability** - Metrics, logging, and visualization
✅ **Development Workflow** - Local development and tooling

These diagrams are **Confluence-ready** and can be used for:
- Technical documentation
- Architecture decision records
- Developer onboarding
- Stakeholder presentations
- System design reviews

---

**All diagrams use Mermaid syntax** - Compatible with:
- Confluence (Mermaid macro)
- GitHub/GitLab
- VS Code (Mermaid Preview)
- Markdown editors with Mermaid support
