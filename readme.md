# Server

## env guide
PORT=8899  
DATABASE_URL= ***  
JWT_SECRET= ***  
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

## service
|path |method |authen |params |query |body |
|:--  |:--  |:--  |:--  |:--  |:--  |
|api/auth/register |post | - | - | - |{identify, username, password, confirmPassword}
|api/auth/login |post |- |- |- |{identity, password}
|api/auth/getCurrentUser |get |y |- |- |-
|api/user/profile |put |y |- |- |{image(file)}
|api/user/challenge |post |y |- |- |{userId, name, weightCurrent, heightCurrent, weightTarget, age, periodWeek}
|api/user/weeklyPlan |post |y |- |- |{challengeId, week, breakfast, lunch,    dinner, snack, calories, exerciseType, exerciseFrequency, exerciseDuration, targetWeight}
|api/user/challenge |get |y |- |- |
|api/user/challenge |get |y |:id |- |- |
|api/user/challenge |delete |y |:id |- |-|
|api/user/challenge |put |y |:id |- |{status}
|api/user/challenge |put |y |:id |- |{weightResult}


