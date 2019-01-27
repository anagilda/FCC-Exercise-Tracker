# Exercise Tracker REST API

#### A microservice project, part of Free Code Camp's curriculum
[FreeCodeCamp](https://www.freecodecamp.org/)
#### See this project live on [Glitch](https://deep-icecream.glitch.me/)

### User Stories

1. I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
2. I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
3. I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will the the user object with also with the exercise fields added.
4. I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).
5. I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)


#### Usage:

- POST [project_url]/api/exercise/new-user - body (username encoded) 

- POST [project_url]/api/exercise/add - body (userId, duration, description and date encoded)


- GET all users: GET /api/exercise/users

Example Usage: [[base_url]/api/exercise/users](https://deep-icecream.glitch.me/api/exercise/users)


- GET users's exercise log: GET /api/exercise/log?{userId}[&from][&to][&limit]

{ } = required, [ ] = optional

from, to = dates (yyyy-mm-dd); limit = number

Example Usage: [[base_url]/api/exercise/log?userId=5c4b4e39a986ca1f11063a9f&from=2018-07-01&to=2018-12-31&limit=2](https://deep-icecream.glitch.me/api/exercise/log?userId=5c4b4e39a986ca1f11063a9f&from=2018-07-01&to=2018-12-31&limit=2)
