# FraudShield End-to-End Workflow

## Overview
This document outlines the complete workflow of FraudShield, from transaction submission to resolution, highlighting interactions between components and user roles.

## Workflow Diagram
```mermaid
graph TD
    A[Transaction Submitted<br/>by Customer] --> B[Fraud Detection Engine<br/>(DSA Algorithms: Priority Queue, Graph, Sliding Window)]
    B --> C[Risk Score Calculated<br/>(0-100)]
    C --> D{Score >= 75?}
    D -->|Yes| E[Priority Queue<br/>for Admin Review]
    D -->|No| F[Transaction Approved<br/>Safe]
    E --> G[Admin/Analyst Reviews<br/>via Dashboard]
    G --> H[Decision: Safe/Fraud<br/>Update Database]
    H --> I[Real-Time Updates<br/>via Firebase]
    I --> J[Customer Notified<br/>if Fraudulent]
    F --> I
    J --> K[End]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style E fill:#fce4ec
    style G fill:#f3e5f5
    style J fill:#e8f5e8
```

## Step-by-Step Workflow

1. **Transaction Submission**
   - **Description**: A customer (e.g., bank user or e-commerce shopper) submits a transaction via the frontend or API.
   - **User Comments**:
     - **Customer**: Initiates the process; expects quick approval or feedback.
     - **Admin/Analyst**: Monitors submission logs for patterns; ensures system handles load.

2. **Fraud Detection Engine**
   - **Description**: Backend runs DSA algorithms (Priority Queue, Graph Traversal, Sliding Window) to analyze the transaction against blacklists, networks, and velocity checks.
   - **User Comments**:
     - **Customer**: Unaware of internal processing; benefits from fast, invisible checks.
     - **Analyst**: Can view algorithm outputs in dashboards for debugging or tuning.
     - **Admin**: Configures thresholds and reviews flagged items from this step.

3. **Risk Score Calculation**
   - **Description**: System computes a risk score (0-100) based on factors like IP, amount, and patterns; stores in MongoDB.
   - **User Comments**:
     - **Customer**: Receives real-time status updates if integrated into their app.
     - **Analyst**: Analyzes scores for false positive/negative rates.
     - **Admin**: Sets scoring rules and monitors overall system accuracy.

4. **Decision Branch**
   - **Description**: If score >= 75, route to priority queue; else, approve as safe.
   - **User Comments**:
     - **Customer**: High-risk transactions may require additional verification, improving security.
     - **Analyst/Admin**: Ensures high-risk items are prioritized for manual review.

5. **Priority Queue for Review**
   - **Description**: High-risk transactions are enqueued in a min-heap for admins/analysts.
   - **User Comments**:
     - **Analyst/Admin**: Reviews top items first; prevents backlog of critical cases.

6. **Admin/Analyst Review**
   - **Description**: Dashboard displays details; user decides safe/fraud and updates status in database.
   - **User Comments**:
     - **Analyst**: Conducts detailed investigation using graphs and logs.
     - **Admin**: Oversees decisions and escalates if needed.

7. **Real-Time Updates**
   - **Description**: Changes sync to Firebase for live dashboard updates across users.
   - **User Comments**:
     - **Customer**: Gets instant notifications if transaction is flagged.
     - **Analyst/Admin**: Sees live stats and alerts without refreshing.

8. **Notification and End**
   - **Description**: Customer is notified if fraudulent; process ends with resolution.
   - **User Comments**:
     - **Customer**: Receives clear feedback, enhancing trust.
     - **Admin**: Tracks resolution metrics for reporting.

This workflow ensures efficient, secure, and user-friendly fraud detection across all roles.
