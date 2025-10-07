# FraudShield API Documentation

## Base URL

## Authentication
All protected routes require a JWT token in the Authorization header:

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
  {
  "status": "success",
  "message": "User registered successfully",
  "data": 
  {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```
git log -n 1 --format=%ad --date=short HEAD
git checkout -- .
