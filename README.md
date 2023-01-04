## Usage

1. seed database: `npm run seed`
2. run server: `npm run dev`

### Login

1. `npm i passport passport-local`
2. route: `POST api/users/login/password`

   - req.body

     ```
     {
         "email": "john@example.com",
         "password": "123456"
     }
     ```

   - response →`{session:false}` send token in response

     ```jsx
     {
         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFiNjFjNjQ2LThjODQtNDZjOC05Mjg4LTRjMTRhYzNlMGQ1YSIsImlhdCI6MTY3Mjg1ODI1OH0.IV_dUMDxJCYJ-GFghkqCR18F5Idu4BxCysWzTfNRlBk",
         "user": {
             "id": "1b61c646-8c84-46c8-9288-4c14ac3e0d5a",
             "name": "John",
             "email": "john@example.com",
             "role": "user",
             "active": true,
             "createdAt": "2023-01-04T18:06:21.046Z",
             "updatedAt": "2023-01-04T18:06:21.046Z"
         }
     }
     ```

### Add Protected middlware

1. `npm i passport-jwt`
2. add protect middlware before protected routes, add user instance to req.user

   ```jsx
   const { protect, restrictTo } = require("../controllers/authController");
   router
     .route("/")
     .get(protect, getAllProduct)
     .post(protect, restrictTo("admin"), createNewProduct);
   ```

### Logout

- route: `POST api/users/logout`
- this is a protected route, you need to add Bearer token in header
- store the token in response as the latest token

  ```json
  {
    "token": "logout",
    "message": "You have logout successfully."
  }
  ```
